import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';
import SettingsNav from '../components/SettingsNav';

export default function BusinessEntityList() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchEntities = async () => {
    setLoading(true); setError(null);
    try { const res = await api.get('/business-entities'); setEntities(res.data || []); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEntities(); }, []);

  const handleToggle = async (entity) => {
    try {
      await api.put(`/business-entities/${entity.id}/toggle`);
      fetchEntities();
      showToast('success', `Entity ${entity.active ? 'deactivated' : 'activated'}.`);
    } catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entity?')) return;
    try { await api.delete(`/business-entities/${id}`); fetchEntities(); showToast('success', 'Entity deleted.'); }
    catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? entities.filter(e => e.entityCode?.toLowerCase().includes(q) || e.companyName?.toLowerCase().includes(q)) : entities;
  }, [entities, search]);

  return (
    <>
      {toast && <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>{toast.msg}</div>}
      <SettingsNav />
      <EntityListPage
        title="Business Entities"
        description="Define sub-companies or legal entities under your organization"
        addLabel="+ Add Entity"
        addRoute="/settings/entities/create"
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
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Entity Code</th>
                <th className="py-3 fw-semibold text-secondary border-0">Company Name</th>
                <th className="py-3 fw-semibold text-secondary border-0">Description</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 90 }}>Status</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="5" className="text-center py-5 text-muted small">{search ? `No entities matching "${search}"` : 'No entities found. Click "+ Add Entity" to create one.'}</td></tr>
                : filtered.map(e => (
                  <tr key={e.id} className="border-bottom" style={{ opacity: e.active ? 1 : 0.55 }}>
                    <td className="ps-4 py-3">
                      <code className="bg-light px-2 py-1 rounded fw-bold" style={{ fontSize: 12 }}>{e.entityCode}</code>
                    </td>
                    <td className="py-3 fw-medium text-dark">{e.companyName}</td>
                    <td className="py-3 text-muted small">{e.description || '—'}</td>
                    <td className="py-3">
                      <span className={`badge fw-normal ${e.active ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`} style={{ fontSize: 11 }}>
                        {e.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pe-4 text-end">
                      <div className="d-flex justify-content-end gap-3">
                        <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" style={{ fontSize: 13 }}
                          onClick={() => navigate(`/settings/entities/edit/${e.id}`)}>Edit</button>
                        <button className={`btn btn-link btn-sm p-0 text-decoration-none ${e.active ? 'text-warning' : 'text-success'}`} style={{ fontSize: 13 }}
                          onClick={() => handleToggle(e)}>{e.active ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: 13 }}
                          onClick={() => handleDelete(e.id)}>Delete</button>
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
