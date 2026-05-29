import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';

const fmt = (t) => t ? t.substring(0, 5) : '—';

export default function ShiftList() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const fetchShifts = async (signal) => {
    setLoading(true); setError(null);
    try { const res = await api.get('/shifts', { signal }); setShifts(res.data || []); }
    catch (err) { if (err.name === 'CanceledError') return; setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { const c = new AbortController(); fetchShifts(c.signal); return () => c.abort(); }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleDelete = async (id, name) => {

    try { await api.delete(`/shifts/${id}`); setShifts(prev => prev.filter(s => s.id !== id)); showToast('success', 'Shift deleted.'); }
    catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? shifts.filter(s => s.name?.toLowerCase().includes(q)) : shifts;
  }, [shifts, search]);

  return (
    <>
      {toast && (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
      <EntityListPage
        title="Attendance Shifts"
        description="Define shift timings and break schedules"
        addLabel="+ Add Shift"
        addRoute="/hrms/shifts/create"
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        error={error}
        totalCount={!loading ? filtered.length : undefined}
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Shift Name</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 160 }}>Timing</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 100 }}>Grace</th>
                <th className="py-3 fw-semibold text-secondary border-0">Office</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted small">
                  {search ? `No shifts matching "${search}"` : 'No shifts found.'}
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-bottom">
                  <td className="ps-4 py-3 fw-medium text-dark">{s.name}</td>
                  <td className="py-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: 11 }}>
                      {fmt(s.startTime)} – {fmt(s.endTime)}
                    </span>
                  </td>
                  <td className="py-3 text-muted small">{s.graceMinutes} min</td>
                  <td className="py-3 text-muted small">{s.office?.name || '—'}</td>
                  <td className="py-3 pe-4 text-end">
                    <div className="d-flex justify-content-end gap-3">
                      <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" style={{ fontSize: 13 }}
                        onClick={() => navigate(`/hrms/shifts/edit/${s.id}`)}>Edit</button>
                      <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: 13 }}
                        onClick={() => handleDelete(s.id, s.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EntityListPage>
    </>
  );
}
