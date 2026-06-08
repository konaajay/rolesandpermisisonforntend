import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';
import SettingsNav from '../components/SettingsNav';

export default function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({ deptCode: '', deptName: '', description: '', entityId: '', active: true, showInUserForm: true });
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Load available entities (optional association)
    api.get('/business-entities/active').catch(() => ({ data: [] })).then(res => setEntities(res.data || []));

    if (!isEdit) return;
    api.get('/departments').then(res => {
      const found = res.data.find(d => String(d.id) === String(id));
      if (found) setForm({
        deptCode: found.deptCode,
        deptName: found.deptName,
        description: found.description || '',
        entityId: found.entityId || '',
        active: found.active,
        showInUserForm: found.showInUserForm !== false
      });
    }).catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    const payload = { ...form, entityId: form.entityId || null };
    try {
      if (isEdit) {
        await api.put(`/departments/${id}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      setSuccess(isEdit ? 'Department updated successfully.' : 'Department created successfully.');
      setTimeout(() => navigate('/settings/departments'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SettingsNav />
      <EntityFormPage
        title={isEdit ? 'Edit Department' : 'Add Department'}
        description="Configure a department. Optionally link it to a business entity."
        onBack={() => navigate('/settings/departments')}
        onSubmit={handleSubmit}
        submitLabel={saving ? 'Saving...' : (isEdit ? 'Update Department' : 'Create Department')}
        loading={loading}
        error={error}
        success={success}
      >
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Dept Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. HR, SALES, IT"
                value={form.deptCode}
                onChange={e => setForm({ ...form, deptCode: e.target.value.toUpperCase() })}
                disabled={isEdit}
                required
              />
              <div className="form-text" style={{ fontSize: '11px' }}>Cannot be changed after creation.</div>
            </div>

            <div className="col-md-8">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Department Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Human Resources"
                value={form.deptName}
                onChange={e => setForm({ ...form, deptName: e.target.value })}
                required
              />
            </div>

            <div className="col-md-12">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Entity <span className="text-muted fw-normal">(optional)</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={form.entityId}
                onChange={e => setForm({ ...form, entityId: e.target.value })}
              >
                <option value="">— None / Not linked to an entity —</option>
                {entities.map(en => (
                  <option key={en.id} value={en.id}>{en.entityCode} – {en.companyName}</option>
                ))}
              </select>
              <div className="form-text" style={{ fontSize: '11px' }}>
                If your organization uses Business Entities, you can link this department to one.
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary mb-1">Description (optional)</label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="Short description of this department..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="col-12 mt-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showInUserForm"
                  checked={form.showInUserForm}
                  onChange={e => setForm({ ...form, showInUserForm: e.target.checked })}
                />
                <label className="form-check-label small fw-medium" htmlFor="showInUserForm">
                  Show in User Form
                </label>
              </div>
              <div className="form-text" style={{ fontSize: '11px' }}>
                If enabled, this department will be visible when assigning users.
              </div>
            </div>

            {isEdit && (
              <div className="col-12 mt-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="deptActive"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="deptActive">Active</label>
                </div>
              </div>
            )}
          </div>
        </div>
      </EntityFormPage>
    </div>
  );
}
