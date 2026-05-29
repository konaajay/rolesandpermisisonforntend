import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';

const inputCls = "form-control form-control-sm border";
const s36 = { height: '36px', fontSize: '13px' };
const Field = ({ label, required, children }) => (
  <div>
    <label className="form-label small fw-semibold text-secondary mb-1">{label}{required && <span className="text-danger ms-1">*</span>}</label>
    {children}
  </div>
);
const Section = ({ title, children }) => (
  <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
    <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px' }}>{title}</h6>
    <div className="row g-3">{children}</div>
  </div>
);

const EMPTY = { name: '', latitude: '', longitude: '', radiusMeters: 30, trackingIntervalSec: 300, maxAccuracyMeters: 100, maxIdleMinutes: 30 };

export default function BranchForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    api.get('/office-locations')
      .then(res => { const b = res.data.find(x => String(x.id) === String(id)); if (b) setForm({ name: b.name, latitude: b.latitude, longitude: b.longitude, radiusMeters: b.radiusMeters, trackingIntervalSec: b.trackingIntervalSec, maxAccuracyMeters: b.maxAccuracyMeters, maxIdleMinutes: b.maxIdleMinutes }); })
      .catch(() => setError('Failed to load branch.'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      if (isEdit) await api.put(`/office-locations/${id}`, form);
      else await api.post('/office-locations', form);
      setSuccess(isEdit ? 'Branch updated.' : 'Branch created.');
      setTimeout(() => navigate('/hrms/branches'), 900);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>;

  return (
    <EntityFormPage title={isEdit ? 'Edit Branch' : 'Create Branch'} subtitle="Branches"
      backRoute="/hrms/branches" onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Save Changes' : 'Create Branch'}
      loading={loading} error={error} success={success}>
      <Section title="Location Details">
        <div className="col-md-12">
          <Field label="Branch Name" required>
            <input className={inputCls} style={s36} value={form.name} onChange={e => upd('name', e.target.value)} required placeholder="e.g. Head Office" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Latitude" required>
            <input type="number" step="0.0000001" className={inputCls} style={s36} value={form.latitude} onChange={e => upd('latitude', e.target.value)} required placeholder="e.g. 28.6139" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Longitude" required>
            <input type="number" step="0.0000001" className={inputCls} style={s36} value={form.longitude} onChange={e => upd('longitude', e.target.value)} required placeholder="e.g. 77.2090" />
          </Field>
        </div>
      </Section>
      <Section title="Geofencing & Tracking">
        <div className="col-md-3">
          <Field label="Geofence Radius (meters)" required>
            <input type="number" className={inputCls} style={s36} value={form.radiusMeters} onChange={e => upd('radiusMeters', parseFloat(e.target.value))} min="5" required />
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="Tracking Interval (seconds)" required>
            <input type="number" className={inputCls} style={s36} value={form.trackingIntervalSec} onChange={e => upd('trackingIntervalSec', parseInt(e.target.value, 10))} min="10" required />
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="Max GPS Accuracy (meters)" required>
            <input type="number" className={inputCls} style={s36} value={form.maxAccuracyMeters} onChange={e => upd('maxAccuracyMeters', parseInt(e.target.value, 10))} min="1" required />
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="Max Idle Duration (minutes)" required>
            <input type="number" className={inputCls} style={s36} value={form.maxIdleMinutes} onChange={e => upd('maxIdleMinutes', parseInt(e.target.value, 10))} min="1" required />
          </Field>
        </div>
      </Section>
    </EntityFormPage>
  );
}
