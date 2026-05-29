import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';

const inputCls = "form-control form-control-sm border";
const inputStyle = { height: '36px', fontSize: '13px' };

const Field = ({ label, required, children }) => (
  <div>
    <label className="form-label small fw-semibold text-secondary mb-1">
      {label}{required && <span className="text-danger ms-1">*</span>}
    </label>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
    <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px' }}>{title}</h6>
    <div className="row g-3">{children}</div>
  </div>
);

export default function RoleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Extra fields state
  const [fields, setFields] = useState([]);
  const [fieldForm, setFieldForm] = useState({ fieldName: '', fieldLabel: '', fieldType: 'TEXT', required: false, options: '', displayOrder: 0 });
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldMsg, setFieldMsg] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    api.get('/roles', { signal: ctrl.signal })
      .then(res => {
        const role = res.data.find(r => String(r.id) === String(id));
        if (role) { setName(role.name); setDescription(role.description || ''); }
        return api.get(`/roles/${id}/extra-fields`, { signal: ctrl.signal });
      })
      .then(res => setFields(res.data || []))
      .catch(err => { if (err.name !== 'CanceledError') setError('Failed to load role.'); })
      .finally(() => setFetching(false));
    return () => ctrl.abort();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      if (isEdit) await api.put(`/roles/${id}`, { name, description, permissionIds: [] });
      else await api.post('/roles', { name, description, permissionIds: [] });
      setSuccess(isEdit ? 'Role updated.' : 'Role created.');
      setTimeout(() => navigate('/roles'), 900);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  const handleSaveField = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFieldMsg(null);
    
    if (!fieldForm.fieldName || !fieldForm.fieldLabel) {
      setFieldMsg('Error: Both fieldName (Key) and Display Label are required.');
      return;
    }
    
    const opts = fieldForm.options ? fieldForm.options.split(',').map(s => s.trim()).filter(Boolean) : [];
    const payload = { fieldName: fieldForm.fieldName, fieldLabel: fieldForm.fieldLabel, fieldType: fieldForm.fieldType, required: fieldForm.required, options: opts, displayOrder: Number(fieldForm.displayOrder) };
    try {
      if (editingFieldId) await api.put(`/roles/${id}/extra-fields/${editingFieldId}`, payload);
      else await api.post(`/roles/${id}/extra-fields`, payload);
      const res = await api.get(`/roles/${id}/extra-fields`);
      setFields(res.data); setFieldMsg('Saved.'); setEditingFieldId(null);
      setFieldForm({ fieldName: '', fieldLabel: '', fieldType: 'TEXT', required: false, options: '', displayOrder: 0 });
    } catch (err) { setFieldMsg('Error: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDeleteField = async (fid) => {

    await api.delete(`/roles/${id}/extra-fields/${fid}`);
    setFields(prev => prev.filter(f => f.id !== fid));
  };

  if (fetching) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>;

  return (
    <EntityFormPage title={isEdit ? 'Edit Role' : 'Create Role'} subtitle="Roles"
      backRoute="/roles" onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Save Changes' : 'Create Role'}
      loading={loading} error={error} success={success}>

      <Section title="Role Details">
        <div className="col-md-6">
          <Field label="Role Name" required>
            <input className={inputCls} style={inputStyle} value={name}
              onChange={e => setName(e.target.value.toUpperCase())} required placeholder="e.g. MANAGER" />
          </Field>
        </div>
        <div className="col-md-12">
          <Field label="Description" required>
            <textarea className="form-control border" style={{ fontSize: '13px', minHeight: 80 }} value={description}
              onChange={e => setDescription(e.target.value)} required placeholder="Describe what this role does" />
          </Field>
        </div>
      </Section>

      {isEdit && (
        <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
          <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px' }}>Custom Profile Fields</h6>
          {fieldMsg && <div className={`alert py-2 small ${fieldMsg.startsWith('Error') ? 'alert-danger' : 'alert-success'} border-0 mb-3`}>{fieldMsg}</div>}
          <div className="bg-light rounded-2 p-3 mb-4">
            <div className="row g-2">
              <div className="col-md-3"><input className={inputCls} style={inputStyle} placeholder="fieldName (camelCase)" value={fieldForm.fieldName} onChange={e => setFieldForm(p => ({ ...p, fieldName: e.target.value }))} required /></div>
              <div className="col-md-3"><input className={inputCls} style={inputStyle} placeholder="Display Label" value={fieldForm.fieldLabel} onChange={e => setFieldForm(p => ({ ...p, fieldLabel: e.target.value }))} required /></div>
              <div className="col-md-2">
                <select className="form-select form-select-sm border" style={{ height: '36px', fontSize: '13px' }} value={fieldForm.fieldType} onChange={e => setFieldForm(p => ({ ...p, fieldType: e.target.value }))}>
                  <option value="TEXT">Text</option><option value="NUMBER">Number</option><option value="DROPDOWN">Dropdown</option>
                </select>
              </div>
              <div className="col-md-3"><input className={inputCls} style={inputStyle} placeholder="Options (comma-sep, dropdown only)" value={fieldForm.options} onChange={e => setFieldForm(p => ({ ...p, options: e.target.value }))} disabled={fieldForm.fieldType !== 'DROPDOWN'} /></div>
              <div className="col-md-1 d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input" checked={fieldForm.required} onChange={e => setFieldForm(p => ({ ...p, required: e.target.checked }))} id="freq" />
                <label className="small text-muted" htmlFor="freq">Req</label>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2">
              <button type="button" onClick={handleSaveField} className="btn btn-primary btn-sm" style={{ height: 32 }}>{editingFieldId ? 'Update Field' : 'Add Field'}</button>
              {editingFieldId && <button type="button" className="btn btn-light border btn-sm" style={{ height: 32 }} onClick={() => { setEditingFieldId(null); setFieldForm({ fieldName: '', fieldLabel: '', fieldType: 'TEXT', required: false, options: '', displayOrder: 0 }); }}>Cancel</button>}
            </div>
          </div>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '12px' }}>
            <thead><tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
              <th className="py-2 fw-semibold text-secondary border-0">Key</th>
              <th className="py-2 fw-semibold text-secondary border-0">Label</th>
              <th className="py-2 fw-semibold text-secondary border-0">Type</th>
              <th className="py-2 fw-semibold text-secondary border-0">Required</th>
              <th className="py-2 fw-semibold text-secondary border-0 text-end">Actions</th>
            </tr></thead>
            <tbody>
              {fields.length === 0 ? <tr><td colSpan="5" className="text-center text-muted py-3 small">No custom fields yet.</td></tr>
                : fields.map(f => (
                  <tr key={f.id} className="border-bottom">
                    <td><code className="bg-light px-2 py-1 rounded">{f.fieldName}</code></td>
                    <td>{f.label}</td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary border" style={{ fontSize: 11 }}>{f.type}</span></td>
                    <td>{f.required ? <span className="text-danger small">Yes</span> : <span className="text-muted small">No</span>}</td>
                    <td className="text-end">
                      <button className="btn btn-link btn-sm text-primary p-0 me-3 text-decoration-none" style={{ fontSize: 12 }} onClick={() => { setEditingFieldId(f.id); setFieldForm({ fieldName: f.fieldName, fieldLabel: f.label, fieldType: f.type, required: f.required, options: f.options?.join(', ') || '', displayOrder: f.displayOrder || 0 }); }}>Edit</button>
                      <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: 12 }} onClick={() => handleDeleteField(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </EntityFormPage>
  );
}
