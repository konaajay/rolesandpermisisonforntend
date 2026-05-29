import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';

export default function BranchList() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const fetchBranches = async (signal) => {
    setLoading(true); setError(null);
    try { const res = await api.get('/office-locations', { signal }); setBranches(res.data || []); }
    catch (err) { if (err.name === 'CanceledError') return; setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { const c = new AbortController(); fetchBranches(c.signal); return () => c.abort(); }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleDelete = async (id, name) => {

    try { await api.delete(`/office-locations/${id}`); setBranches(prev => prev.filter(b => b.id !== id)); showToast('success', 'Branch deleted.'); }
    catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? branches.filter(b => b.name?.toLowerCase().includes(q)) : branches;
  }, [branches, search]);

  return (
    <>
      {toast && <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>{toast.msg}</div>}
      <EntityListPage title="Branches" description="Manage office locations and geofencing"
        addLabel="+ Add Branch" addRoute="/hrms/branches/create"
        searchValue={search} onSearchChange={setSearch}
        loading={loading} error={error} totalCount={!loading ? filtered.length : undefined}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Branch Name</th>
                <th className="py-3 fw-semibold text-secondary border-0">Coordinates</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 100 }}>Radius</th>
                <th className="py-3 fw-semibold text-secondary border-0">Tracking Config</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="5" className="text-center py-5 text-muted small">{search ? `No branches matching "${search}"` : 'No branches found.'}</td></tr>
                : filtered.map(b => (
                  <tr key={b.id} className="border-bottom">
                    <td className="ps-4 py-3 fw-medium text-dark">{b.name}</td>
                    <td className="py-3 text-muted small">{b.latitude}, {b.longitude}</td>
                    <td className="py-3"><span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: 11 }}>{b.radiusMeters}m</span></td>
                    <td className="py-3 text-muted small">{b.trackingIntervalSec}s interval · {b.maxAccuracyMeters}m accuracy · {b.maxIdleMinutes}m idle</td>
                    <td className="py-3 pe-4 text-end">
                      <div className="d-flex justify-content-end gap-3">
                        <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" style={{ fontSize: 13 }} onClick={() => navigate(`/hrms/branches/edit/${b.id}`)}>Edit</button>
                        <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: 13 }} onClick={() => handleDelete(b.id, b.name)}>Delete</button>
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
