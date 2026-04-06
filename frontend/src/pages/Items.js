import React, { useEffect, useState } from 'react';
import { itemService } from '../services/api';
import { Loader, Alert, Badge, EmptyState, Modal, formatCurrency, formatDate } from '../components/UI';

const EMPTY_FORM = {
  name: '', description: '', unit: 'pcs', unit_price: '', hsn_code: '', category: ''
};

const UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'ream', 'pack', 'box', 'set', 'pair', 'unit'];

const CATEGORIES = ['Electronics', 'Electronics Accessories', 'Furniture', 'Stationery', 'Lighting', 'Office Accessories', 'Software', 'Services', 'Other'];

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const load = () => {
    setLoading(true);
    itemService.getAll()
      .then(setItems)
      .catch(() => setError('Failed to load items'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModalOpen(true); setError(''); };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Item name is required');
    if (!form.unit_price || isNaN(form.unit_price) || parseFloat(form.unit_price) < 0) {
      return setError('A valid unit price is required');
    }
    setSaving(true);
    try {
      await itemService.create({ ...form, unit_price: parseFloat(form.unit_price) });
      setSuccess('Item created successfully!');
      setModalOpen(false);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQ.toLowerCase()) ||
    (item.hsn_code || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  const categoryColors = {
    'Electronics': 'blue',
    'Electronics Accessories': 'blue',
    'Furniture': 'green',
    'Stationery': 'warn',
    'Lighting': 'warn',
    'Services': 'green',
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Items</h1>
          <p className="page-subtitle">Item / product master data</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>⊕ Add Item</button>
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
              placeholder="Search items by name, category or HSN code..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState
            icon="◫"
            title="No items found"
            subtitle={searchQ ? 'Try a different search term' : 'Add your first item to get started'}
            action={!searchQ && <button className="btn btn-primary" onClick={openCreate}>⊕ Add Item</button>}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>HSN Code</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{item.description}</div>
                      )}
                    </td>
                    <td>
                      {item.category
                        ? <Badge type={categoryColors[item.category] || 'blue'}>{item.category}</Badge>
                        : <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>{item.unit}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>{item.hsn_code || '—'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent2)' }}>
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {searchQ ? ` matching "${searchQ}"` : ''}
        </div>
      </div>

      {/* Create Item Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(''); }} title="Add New Item">
        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <div className="form-grid form-grid-2">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Item Name <span className="required">*</span></label>
            <input className="form-control" placeholder="Office Chair Pro" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-control" placeholder="Brief description of the item..." rows={2} value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Price (₹) <span className="required">*</span></label>
            <input
              className="form-control"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.unit_price}
              onChange={e => handleChange('unit_price', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit of Measure</label>
            <select className="form-control" value={form.unit} onChange={e => handleChange('unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">HSN Code</label>
            <input
              className="form-control"
              placeholder="9401"
              value={form.hsn_code}
              onChange={e => handleChange('hsn_code', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => handleChange('category', e.target.value)}>
              <option value="">— Select category —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-12 mt-24" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : '⊕ Create Item'}
          </button>
        </div>
      </Modal>
    </>
  );
}
