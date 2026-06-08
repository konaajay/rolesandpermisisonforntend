import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';
import SettingsNav from '../components/SettingsNav';

export default function BusinessEntityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({ entityCode: '', companyName: '', description: '', active: true, showInUserForm: true });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/business-entities`).then(res => {
      const found = res.data.find(e => String(e.id) === String(id));
      if (found) setForm({ entityCode: found.entityCode, companyName: found.companyName, description: found.description || '', active: found.active, showInUserForm: found.showInUserForm !== false });
    }).catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      if (isEdit) {
        await api.put(`/business-entities/${id}`, form);
      } else {
        await api.post('/business-entities', form);
      }
      setSuccess(isEdit ? 'Entity updated successfully.' : 'Entity created successfully.');
      setTimeout(() => navigate('/settings/entities'), 1000);
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
        title={isEdit ? 'Edit Entity' : 'Add Entity'}
        description="Define a business entity (sub-company or legal entity)"
        onBack={() => navigate('/settings/entities')}
        onSubmit={handleSubmit}
        submitLabel={saving ? 'Saving...' : (isEdit ? 'Update Entity' : 'Create Entity')}
        loading={loading}
        error={error}
        success={success}
      >
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Entity Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. ABC, HQ, NORTH"
                value={form.entityCode}
                onChange={e => setForm({ ...form, entityCode: e.target.value.toUpperCase() })}
                disabled={isEdit}
                required
              />
              <div className="form-text" style={{ fontSize: '11px' }}>Unique code. Cannot be changed after creation.</div>
            </div>

            <div className="col-md-8">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Company Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. ABC Pvt Ltd"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary mb-1">Description (optional)</label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="Short description of this entity..."
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
                If enabled, this entity will be visible when assigning users.
              </div>
            </div>

            {isEdit && (
              <div className="col-12 mt-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="entityActive"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="entityActive">Active</label>
                </div>
              </div>
            )}
          </div>
        </div>
      </EntityFormPage>
    </div>
  );
}
