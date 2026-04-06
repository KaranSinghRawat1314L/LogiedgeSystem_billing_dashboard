import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addCustomer } from "../services/api";

// Initial empty form state
const INITIAL_FORM = {
  name:       "",
  address:    "",
  pan_number: "",
  gst_number: "",
  status:     "Active",
};

export default function AddCustomer() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState(INITIAL_FORM);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [apiError,setApiError] = useState("");

  // Update a single field
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  // Simple client-side validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim())       errs.name       = "Customer name is required";
    if (!form.address.trim())    errs.address    = "Address is required";
    if (!form.pan_number.trim()) errs.pan_number = "PAN card number is required";
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
      await addCustomer({
        name:       form.name.trim(),
        address:    form.address.trim(),
        pan_number: form.pan_number.trim(),
        gst_number: form.gst_number.trim() || null,
        status:     form.status,
      });
      // Go back to customer list after success
      navigate("/master/customers");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/master/customers");

  return (
    <div>
      <h1 className="form-page-title">Add New Customer</h1>

      {apiError && (
        <p style={{ color: "#e74c3c", marginBottom: 16, fontSize: 13 }}>
          {apiError}
        </p>
      )}

      {/* 2-column form grid (matches mockup image5) */}
      <div className="form-grid">

        {/* Customer Name */}
        <div className="form-group">
          <label className="form-label">Customer Name</label>
          <input
            className="form-input"
            type="text"
            placeholder=""
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        {/* Customer Address */}
        <div className="form-group">
          <label className="form-label">Customer Address</label>
          <input
            className="form-input"
            type="text"
            placeholder=""
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        {/* PAN Card Number */}
        <div className="form-group">
          <label className="form-label">Customer Pan Card Number</label>
          <input
            className="form-input"
            type="text"
            placeholder=""
            value={form.pan_number}
            onChange={(e) => handleChange("pan_number", e.target.value.toUpperCase())}
          />
          {errors.pan_number && <span className="error-text">{errors.pan_number}</span>}
        </div>

        {/* GST Number */}
        <div className="form-group">
          <label className="form-label">Customer GST Number</label>
          <input
            className="form-input"
            type="text"
            placeholder="Leave blank if not GST registered"
            value={form.gst_number}
            onChange={(e) => handleChange("gst_number", e.target.value.toUpperCase())}
          />
          {/* No error here — GST is optional */}
        </div>

        {/* Customer Status */}
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

      {/* Cancel / Create buttons (matches mockup) */}
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
