import React, { useEffect, useState } from 'react';
import { customerService } from '../services/api';
import { Loader, Alert, Badge, EmptyState, Modal, formatDate } from '../components/UI';

const EMPTY_FORM = {
  name: '', email: '', phone: '', address: '',
  city: '', state: '', pincode: '', gst_registered: false, gstin: ''
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const load = () => {
    setLoading(true);
    customerService.getAll()
      .then(setCustomers)
      .catch(() => setError('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModalOpen(true); setError(''); };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'gst_registered' && !value) setForm(prev => ({ ...prev, gst_registered: false, gstin: '' }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      return setError('Name and email are required');
    }
    if (form.gst_registered && !form.gstin.trim()) {
      return setError('GSTIN is required for GST registered customers');
    }
    setSaving(true);
    try {
      await customerService.create(form);
      setSuccess('Customer created successfully!');
      setModalOpen(false);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQ.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Customer master data</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>⊕ Add Customer</button>
      </div>

      <div className="page-body">
        {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
        {error && !modalOpen && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Search */}
        <div className="card card-sm mb-24">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="form-control"
              placeholder="Search customers by name, email or city..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState
            icon="◎"
            title="No customers found"
            subtitle={searchQ ? 'Try a different search term' : 'Add your first customer to get started'}
            action={!searchQ && <button className="btn btn-primary" onClick={openCreate}>⊕ Add Customer</button>}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>GST Status</th>
                  <th>GSTIN</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{c.email}</td>
                    <td style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.phone || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>
                      {c.city ? `${c.city}, ${c.state}` : '—'}
                    </td>
                    <td>
                      {c.gst_registered
                        ? <Badge type="green">Registered</Badge>
                        : <Badge type="warn">Not Registered</Badge>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>
                      {c.gstin || '—'}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
          {searchQ ? ` matching "${searchQ}"` : ''}
        </div>
      </div>

      {/* Create Customer Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(''); }} title="Add New Customer">
        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input className="form-control" placeholder="Acme Corporation" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span className="required">*</span></label>
            <input className="form-control" type="email" placeholder="billing@acme.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" placeholder="9876543210" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input className="form-control" placeholder="400001" value={form.pincode} onChange={e => handleChange('pincode', e.target.value)} />
          </div>
        </div>

        <div className="form-group mt-16">
          <label className="form-label">Address</label>
          <textarea className="form-control" placeholder="Street address..." rows={2} value={form.address} onChange={e => handleChange('address', e.target.value)} />
        </div>

        <div className="form-grid form-grid-2 mt-16">
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-control" placeholder="Mumbai" value={form.city} onChange={e => handleChange('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-control" placeholder="Maharashtra" value={form.state} onChange={e => handleChange('state', e.target.value)} />
          </div>
        </div>

        <div className="mt-16">
          <label className="toggle-group">
            <input
              type="checkbox"
              checked={form.gst_registered}
              onChange={e => setForm(prev => ({ ...prev, gst_registered: e.target.checked, gstin: e.target.checked ? prev.gstin : '' }))}
            />
            <span className="toggle-track" />
            <span className="toggle-label">GST Registered Customer</span>
          </label>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            {form.gst_registered ? 'GST will NOT be applied on invoices for this customer.' : '18% GST will be applied on invoices for this customer.'}
          </div>
        </div>

        {form.gst_registered && (
          <div className="form-group mt-16">
            <label className="form-label">GSTIN <span className="required">*</span></label>
            <input
              className="form-control"
              placeholder="27AABCU9603R1ZN"
              value={form.gstin}
              onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: 1 }}
            />
          </div>
        )}

        <div className="flex gap-12 mt-24" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : '⊕ Create Customer'}
          </button>
        </div>
      </Modal>
    </>
  );
}
