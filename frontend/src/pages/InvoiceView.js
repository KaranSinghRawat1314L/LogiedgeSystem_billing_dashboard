import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInvoiceById } from "../services/api";

export default function InvoiceView() {
  const { invoiceId } = useParams();
  const navigate      = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetchInvoiceById(invoiceId)
      .then(setInvoice)
      .catch(() => setError("Invoice not found"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const formatAmount = (n) =>
    Number(n).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  if (loading) return <p className="loading-text">Loading invoice...</p>;
  if (error)   return (
    <div>
      <p style={{ color: "#e74c3c", marginBottom: 16 }}>{error}</p>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button
          className="btn btn-cancel"
          style={{ padding: "7px 18px" }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Invoice Details</h1>
      </div>

      {/* Customer Details card — with Invoice ID top-right (matches image13) */}
      <div className="billing-section">
        <div className="billing-section-header selected invoice-detail-header">
          <span>Customer Details</span>
          <span className="invoice-id-display">
            Invoice ID: <strong>{invoice.invoice_id}</strong>
          </span>
        </div>
        <div className="billing-section-body">
          <div className="customer-info-row">
            <span className="info-label">Name</span>
            <span className="colon">:</span>
            <span className="info-value">{invoice.customer_name}</span>
          </div>
          <div className="customer-info-row">
            <span className="info-label">Address</span>
            <span className="colon">:</span>
            <span className="info-value">{invoice.customer_address}</span>
          </div>
          <div className="customer-info-row">
            <span className="info-label">Pan Card</span>
            <span className="colon">:</span>
            <span className="info-value">{invoice.customer_pan}</span>
          </div>
          <div className="customer-info-row">
            <span className="info-label">GST Num</span>
            <span className="colon">:</span>
            <span className="info-value">
              {invoice.customer_gst ? invoice.customer_gst : (
                <span style={{ color: "#888", fontWeight: 400 }}>N/A (18% GST Applied)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Items section */}
      <div className="billing-section">
        <div className="billing-section-header">Items</div>
        <div className="billing-section-body">
          <table className="billing-items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: "center" }}>Quantity</th>
                <th style={{ textAlign: "right" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {formatAmount(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* GST row (only if applied) */}
          {invoice.gst_rate > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0 0",
                fontSize: "13px",
                color: "#555",
                borderTop: "1px solid #eee",
                marginTop: "4px",
              }}
            >
              <span>GST ({invoice.gst_rate}%)</span>
              <span style={{ fontWeight: 600 }}>
                + {formatAmount(invoice.gst_amount)}
              </span>
            </div>
          )}

          {/* Total row */}
          <div className="billing-total-row">
            <span>Total</span>
            <span>{formatAmount(invoice.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
