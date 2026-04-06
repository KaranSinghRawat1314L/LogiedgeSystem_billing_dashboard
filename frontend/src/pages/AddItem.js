import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addItem } from "../services/api";

const INITIAL_FORM = {
  name:          "",
  selling_price: "",
  status:        "Active",
};

export default function AddItem() {
  const navigate = useNavigate();

  const [form,     setForm]     = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Item name is required";
    }
    if (form.selling_price === "" || form.selling_price === null) {
      errs.selling_price = "Selling price is required";
    } else if (isNaN(Number(form.selling_price)) || Number(form.selling_price) < 0) {
      errs.selling_price = "Enter a valid positive price";
    }
    return errs;
  };

  const handleCreate = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await addItem({
        name:          form.name.trim(),
        selling_price: parseFloat(form.selling_price),
        status:        form.status,
      });
      navigate("/master/items");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/master/items");

  return (
    <div>
      <h1 className="form-page-title">Add New Item</h1>

      {apiError && (
        <p style={{ color: "#e74c3c", marginBottom: 16, fontSize: 13 }}>
          {apiError}
        </p>
      )}

      <div className="form-grid">

        {/* Item Name */}
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <input
            className="form-input"
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        {/* Selling Price */}
        <div className="form-group">
          <label className="form-label">Customer Selling Price</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={form.selling_price}
            onChange={(e) => handleChange("selling_price", e.target.value)}
          />
          {errors.selling_price && (
            <span className="error-text">{errors.selling_price}</span>
          )}
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-label">Customer Status</label>
          <select
            className="form-select"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="In-Active">In-Active</option>
          </select>
        </div>

      </div>

      {/* Cancel and  Create */}
      <div className="form-actions">
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
    </div>
  );
}
