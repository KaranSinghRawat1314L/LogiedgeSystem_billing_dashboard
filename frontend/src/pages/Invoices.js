import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, customerService } from '../services/api';
import { Loader, Badge, EmptyState, Alert, formatCurrency, formatDate } from '../components/UI';

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchId, setSearchId] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const loadInvoices = useCallback((customerId) => {
    setLoading(true);
    const fetchFn = customerId
      ? invoiceService.getByCustomer(customerId)
      : invoiceService.getAll({ limit: 100 });

    fetchFn
      .then(setInvoices)
      .catch(() => setError('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    customerService.getAll().then(setCustomers).catch(console.error);
    loadInvoices('');
  }, [loadInvoices]);

  const handleCustomerFilter = (e) => {
    const val = e.target.value;
    setFilterCustomer(val);
    setSearchResult(null);
    setSearchError('');
    loadInvoices(val);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const inv = await invoiceService.getById(searchId.trim().toUpperCase());
      setSearchResult(inv);
    } catch {
      setSearchError(`No invoice found with ID "${searchId.toUpperCase()}"`);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setSearchResult(null);
    setSearchError('');
  };

  const displayedInvoices = searchResult ? [searchResult] : invoices;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">View, search, and manage all invoices</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/billing')}>
          ⊕ &nbsp;New Invoice
        </button>
      </div>

      <div className="page-body">
        {error && <Alert type="error">{error}</Alert>}

        {/* Search + Filter Bar */}
        <div className="card mb-24 card-sm">
          <div className="flex gap-12 items-center" style={{ flexWrap: 'wrap' }}>
            {/* Search by Invoice ID */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="search-bar">
                <div className="search-input-wrap" style={{ flex: 1 }}>
                  <span className="search-icon">⌕</span>
                  <input
                    className="form-control"
                    placeholder="Search by Invoice ID (e.g. INVC224830)"
                    value={searchId}
                    onChange={e => { setSearchId(e.target.value); if (!e.target.value) clearSearch(); }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={searching || !searchId.trim()}>
                  {searching ? '...' : 'Search'}
                </button>
                {(searchResult || searchError) && (
                  <button className="btn btn-ghost btn-sm" onClick={clearSearch}>Clear</button>
                )}
              </div>
            </div>

            {/* Customer filter — only when not in search mode */}
            {!searchResult && !searchError && (
              <div style={{ minWidth: 220 }}>
                <select
                  className="form-control"
                  value={filterCustomer}
                  onChange={handleCustomerFilter}
                >
                  <option value="">All Customers</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {searchError && (
            <div style={{ marginTop: 10, color: 'var(--danger)', fontSize: 13 }}>
              ✕ &nbsp;{searchError}
            </div>
          )}
        </div>

        {/* Invoice Table */}
        {loading ? (
          <Loader />
        ) : displayedInvoices.length === 0 ? (
          <EmptyState
            icon="≡"
            title="No invoices found"
            subtitle={filterCustomer ? 'This customer has no invoices yet.' : 'Start by creating your first invoice.'}
            action={<button className="btn btn-primary" onClick={() => navigate('/billing')}>⊕ New Invoice</button>}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>GST</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedInvoices.map(inv => (
                  <tr
                    key={inv.invoice_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/invoices/${inv.invoice_id}`)}
                  >
                    <td><span className="invoice-id">{inv.invoice_id}</span></td>
                    <td style={{ fontWeight: 600 }}>{inv.customer_name}</td>
                    <td style={{ color: 'var(--text2)' }}>{formatDate(inv.created_at)}</td>
                    <td style={{ color: 'var(--text2)' }}>
                      {inv.line_items ? inv.line_items.length : '—'}
                    </td>
                    <td>
                      {inv.gst_applied
                        ? <Badge type="warn">18% Applied</Badge>
                        : <Badge type="green">Exempt</Badge>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent2)' }}>
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/invoices/${inv.invoice_id}`); }}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !searchResult && !searchError && invoices.length > 0 && (
          <div style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} {filterCustomer ? 'for selected customer' : 'total'}
          </div>
        )}
      </div>
    </>
  );
}
