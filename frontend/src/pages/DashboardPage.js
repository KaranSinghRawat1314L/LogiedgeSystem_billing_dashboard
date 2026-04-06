import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllInvoices, fetchCustomers, fetchInvoicesByCustomer } from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [allInvoices, setAllInvoices]     = useState([]);
  const [customers,   setCustomers]       = useState([]);
  const [searchId,    setSearchId]        = useState("");
  const [filterCust,  setFilterCust]      = useState("");   // customer id filter
  const [loading,     setLoading]         = useState(true);
  const [searchError, setSearchError]     = useState("");

  // Load invoices and customer list on mount
  useEffect(() => {
    Promise.all([fetchAllInvoices(), fetchCustomers()])
      .then(([invoices, custs]) => {
        setAllInvoices(invoices);
        setCustomers(custs);
      })
      .catch(() => setSearchError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // When customer filter changes, fetch that customer's invoices
  const handleCustomerFilter = async (e) => {
    const custId = e.target.value;
    setFilterCust(custId);
    setSearchId("");
    setSearchError("");
    setLoading(true);
    try {
      if (custId === "") {
        const data = await fetchAllInvoices();
        setAllInvoices(data);
      } else {
        const data = await fetchInvoicesByCustomer(custId);
        setAllInvoices(data);
      }
    } catch {
      setSearchError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Filter displayed rows by search ID (client-side)
  const displayedInvoices = searchId.trim()
    ? allInvoices.filter((inv) =>
        inv.invoice_id.toLowerCase().includes(searchId.trim().toLowerCase())
      )
    : allInvoices;

  // Format amount in Indian Rupees
  const formatAmount = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* ---- Filters row ---- */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>

        {/* Search by Invoice ID */}
        <div className="search-bar" style={{ margin: 0 }}>
          <input
            type="text"
            placeholder="Search by Invoice ID"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setSearchError("");
            }}
          />
        </div>

        {/* Filter by Customer */}
        <select
          className="form-select"
          style={{ padding: "10px 14px", minWidth: "200px" }}
          value={filterCust}
          onChange={handleCustomerFilter}
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ---- Error ---- */}
      {searchError && (
        <p style={{ color: "#e74c3c", marginBottom: "12px", fontSize: "13px" }}>
          {searchError}
        </p>
      )}

      {/* ---- Invoices Table ---- */}
      {loading ? (
        <p className="loading-text">Loading invoices...</p>
      ) : displayedInvoices.length === 0 ? (
        <div className="empty-state">
          {searchId
            ? `No invoice found with ID "${searchId}"`
            : filterCust
            ? "No invoices found for this customer."
            : "No invoices yet. Go to Billing to create one."}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer Name</th>
              <th>Item Name(s)</th>
              <th>Amount (₹)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedInvoices.map((inv) => (
              <tr key={inv.invoice_id}>
                <td style={{ fontWeight: 600 }}>{inv.invoice_id}</td>
                <td>{inv.customer_name}</td>
                <td>{inv.item_names ? inv.item_names.join(", ") : "—"}</td>
                <td style={{ fontWeight: 600 }}>{formatAmount(inv.total_amount)}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/invoice/${inv.invoice_id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
