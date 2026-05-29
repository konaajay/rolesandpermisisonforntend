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

const STATUS_OPTIONS = ['NEW','WORKING','CONTACTED','INTERESTED','UNDER_REVIEW','FOLLOW_UP','CALL_BACK','CONVERTED','PAID','EMI','SUCCESS','REJECTED','REFUND','LOST','NOT_INTERESTED','CLOSED','COMPLETED'];
const BUCKET_OPTIONS = ['UNASSIGNED','ENGAGED','WON','LOST'];
const EMPTY = { statusValue: 'NEW', label: '', color: '#3b82f6', analyticBucket: 'UNASSIGNED', orderIndex: 1, active: true, requireNote: false, requireDate: false, createTask: false };

export default function LeadStageForm() {
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
    api.get('/pipeline-stages')
      .then(res => { const s = res.data.find(x => String(x.id) === String(id)); if (s) setForm({ statusValue: s.statusValue, label: s.label, color: s.color || '#3b82f6', analyticBucket: s.analyticBucket || 'UNASSIGNED', orderIndex: s.orderIndex, active: s.active, requireNote: s.requireNote, requireDate: s.requireDate, createTask: s.createTask }); })
      .catch(() => setError('Failed to load stage.'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      if (isEdit) await api.put(`/pipeline-stages/${id}`, form);
      else await api.post('/pipeline-stages', form);
      setSuccess(isEdit ? 'Stage updated.' : 'Stage created.');
      setTimeout(() => navigate('/crm/stages'), 900);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>;

  return (
    <EntityFormPage title={isEdit ? 'Edit Lead Stage' : 'Create Lead Stage'} subtitle="Lead Stages"
      backRoute="/crm/stages" onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Save Changes' : 'Create Stage'}
      loading={loading} error={error} success={success}>

      <Section title="Stage Details">
        <div className="col-md-6">
          <Field label="Stage Label" required>
            <input className={inputCls} style={s36} value={form.label} onChange={e => upd('label', e.target.value)} required placeholder="e.g. New Lead" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Status Value" required>
            <select className="form-select form-select-sm border" style={s36} value={form.statusValue} onChange={e => upd('statusValue', e.target.value)} required>
              {STATUS_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Analytic Bucket" required>
            <select className="form-select form-select-sm border" style={s36} value={form.analyticBucket} onChange={e => upd('analyticBucket', e.target.value)}>
              {BUCKET_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div className="col-md-2">
          <Field label="Order Index" required>
            <input type="number" className={inputCls} style={s36} value={form.orderIndex} onChange={e => upd('orderIndex', parseInt(e.target.value, 10))} min="1" required />
          </Field>
        </div>
        <div className="col-md-2">
          <Field label="Color">
            <div className="d-flex align-items-center gap-2">
              <input type="color" className="form-control form-control-sm border p-1" style={{ width: 48, height: 36 }} value={form.color} onChange={e => upd('color', e.target.value)} />
              <input className={inputCls} style={s36} value={form.color} onChange={e => upd('color', e.target.value)} placeholder="#3b82f6" />
            </div>
          </Field>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <div className="d-flex gap-4 pb-1">
            {[['active','Active'],['requireNote','Require Note'],['requireDate','Require Date'],['createTask','Create Task']].map(([k, lbl]) => (
              <div key={k} className="form-check mb-0">
                <input type="checkbox" className="form-check-input" id={k} checked={form[k]} onChange={e => upd(k, e.target.checked)} />
                <label className="form-check-label small text-secondary" htmlFor={k}>{lbl}</label>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </EntityFormPage>
  );
}
