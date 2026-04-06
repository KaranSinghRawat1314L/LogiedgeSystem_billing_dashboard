import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCustomers } from "../services/api";

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers()
      .then(setCustomers)
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header-row">
        <h1 className="page-title" style={{ margin: 0 }}>CUSTOMERS</h1>
        <button
          className="btn-add"
          onClick={() => navigate("/master/customers/add")}
        >
          <span className="btn-add-circle">+</span>
          ADD
        </button>
      </div>

      {error && <p style={{ color: "#e74c3c", fontSize: 13 }}>{error}</p>}
      {loading && <p className="loading-text">Loading customers...</p>}

      {!loading && customers.length === 0 && (
        <div className="empty-state">
          No customers yet. Click ADD to create one.
        </div>
      )}

      {!loading && customers.length > 0 && (
        <div className="cards-grid">
          {customers.map((customer) => (
            <div key={customer.id} className="master-card">
              <div className="master-card-name">{customer.name}</div>
              <span
                className={
                  customer.status === "Active"
                    ? "badge badge-active"
                    : "badge badge-inactive"
                }
              >
                {customer.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
