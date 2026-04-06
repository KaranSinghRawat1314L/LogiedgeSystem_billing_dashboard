import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCustomers, fetchItems, createInvoice } from "../services/api";

function SelectCustomerDialog({ customers, onSelect, onCancel }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <div className="dialog-header">
          <h2 className="dialog-title">Select Customer</h2>
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="dialog-cards-grid">
          {customers.map((customer) => {
            const isActive = customer.status === "Active";
            return (
              <div
                key={customer.id}
                className={"master-card" + (isActive ? "" : " inactive-card")}
                onClick={() => isActive && onSelect(customer)}
                style={{ cursor: isActive ? "pointer" : "not-allowed" }}
              >
                <div className="master-card-name">{customer.name}</div>
                <span
                  className={
                    isActive ? "badge badge-active" : "badge badge-inactive"
                  }
                >
                  {customer.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SelectItemsDialog({ items, onConfirm, onCancel }) {
  const [selected, setSelected] = useState({});

  const handleAdd = (item) => {
    setSelected((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleIncrease = (itemId) => {
    setSelected((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
  };

  const handleDecrease = (itemId) => {
    setSelected((prev) => {
      const newQty = prev[itemId] - 1;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleConfirm = () => {
    const selectedList = Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([item_id, quantity]) => {
        const item = items.find((i) => String(i.id) === String(item_id));
        return { item_id: parseInt(item_id), quantity, item };
      });

    if (selectedList.length === 0) {
      alert("Please select at least one item");
      return;
    }
    onConfirm(selectedList);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <div className="dialog-header">
          <h2 className="dialog-title">Select Items</h2>
        </div>
        <div className="dialog-cards-grid">
          {items.map((item) => {
            const isActive = item.status === "Active";
            const qty = selected[item.id] || 0;

            return (
              <div
                key={item.id}
                className={
                  "item-select-card" + (isActive ? "" : " inactive-card")
                }
              >
                <div className="item-card-name">{item.name}</div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  ₹{Number(item.selling_price).toLocaleString("en-IN")}
                </div>
                <div className="item-card-bottom">
                  {!isActive ? (
                    <span className="badge badge-inactive">In-Active</span>
                  ) : qty > 0 ? (
                    <div className="qty-stepper">
                      <button onClick={() => handleIncrease(item.id)}>+</button>
                      <span className="qty-value">{qty}</span>
                      <button onClick={() => handleDecrease(item.id)}>−</button>
                    </div>
                  ) : (
                    <button
                      className="btn-item-add"
                      onClick={() => handleAdd(item)}
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="dialog-footer">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billingItems, setBillingItems] = useState([]);
  const [showSelectCustomer, setShowSelectCustomer] = useState(false);
  const [showSelectItems, setShowSelectItems] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchItems()])
      .then(([custs, itms]) => {
        setCustomers(custs);
        setItems(itms);
      })
      .catch(() => setApiError("Failed to load data"))
      .finally(() => setLoadingData(false));
  }, []);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setBillingItems([]);
    setCreatedInvoice(null);
    setApiError("");
    setShowSelectCustomer(false);
  };

  const handleItemsConfirmed = (selectedList) => {
    setBillingItems(selectedList);
    setShowSelectItems(false);
  };

  const handleQtyChange = (itemId, delta) => {
    setBillingItems((prev) =>
      prev
        .map((li) =>
          li.item_id === itemId ? { ...li, quantity: li.quantity + delta } : li
        )
        .filter((li) => li.quantity > 0)
    );
  };

  const subtotal = billingItems.reduce(
    (sum, li) => sum + parseFloat(li.item.selling_price) * li.quantity,
    0
  );

  const isGSTRegistered = selectedCustomer && selectedCustomer.gst_number;
  const gstAmount = isGSTRegistered ? 0 : subtotal * 0.18;
  const totalAmount = subtotal + gstAmount;

  const formatAmount = (n) =>
    Number(n).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  const handleCancel = () => {
    setSelectedCustomer(null);
    setBillingItems([]);
    setCreatedInvoice(null);
    setApiError("");
  };

  const handleCreate = async () => {
    if (!selectedCustomer) {
      setApiError("Please select a customer first");
      return;
    }
    if (billingItems.length === 0) {
      setApiError("Please add at least one item");
      return;
    }
    setSaving(true);
    setApiError("");
    try {
      const result = await createInvoice({
        customer_id: selectedCustomer.id,
        items: billingItems.map((li) => ({
          item_id: li.item_id,
          quantity: li.quantity,
        })),
      });
      setCreatedInvoice(result.data);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <p className="loading-text">Loading billing data...</p>;
  if (createdInvoice) {
    return (
      <div>
        <h1 className="page-title">Billing</h1>
        <div className="billing-section">
          <div
            className="billing-section-header selected"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>Customer Details</span>
            <span className="invoice-id-display">
              Invoice ID: <strong>{createdInvoice.invoice_id}</strong>
            </span>
          </div>
          <div className="billing-section-body">
            <div className="customer-info-row">
              <span className="info-label">Name</span>
              <span className="colon">:</span>
              <span className="info-value">{createdInvoice.customer_name}</span>
            </div>
            <div className="customer-info-row">
              <span className="info-label">Address</span>
              <span className="colon">:</span>
              <span className="info-value">{createdInvoice.customer_address}</span>
            </div>
            <div className="customer-info-row">
              <span className="info-label">Pan Card</span>
              <span className="colon">:</span>
              <span className="info-value">{createdInvoice.customer_pan}</span>
            </div>
            <div className="customer-info-row">
              <span className="info-label">GST Num</span>
              <span className="colon">:</span>
              <span className="info-value">
                {createdInvoice.customer_gst || (
                  <span style={{ color: "#888", fontWeight: 400 }}>
                    N/A (18% GST Applied)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
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
                {createdInvoice.items.map((li) => (
                  <tr key={li.item_id}>
                    <td>{li.item_name}</td>
                    <td style={{ textAlign: "center" }}>{li.quantity}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatAmount(li.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {createdInvoice.gst_rate > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0 0",
                  fontSize: 13,
                  color: "#555",
                  borderTop: "1px solid #eee",
                }}
              >
                <span>GST ({createdInvoice.gst_rate}%)</span>
                <span style={{ fontWeight: 600 }}>
                  + {formatAmount(createdInvoice.gst_amount)}
                </span>
              </div>
            )}
            <div className="billing-total-row">
              <span>Total</span>
              <span>{formatAmount(createdInvoice.total_amount)}</span>
            </div>
          </div>
        </div>
        <div className="billing-actions">
          <button className="btn btn-cancel" onClick={handleCancel}>
            New Invoice
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Billing</h1>

      {apiError && (
        <p style={{ color: "#e74c3c", marginBottom: 12, fontSize: 13 }}>
          {apiError}
        </p>
      )}

      <div className="billing-section">
        <div
          className={"billing-section-header" + (selectedCustomer ? " selected" : "")}
        >
          Customer Details
        </div>
        <div className="billing-section-body">
          {!selectedCustomer ? (
            <div className="add-btn-center">
              <button
                className="btn-add"
                onClick={() => setShowSelectCustomer(true)}
              >
                <span className="btn-add-circle">+</span>
                ADD
              </button>
            </div>
          ) : (
            <div>
              <div className="customer-info-row">
                <span className="info-label">Name</span>
                <span className="colon">:</span>
                <span className="info-value">{selectedCustomer.name}</span>
              </div>
              <div className="customer-info-row">
                <span className="info-label">Address</span>
                <span className="colon">:</span>
                <span className="info-value">{selectedCustomer.address}</span>
              </div>
              <div className="customer-info-row">
                <span className="info-label">Pan Card</span>
                <span className="colon">:</span>
                <span className="info-value">{selectedCustomer.pan_number}</span>
              </div>
              <div className="customer-info-row">
                <span className="info-label">GST Num</span>
                <span className="colon">:</span>
                <span className="info-value">
                  {selectedCustomer.gst_number || (
                    <span style={{ color: "#888", fontWeight: 400 }}>
                      N/A (18% GST will be applied)
                    </span>
                  )}
                </span>
              </div>
              <button
                className="btn btn-cancel"
                style={{ marginTop: 12, fontSize: 12, padding: "5px 14px" }}
                onClick={() => setShowSelectCustomer(true)}
              >
                Change Customer
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="billing-section">
          <div className="billing-section-header">Items</div>
          <div className="billing-section-body">
            {billingItems.length === 0 ? (
              <div className="add-btn-center">
                <button
                  className="btn-add"
                  onClick={() => setShowSelectItems(true)}
                >
                  <span className="btn-add-circle">+</span>
                  ADD
                </button>
              </div>
            ) : (
              <>
                <table className="billing-items-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th style={{ textAlign: "center" }}>Quantity</th>
                      <th style={{ textAlign: "right" }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingItems.map((li) => {
                      const lineTotal =
                        parseFloat(li.item.selling_price) * li.quantity;
                      return (
                        <tr key={li.item_id}>
                          <td>{li.item.name}</td>
                          <td style={{ textAlign: "center" }}>
                            <div
                              className="qty-stepper"
                              style={{ display: "inline-flex" }}
                            >
                              <button onClick={() => handleQtyChange(li.item_id, 1)}>
                                +
                              </button>
                              <span className="qty-value">{li.quantity}</span>
                              <button onClick={() => handleQtyChange(li.item_id, -1)}>
                                −
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {formatAmount(lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!isGSTRegistered && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0 0",
                      fontSize: 13,
                      color: "#555",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <span>GST (18%)</span>
                    <span style={{ fontWeight: 600 }}>+ {formatAmount(gstAmount)}</span>
                  </div>
                )}
                <div className="billing-total-row">
                  <span>Total</span>
                  <span>{formatAmount(totalAmount)}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    className="btn btn-cancel"
                    style={{ fontSize: 12, padding: "5px 14px" }}
                    onClick={() => setShowSelectItems(true)}
                  >
                    + Add More Items
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedCustomer && billingItems.length > 0 && (
        <div className="billing-actions">
          <button className="btn btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {showSelectCustomer && (
        <SelectCustomerDialog
          customers={customers}
          onSelect={handleSelectCustomer}
          onCancel={() => setShowSelectCustomer(false)}
        />
      )}

      {showSelectItems && (
        <SelectItemsDialog
          items={items}
          onConfirm={handleItemsConfirmed}
          onCancel={() => setShowSelectItems(false)}
        />
      )}
    </div>
  );
}
