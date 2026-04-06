import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { Loader, Alert, Badge, formatCurrency, formatDate } from '../components/UI';

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    invoiceService.getById(invoiceId)
      .then(setInvoice)
      .catch(() => setError('Invoice not found'))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) return <div className="page-body"><Loader /></div>;
  if (error) return (
    <div className="page-body">
      <Alert type="error">{error}</Alert>
      <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>← Back to Invoices</button>
    </div>
  );

  const inv = invoice;

  return (
    <>
      <div className="page-header no-print">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>
            ← Back
          </button>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="invoice-id" style={{ fontSize: 26 }}>{inv.invoice_id}</span>
          </h1>
          <p className="page-subtitle">Generated on {formatDate(inv.created_at)}</p>
        </div>
        <div className="flex gap-12">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            ⎙ Print / Export
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/billing')}>
            ⊕ New Invoice
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Invoice Card */}
        <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Header */}
          <div className="invoice-detail-header">
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                Logi<span style={{ color: 'var(--accent)' }}>Edge</span> Systems
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }}>
                Tax Invoice
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="invoice-id" style={{ fontSize: 20 }}>{inv.invoice_id}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Date: {formatDate(inv.created_at)}</div>
              <div style={{ marginTop: 8 }}>
                {inv.gst_applied
                  ? <Badge type="warn">GST Applied (18%)</Badge>
                  : <Badge type="green">GST Exempt</Badge>}
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Bill To */}
          <div className="flex gap-24 mb-24" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                Bill To
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{inv.customer_name}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>{inv.customer_email}</div>
              {inv.customer_phone && <div style={{ color: 'var(--text2)', fontSize: 13 }}>{inv.customer_phone}</div>}
              {inv.customer_address && (
                <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  {inv.customer_address}<br />
                  {inv.customer_city && `${inv.customer_city}, `}{inv.customer_state} {inv.customer_pincode}
                </div>
              )}
              {inv.gstin && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent2)', marginTop: 6 }}>
                  GSTIN: {inv.gstin}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                Amount Due
              </div>
              <div className="invoice-amount-big">{formatCurrency(inv.total_amount)}</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.line_items && inv.line_items.map((li, idx) => (
                  <tr key={li.id}>
                    <td style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{li.item_name}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {formatCurrency(li.unit_price)}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{li.quantity}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent2)' }}>
                      {formatCurrency(li.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 300 }}>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatCurrency(inv.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">
                  GST {inv.gst_applied ? `(${inv.gst_rate}%)` : '(Not Applicable)'}
                </span>
                <span className="summary-value" style={{ color: inv.gst_applied ? 'var(--warn)' : 'var(--text3)' }}>
                  {inv.gst_applied ? formatCurrency(inv.gst_amount) : '₹0.00'}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>{formatCurrency(inv.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {inv.notes && (
            <>
              <hr className="divider" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                  Notes
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>{inv.notes}</div>
              </div>
            </>
          )}

          <hr className="divider" />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center', letterSpacing: 0.5 }}>
            Thank you for your business · LogiEdge Systems
          </div>
        </div>
      </div>
    </>
  );
}
