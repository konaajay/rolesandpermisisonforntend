import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EntityFormPage from '../components/EntityFormPage';

const inputCls = "form-control form-control-sm border";
const s36 = { height: '36px', fontSize: '13px' };
const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="form-label small fw-semibold text-secondary mb-1">{label}{required && <span className="text-danger ms-1">*</span>}</label>
    {children}
    {hint && <div className="form-text text-muted" style={{ fontSize: 11 }}>{hint}</div>}
  </div>
);
const Section = ({ title, children }) => (
  <div className="card border-0 shadow-sm rounded-3 p-4" style={{ fontSize: '13px' }}>
    <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontSize: '13px' }}>{title}</h6>
    <div className="row g-3">{children}</div>
  </div>
);

const EMPTY_FORM = { name: '', startTime: '09:00', endTime: '18:00', graceMinutes: 15, minHalfDayMinutes: 240, minFullDayMinutes: 480, shortBreakStartTime: '', shortBreakEndTime: '', longBreakStartTime: '', longBreakEndTime: '', office: { id: '' } };

export default function ShiftForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const init = async () => {
      try {
        const [brRes] = await Promise.all([api.get('/office-locations', { signal: ctrl.signal })]);
        setBranches(brRes.data || []);
        if (isEdit) {
          const shiftRes = await api.get('/shifts', { signal: ctrl.signal });
          const s = shiftRes.data.find(x => String(x.id) === String(id));
          if (s) setForm({ name: s.name, startTime: s.startTime?.substring(0, 5) || '09:00', endTime: s.endTime?.substring(0, 5) || '18:00', graceMinutes: s.graceMinutes, minHalfDayMinutes: s.minHalfDayMinutes, minFullDayMinutes: s.minFullDayMinutes, shortBreakStartTime: s.shortBreakStartTime?.substring(0, 5) || '', shortBreakEndTime: s.shortBreakEndTime?.substring(0, 5) || '', longBreakStartTime: s.longBreakStartTime?.substring(0, 5) || '', longBreakEndTime: s.longBreakEndTime?.substring(0, 5) || '', office: { id: s.office?.id || '' } });
        }
      } catch (err) { if (err.name !== 'CanceledError') setError('Failed to load data.'); }
      finally { setFetching(false); }
    };
    init();
    return () => ctrl.abort();
  }, [id, isEdit]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const pad = t => t ? t + ':00' : null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    const payload = { ...form, startTime: pad(form.startTime), endTime: pad(form.endTime), shortBreakStartTime: pad(form.shortBreakStartTime), shortBreakEndTime: pad(form.shortBreakEndTime), longBreakStartTime: pad(form.longBreakStartTime), longBreakEndTime: pad(form.longBreakEndTime) };
    try {
      if (isEdit) await api.put(`/shifts/${id}`, payload);
      else await api.post('/shifts', payload);
      setSuccess(isEdit ? 'Shift updated.' : 'Shift created.');
      setTimeout(() => navigate('/hrms/shifts'), 900);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>;

  return (
    <EntityFormPage title={isEdit ? 'Edit Shift' : 'Create Shift'} subtitle="Attendance Shifts"
      backRoute="/hrms/shifts" onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Save Changes' : 'Create Shift'}
      loading={loading} error={error} success={success}>

      <Section title="Shift Details">
        <div className="col-md-6">
          <Field label="Shift Name" required>
            <input className={inputCls} style={s36} value={form.name} onChange={e => upd('name', e.target.value)} required placeholder="e.g. Morning Shift" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Assigned Office / Branch" required>
            <select className="form-select form-select-sm border" style={s36} value={form.office.id} onChange={e => upd('office', { id: e.target.value })} required>
              <option value="">Select branch...</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="Start Time" required>
            <input type="time" className={inputCls} style={s36} value={form.startTime} onChange={e => upd('startTime', e.target.value)} required />
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="End Time" required>
            <input type="time" className={inputCls} style={s36} value={form.endTime} onChange={e => upd('endTime', e.target.value)} required />
          </Field>
        </div>
        <div className="col-md-2">
          <Field label="Grace (min)" required>
            <input type="number" className={inputCls} style={s36} value={form.graceMinutes} onChange={e => upd('graceMinutes', parseInt(e.target.value, 10))} min="0" required />
          </Field>
        </div>
        <div className="col-md-2">
          <Field label="Half Day (min)" required>
            <input type="number" className={inputCls} style={s36} value={form.minHalfDayMinutes} onChange={e => upd('minHalfDayMinutes', parseInt(e.target.value, 10))} min="1" required />
          </Field>
        </div>
        <div className="col-md-2">
          <Field label="Full Day (min)" required>
            <input type="number" className={inputCls} style={s36} value={form.minFullDayMinutes} onChange={e => upd('minFullDayMinutes', parseInt(e.target.value, 10))} min="1" required />
          </Field>
        </div>
      </Section>

      <Section title="Break Schedule (Optional)">
        <div className="col-md-3"><Field label="Short Break Start"><input type="time" className={inputCls} style={s36} value={form.shortBreakStartTime} onChange={e => upd('shortBreakStartTime', e.target.value)} /></Field></div>
        <div className="col-md-3"><Field label="Short Break End"><input type="time" className={inputCls} style={s36} value={form.shortBreakEndTime} onChange={e => upd('shortBreakEndTime', e.target.value)} /></Field></div>
        <div className="col-md-3"><Field label="Long Break Start"><input type="time" className={inputCls} style={s36} value={form.longBreakStartTime} onChange={e => upd('longBreakStartTime', e.target.value)} /></Field></div>
        <div className="col-md-3"><Field label="Long Break End"><input type="time" className={inputCls} style={s36} value={form.longBreakEndTime} onChange={e => upd('longBreakEndTime', e.target.value)} /></Field></div>
      </Section>
    </EntityFormPage>
  );
}
