import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';

const bucketColors = { WON: 'success', LOST: 'danger', ENGAGED: 'primary', UNASSIGNED: 'secondary' };

export default function LeadStageList() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const fetchStages = async (signal) => {
    setLoading(true); setError(null);
    try { const res = await api.get('/pipeline-stages', { signal }); setStages(res.data || []); }
    catch (err) { if (err.name === 'CanceledError') return; setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { const c = new AbortController(); fetchStages(c.signal); return () => c.abort(); }, []);
  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleDelete = async (id, label) => {

    try { await api.delete(`/pipeline-stages/${id}`); setStages(prev => prev.filter(s => s.id !== id)); showToast('success', 'Stage deleted.'); }
    catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const handleReorder = async (id, direction) => {
    try { const res = await api.patch(`/pipeline-stages/${id}/reorder?direction=${direction}`); setStages(res.data || []); }
    catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? stages.filter(s => s.label?.toLowerCase().includes(q) || s.statusValue?.toLowerCase().includes(q)) : stages;
  }, [stages, search]);

  return (
    <>
      {toast && <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>{toast.msg}</div>}
      <EntityListPage title="Lead Stages" description="Configure your CRM pipeline stages"
        addLabel="+ Add Stage" addRoute="/crm/stages/create"
        searchValue={search} onSearchChange={setSearch}
        loading={loading} error={error} totalCount={!loading ? filtered.length : undefined}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 fw-semibold text-secondary border-0" style={{ width: 60 }}>Order</th>
                <th className="py-3 fw-semibold text-secondary border-0">Label</th>
                <th className="py-3 fw-semibold text-secondary border-0">Status Value</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 120 }}>Bucket</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 90 }}>Status</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="6" className="text-center py-5 text-muted small">{search ? `No stages matching "${search}"` : 'No stages found.'}</td></tr>
                : filtered.map(s => (
                  <tr key={s.id} className="border-bottom">
                    <td className="ps-4 py-3">
                      <div className="d-flex gap-1">
                        <button className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: 12 }} onClick={() => handleReorder(s.id, 'UP')}>▲</button>
                        <span className="fw-bold text-dark">{s.orderIndex}</span>
                        <button className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: 12 }} onClick={() => handleReorder(s.id, 'DOWN')}>▼</button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: s.color || '#6b7280', flexShrink: 0 }}></div>
                        <span className="fw-medium text-dark">{s.label}</span>
                      </div>
                    </td>
                    <td className="py-3"><code className="bg-light px-2 py-1 rounded" style={{ fontSize: 11 }}>{s.statusValue}</code></td>
                    <td className="py-3">
                      <span className={`badge bg-${bucketColors[s.analyticBucket] || 'secondary'} bg-opacity-10 text-${bucketColors[s.analyticBucket] || 'secondary'} border`} style={{ fontSize: 11 }}>
                        {s.analyticBucket || '—'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`badge fw-normal ${s.active ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`} style={{ fontSize: 11 }}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pe-4 text-end">
                      <div className="d-flex justify-content-end gap-3">
                        <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" style={{ fontSize: 13 }} onClick={() => navigate(`/crm/stages/edit/${s.id}`)}>Edit</button>
                        <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: 13 }} onClick={() => handleDelete(s.id, s.label)}>Delete</button>
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
