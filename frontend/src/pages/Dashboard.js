import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { Loader, Badge, formatCurrency, formatDate } from '../components/UI';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    invoiceService.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><div className="page-header"><div><h1 className="page-title">Dashboard</h1></div></div><div className="page-body"><Loader /></div></>;

  const s = stats?.stats || {};
  const recent = stats?.recent_invoices || [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your billing operations</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/billing')}>
          ⊕ &nbsp;New Invoice
        </button>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value accent">{s.total_invoices || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value green">{formatCurrency(s.total_revenue || 0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">GST Collected</div>
            <div className="stat-value warn">{formatCurrency(s.total_gst || 0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Customers Billed</div>
            <div className="stat-value">{s.total_customers_billed || 0}</div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="flex justify-between items-center mb-16">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Invoices</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/invoices')}>View all →</button>
          </div>
          {recent.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              No invoices yet. <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/billing')}>Create one</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>GST</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(inv => (
                    <tr key={inv.invoice_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.invoice_id}`)}>
                      <td><span className="invoice-id">{inv.invoice_id}</span></td>
                      <td>{inv.customer_name}</td>
                      <td>
                        {inv.gst_applied
                          ? <Badge type="warn">18% GST</Badge>
                          : <Badge type="green">GST Exempt</Badge>}
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatCurrency(inv.total_amount)}</td>
                      <td style={{ color: 'var(--text2)' }}>{formatDate(inv.created_at)}</td>
                      <td><button className="btn btn-ghost btn-sm">→</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
