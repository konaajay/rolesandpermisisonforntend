import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EntityListPage from '../components/EntityListPage';
import SettingsNav from '../components/SettingsNav';

export default function DepartmentList() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [deptRes, entRes] = await Promise.all([
        api.get('/departments'),
        api.get('/business-entities').catch(() => ({ data: [] }))
      ]);
      setDepartments(deptRes.data || []);
      setEntities(entRes.data || []);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const entityMap = useMemo(() => {
    const map = {};
    entities.forEach(e => { map[e.id] = e.companyName; });
    return map;
  }, [entities]);

  const handleToggle = async (dept) => {
    try {
      await api.put(`/departments/${dept.id}/toggle`);
      fetchData();
      showToast('success', `Department ${dept.active ? 'deactivated' : 'activated'}.`);
    } catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await api.delete(`/departments/${id}`); fetchData(); showToast('success', 'Department deleted.'); }
    catch (err) { showToast('error', err.response?.data?.message || err.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? departments.filter(d => d.deptCode?.toLowerCase().includes(q) || d.deptName?.toLowerCase().includes(q)) : departments;
  }, [departments, search]);

  return (
    <>
      {toast && <div className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-sm border-0 small`} style={{ zIndex: 9999 }}>{toast.msg}</div>}
      <SettingsNav />
      <EntityListPage
        title="Departments"
        description="Manage departments across your organization"
        addLabel="+ Add Department"
        addRoute="/settings/departments/create"
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
                <th className="ps-4 py-3 fw-semibold text-secondary border-0">Dept Code</th>
                <th className="py-3 fw-semibold text-secondary border-0">Department Name</th>
                <th className="py-3 fw-semibold text-secondary border-0">Entity</th>
                <th className="py-3 fw-semibold text-secondary border-0">Description</th>
                <th className="py-3 fw-semibold text-secondary border-0" style={{ width: 90 }}>Status</th>
                <th className="py-3 pe-4 fw-semibold text-secondary border-0 text-end" style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="6" className="text-center py-5 text-muted small">{search ? `No departments matching "${search}"` : 'No departments found.'}</td></tr>
                : filtered.map(d => (
                  <tr key={d.id} className="border-bottom" style={{ opacity: d.active ? 1 : 0.55 }}>
                    <td className="ps-4 py-3">
                      <code className="bg-light px-2 py-1 rounded fw-bold" style={{ fontSize: 12 }}>{d.deptCode}</code>
                    </td>
                    <td className="py-3 fw-medium text-dark">{d.deptName}</td>
                    <td className="py-3 text-muted small">
                      {d.entityId ? (
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: 11 }}>
                          {entityMap[d.entityId] || `Entity #${d.entityId}`}
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 text-muted small">{d.description || '—'}</td>
                    <td className="py-3">
                      <span className={`badge fw-normal ${d.active ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`} style={{ fontSize: 11 }}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pe-4 text-end">
                      <div className="d-flex justify-content-end gap-3">
                        <button className="btn btn-link btn-sm text-primary p-0 text-decoration-none" style={{ fontSize: 13 }}
                          onClick={() => navigate(`/settings/departments/edit/${d.id}`)}>Edit</button>
                        <button className={`btn btn-link btn-sm p-0 text-decoration-none ${d.active ? 'text-warning' : 'text-success'}`} style={{ fontSize: 13 }}
                          onClick={() => handleToggle(d)}>{d.active ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: 13 }}
                          onClick={() => handleDelete(d.id)}>Delete</button>
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
