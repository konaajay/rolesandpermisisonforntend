import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';
import EntityFormPage from '../components/EntityFormPage';

export default function IdGenerationSettings() {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'FORM'
  const [formats, setFormats] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    entityType: 'EMPLOYEE',
    prefix: 'EMP',
    nextSequence: 1001,
    paddingLength: 7,
    includeYear: false
  });

  const fetchData = async () => {
    try {
      const [formatRes, roleRes] = await Promise.all([
        api.get('/id-formats'),
        api.get('/roles')
      ]);
      setFormats(formatRes.data);
      setRoles(roleRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/id-formats', form);
      setSuccess('ID format saved successfully.');
      setTimeout(() => {
        setViewMode('LIST');
        setSuccess(null);
        fetchData();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (f) => {
    setEditingId(f.id);
    setForm({
      entityType: f.entityType,
      prefix: f.prefix,
      nextSequence: f.nextSequence,
      paddingLength: f.paddingLength || 7,
      includeYear: f.includeYear || false
    });
    setViewMode('FORM');
  };

  const handleDelete = async (id) => {

    try {
      await api.delete(`/id-formats/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete ID format');
    }
  };

  const generatePreview = (prefix, nextSequence, paddingLength, includeYear) => {
    const seqStr = String(nextSequence).padStart(paddingLength, '0');
    const currentYear = new Date().getFullYear();
    return includeYear ? `${prefix}${currentYear}${seqStr}` : `${prefix}${seqStr}`;
  };

  const filteredFormats = formats.filter(f => 
    f.entityType.toLowerCase().includes(search.toLowerCase()) || 
    f.prefix.toLowerCase().includes(search.toLowerCase())
  );

  if (viewMode === 'FORM') {
    return (
      <EntityFormPage
        title={editingId ? 'Edit ID Format' : 'Create ID Format'}
        subtitle="ID Generation Settings"
        onBack={() => { setViewMode('LIST'); setEditingId(null); setError(null); }}
        onSubmit={handleSave}
        submitLabel={editingId ? 'Save Changes' : 'Save Format'}
        loading={false}
        error={error}
        success={success}
      >
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px', letterSpacing: '0.2px' }}>
            Format Details
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary mb-1">Role Name *</label>
              <select 
                className="form-select form-select-sm border" 
                style={{ height: '36px', fontSize: '13px' }}
                value={form.entityType} 
                onChange={e => setForm({...form, entityType: e.target.value.toUpperCase()})}
                disabled={editingId !== null}
                required
              >
                <option value="">-- Select Role --</option>
                {roles
                  .filter(r => editingId !== null || !formats.some(f => f.entityType === r.name.toUpperCase()))
                  .map(r => (
                    <option key={r.id} value={r.name.toUpperCase()}>{r.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary mb-1">Prefix *</label>
              <input 
                type="text" 
                className="form-control form-control-sm border" 
                style={{ height: '36px', fontSize: '13px' }}
                value={form.prefix} 
                onChange={e => setForm({...form, prefix: e.target.value.toUpperCase()})}
                required 
                placeholder="e.g. EMP"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary mb-1">Next Sequence *</label>
              <input 
                type="number" 
                className="form-control form-control-sm border" 
                style={{ height: '36px', fontSize: '13px' }}
                value={form.nextSequence} 
                onChange={e => setForm({...form, nextSequence: parseInt(e.target.value, 10) || 1})}
                required 
                min="1"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary mb-1">Padding Length</label>
              <input 
                type="number" 
                className="form-control form-control-sm border" 
                style={{ height: '36px', fontSize: '13px' }}
                value={form.paddingLength} 
                onChange={e => setForm({...form, paddingLength: parseInt(e.target.value, 10) || 0})}
                required 
                min="1" max="15"
              />
            </div>

            <div className="col-md-12 mt-4">
              <div className="mb-3 form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="includeYearCheck"
                  checked={form.includeYear} 
                  onChange={e => setForm({...form, includeYear: e.target.checked})}
                />
                <label className="form-check-label small text-secondary" htmlFor="includeYearCheck">
                  Include Current Year in ID
                </label>
              </div>
              
              <div className="p-3 bg-light rounded border">
                <div className="small text-muted mb-1">Live Preview</div>
                <div className="fw-bold fs-5 text-primary">
                  {generatePreview(form.prefix, form.nextSequence, form.paddingLength, form.includeYear)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </EntityFormPage>
    );
  }

  return (
    <EntityListPage
      title="ID Generation Formats"
      description="Configure auto-generated IDs for various roles."
      addLabel="Add ID Format"
      onAdd={() => {
        setEditingId(null);
        setError(null);
        setForm({ entityType: roles.length > 0 ? roles[0].name.toUpperCase() : 'EMPLOYEE', prefix: 'EMP', nextSequence: 1001, paddingLength: 7, includeYear: false });
        setViewMode('FORM');
      }}
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      error={error}
      totalCount={filteredFormats.length}
    >
      <table className="table table-hover mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th className="py-3 px-4 fw-semibold text-secondary small">Role Name</th>
            <th className="py-3 px-4 fw-semibold text-secondary small">Prefix</th>
            <th className="py-3 px-4 fw-semibold text-secondary small">Next Sequence</th>
            <th className="py-3 px-4 fw-semibold text-secondary small">Padding</th>
            <th className="py-3 px-4 fw-semibold text-secondary small">Preview</th>
            <th className="py-3 px-4 fw-semibold text-secondary small text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFormats.map(f => (
            <tr key={f.id}>
              <td className="px-4 py-3 fw-medium">{f.entityType}</td>
              <td className="px-4 py-3"><code className="bg-light px-2 py-1 rounded">{f.prefix}</code></td>
              <td className="px-4 py-3">{f.nextSequence}</td>
              <td className="px-4 py-3">{f.paddingLength}</td>
              <td className="px-4 py-3 fw-bold text-primary">
                {generatePreview(f.prefix, f.nextSequence, f.paddingLength || 7, f.includeYear)}
              </td>
              <td className="px-4 py-3 text-end">
                <button className="btn btn-link btn-sm text-primary p-0 me-3 text-decoration-none" onClick={() => handleEdit(f)}>Edit</button>
                <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" onClick={() => handleDelete(f.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {!loading && filteredFormats.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-muted small">No ID formats found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </EntityListPage>
  );
}
