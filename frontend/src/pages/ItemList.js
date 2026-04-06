import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchItems } from "../services/api";

export default function ItemList() {
  const navigate = useNavigate();

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch(() => setError("Failed to load items"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header row with ADD button */}
      <div className="page-header-row">
        <h1 className="page-title" style={{ margin: 0 }}>ITEMS</h1>
        <button
          className="btn-add"
          onClick={() => navigate("/master/items/add")}
        >
          <span className="btn-add-circle">+</span>
          ADD
        </button>
      </div>

      {error   && <p style={{ color: "#e74c3c", fontSize: 13 }}>{error}</p>}
      {loading && <p className="loading-text">Loading items...</p>}

      {!loading && items.length === 0 && (
        <div className="empty-state">No items yet. Click ADD to create one.</div>
      )}

      {/* 3-column card grid (matches mockup image6) */}
      {!loading && items.length > 0 && (
        <div className="cards-grid">
          {items.map((item) => (
            <div key={item.id} className="master-card">
              <div className="master-card-name">{item.name}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: "auto" }}>
                ₹{Number(item.selling_price).toLocaleString("en-IN")}
              </div>
              <span
                className={
                  item.status === "Active"
                    ? "badge badge-active"
                    : "badge badge-inactive"
                }
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
