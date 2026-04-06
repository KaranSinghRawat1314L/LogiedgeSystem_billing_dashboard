import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService, itemService, invoiceService } from '../services/api';
import { Loader, Alert, formatCurrency } from '../components/UI';

const EMPTY_LINE = { item_id: '', quantity: 1, unit_price: 0, line_total: 0, item_name: '' };

export default function Billing() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [lineItems, setLineItems] = useState([{ ...EMPTY_LINE }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([customerService.getAll(), itemService.getAll()])
      .then(([c, i]) => { setCustomers(c); setItems(i); })
      .catch(() => setError('Failed to load master data'))
      .finally(() => setLoading(false));
  }, []);

  const handleCustomerChange = (e) => {
    const cust = customers.find(c => c.id === parseInt(e.target.value));
    setSelectedCustomer(cust || null);
    setError('');
  };

  const handleItemChange = (idx, itemId) => {
    const item = items.find(i => i.id === parseInt(itemId));
    setLineItems(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        item_id: itemId,
        unit_price: item ? parseFloat(item.unit_price) : 0,
        item_name: item ? item.name : '',
        line_total: item ? parseFloat(item.unit_price) * updated[idx].quantity : 0,
      };
      return updated;
    });
  };

  const handleQtyChange = (idx, qty) => {
    const q = Math.max(1, parseInt(qty) || 1);
    setLineItems(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        quantity: q,
        line_total: updated[idx].unit_price * q,
      };
      return updated;
    });
  };

  const addLine = () => setLineItems(prev => [...prev, { ...EMPTY_LINE }]);

  const removeLine = (idx) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = lineItems.reduce((sum, li) => sum + (li.line_total || 0), 0);
  const gstApplied = selectedCustomer && !selectedCustomer.gst_registered;
  const gstAmount = gstApplied ? subtotal * 0.18 : 0;
  const total = subtotal + gstAmount;

  const handleSubmit = async () => {
    setError('');
    if (!selectedCustomer) return setError('Please select a customer');
    const validLines = lineItems.filter(li => li.item_id && li.quantity > 0);
    if (validLines.length === 0) return setError('Please add at least one item');
    const hasEmpty = lineItems.some(li => !li.item_id);
    if (hasEmpty) return setError('Please select an item for all rows, or remove empty rows');

    setSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomer.id,
        items: validLines.map(li => ({ item_id: parseInt(li.item_id), quantity: li.quantity })),
        notes,
      };
      const result = await invoiceService.create(payload);
      setSuccess(`Invoice ${result.data.invoice_id} created successfully!`);
      setTimeout(() => navigate(`/invoices/${result.data.invoice_id}`), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><div className="page-header"><h1 className="page-title">New Invoice</h1></div><div className="page-body"><Loader /></div></>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Invoice</h1>
          <p className="page-subtitle">Generate a billing invoice for customer</p>
        </div>
      </div>
      <div className="page-body">
        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="card mb-24">
          <div className="card-title">Step 1 — Select a Customer</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Customer <span className="required">*</span></label>
              <select
                className="form-control"
                value={selectedCustomer?.id || ''}
                onChange={handleCustomerChange}
              >
                <option value="">— Choose customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCustomer && (
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <div style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{selectedCustomer.email}</div>
                  {selectedCustomer.city && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {selectedCustomer.city}, {selectedCustomer.state}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    {selectedCustomer.gst_registered ? (
                      <span className="badge badge-green">GST Registered · {selectedCustomer.gstin}</span>
                    ) : (
                      <span className="badge badge-warn">Not GST Registered · 18% GST will apply</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-title">Step 2 — Select Items</div>

          <div className="item-row item-row-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Unit Price</span>
            <span style={{ textAlign: 'right' }}>Line Total</span>
            <span></span>
          </div>

          {lineItems.map((li, idx) => (
            <div className="item-row" key={idx}>
              <select
                className="form-control"
                value={li.item_id}
                onChange={e => handleItemChange(idx, e.target.value)}
              >
                <option value="">— Select item —</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit || 'pcs'})
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="form-control"
                min="1"
                value={li.quantity}
                onChange={e => handleQtyChange(idx, e.target.value)}
              />

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--text2)',
                padding: '10px 12px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}>
                {li.unit_price ? formatCurrency(li.unit_price) : '—'}
              </div>

              <div className="line-total" style={{ textAlign: 'right' }}>
                {li.line_total ? formatCurrency(li.line_total) : '—'}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => removeLine(idx)}
                disabled={lineItems.length === 1}
                title="Remove row"
                style={{ color: 'var(--danger)', padding: '6px 8px' }}
              >
                ✕
              </button>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={addLine}>
              + Add Item
            </button>
          </div>
        </div>

        <div className="flex gap-24" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div className="card">
              <div className="card-title">Notes (Optional)</div>
              <textarea
                className="form-control"
                placeholder="Add any notes or payment instructions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div>
            <div className="summary-box">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
                Invoice Summary
              </div>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatCurrency(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">
                  GST {gstApplied ? '(18%)' : '(Exempt)'}
                </span>
                <span className="summary-value" style={{ color: gstApplied ? 'var(--warn)' : 'var(--accent2)' }}>
                  {gstApplied ? formatCurrency(gstAmount) : '—'}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <button
                className="btn btn-primary w-full"
                style={{ marginTop: 16, justifyContent: 'center' }}
                onClick={handleSubmit}
                disabled={submitting || !selectedCustomer || lineItems.every(li => !li.item_id)}
              >
                {submitting ? 'Generating...' : '⊕ Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
