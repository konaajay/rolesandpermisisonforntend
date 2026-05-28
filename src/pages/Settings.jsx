import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('id-settings');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // 1. ID Settings State
  const [employeeIdFormat, setEmployeeIdFormat] = useState('');
  const [leadIdFormat, setLeadIdFormat] = useState('');
  const [employeeSequence, setEmployeeSequence] = useState('');
  const [leadSequence, setLeadSequence] = useState('');

  // 2. Branch Settings (Office Locations) State
  const [branches, setBranches] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radiusMeters: 30,
    trackingIntervalSec: 300,
    maxAccuracyMeters: 100,
    maxIdleMinutes: 30
  });

  // 3. Shift Settings State
  const [shifts, setShifts] = useState([]);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15,
    minHalfDayMinutes: 240,
    minFullDayMinutes: 480,
    shortBreakStartTime: '',
    shortBreakEndTime: '',
    longBreakStartTime: '',
    longBreakEndTime: '',
    office: { id: '' }
  });

  // 4. Pipeline Stages State
  const [stages, setStages] = useState([]);
  const [editingStage, setEditingStage] = useState(null);
  const [stageForm, setStageForm] = useState({
    statusValue: 'NEW',
    label: '',
    color: '#3b82f6',
    analyticBucket: 'UNASSIGNED',
    orderIndex: 0,
    active: true,
    defaultFollowupDays: 1,
    requireNote: false,
    requireDate: false,
    createTask: false
  });

  const leadStatusEnumOptions = [
    'NEW', 'WORKING', 'CONTACTED', 'INTERESTED', 'UNDER_REVIEW', 'FOLLOW_UP', 
    'CALL_BACK', 'CONVERTED', 'PAID', 'EMI', 'SUCCESS', 'REJECTED', 'REFUND', 
    'LOST', 'NOT_INTERESTED', 'CLOSED', 'COMPLETED'
  ];

  // Load initial settings based on tab
  useEffect(() => {
    fetchDataForTab(activeTab);
  }, [activeTab]);

  const fetchDataForTab = async (tab) => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (tab === 'id-settings') {
        const response = await api.get('/settings');
        if (response.data) {
          setEmployeeIdFormat(response.data.employeeIdFormat || '');
          setLeadIdFormat(response.data.leadIdFormat || '');
          setEmployeeSequence(response.data.employeeSequence || 0);
          setLeadSequence(response.data.leadSequence || 0);
        }
      } else if (tab === 'branches') {
        const response = await api.get('/office-locations');
        setBranches(response.data || []);
      } else if (tab === 'shifts') {
        // Fetch offices first to support dropdown selection
        const officeRes = await api.get('/office-locations');
        setBranches(officeRes.data || []);
        const shiftRes = await api.get('/shifts');
        setShifts(shiftRes.data || []);
      } else if (tab === 'pipeline') {
        const response = await api.get('/pipeline-stages');
        setStages(response.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data for tab: ' + tab);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const showError = (err) => {
    setError(err.response?.data?.message || err.message || 'An error occurred.');
    setTimeout(() => setError(null), 5000);
  };

  // 1. Save ID Settings
  const handleSaveIdSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', {
        employeeIdFormat,
        leadIdFormat,
        employeeSequence: employeeSequence ? parseInt(employeeSequence, 10) : 0,
        leadSequence: leadSequence ? parseInt(leadSequence, 10) : 0
      });
      showSuccess('ID & sequence settings saved successfully.');
    } catch (err) {
      showError(err);
    }
  };

  // 2. Branch Actions
  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/office-locations/${editingBranch.id}`, branchForm);
        showSuccess('Office location updated.');
      } else {
        await api.post('/office-locations', branchForm);
        showSuccess('Office location added.');
      }
      setBranchForm({
        name: '',
        latitude: '',
        longitude: '',
        radiusMeters: 30,
        trackingIntervalSec: 300,
        maxAccuracyMeters: 100,
        maxIdleMinutes: 30
      });
      setEditingBranch(null);
      fetchDataForTab('branches');
    } catch (err) {
      showError(err);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      latitude: branch.latitude,
      longitude: branch.longitude,
      radiusMeters: branch.radiusMeters,
      trackingIntervalSec: branch.trackingIntervalSec,
      maxAccuracyMeters: branch.maxAccuracyMeters,
      maxIdleMinutes: branch.maxIdleMinutes
    });
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this office location?')) return;
    try {
      await api.delete(`/office-locations/${id}`);
      showSuccess('Office location deleted.');
      fetchDataForTab('branches');
    } catch (err) {
      showError(err);
    }
  };

  // 3. Shift Actions
  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...shiftForm,
        startTime: shiftForm.startTime ? shiftForm.startTime + ":00" : null,
        endTime: shiftForm.endTime ? shiftForm.endTime + ":00" : null,
        shortBreakStartTime: shiftForm.shortBreakStartTime ? shiftForm.shortBreakStartTime + ":00" : null,
        shortBreakEndTime: shiftForm.shortBreakEndTime ? shiftForm.shortBreakEndTime + ":00" : null,
        longBreakStartTime: shiftForm.longBreakStartTime ? shiftForm.longBreakStartTime + ":00" : null,
        longBreakEndTime: shiftForm.longBreakEndTime ? shiftForm.longBreakEndTime + ":00" : null,
      };

      if (editingShift) {
        await api.put(`/shifts/${editingShift.id}`, payload);
        showSuccess('Attendance shift updated.');
      } else {
        await api.post('/shifts', payload);
        showSuccess('Attendance shift added.');
      }
      setShiftForm({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        graceMinutes: 15,
        minHalfDayMinutes: 240,
        minFullDayMinutes: 480,
        shortBreakStartTime: '',
        shortBreakEndTime: '',
        longBreakStartTime: '',
        longBreakEndTime: '',
        office: { id: '' }
      });
      setEditingShift(null);
      fetchDataForTab('shifts');
    } catch (err) {
      showError(err);
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime?.substring(0, 5) || '09:00',
      endTime: shift.endTime?.substring(0, 5) || '18:00',
      graceMinutes: shift.graceMinutes,
      minHalfDayMinutes: shift.minHalfDayMinutes,
      minFullDayMinutes: shift.minFullDayMinutes,
      shortBreakStartTime: shift.shortBreakStartTime?.substring(0, 5) || '',
      shortBreakEndTime: shift.shortBreakEndTime?.substring(0, 5) || '',
      longBreakStartTime: shift.longBreakStartTime?.substring(0, 5) || '',
      longBreakEndTime: shift.longBreakEndTime?.substring(0, 5) || '',
      office: { id: shift.office?.id || '' }
    });
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      showSuccess('Attendance shift deleted.');
      fetchDataForTab('shifts');
    } catch (err) {
      showError(err);
    }
  };

  // 4. Pipeline Stage Actions
  const handleStageSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStage) {
        await api.put(`/pipeline-stages/${editingStage.id}`, stageForm);
        showSuccess('Pipeline stage updated.');
      } else {
        await api.post('/pipeline-stages', stageForm);
        showSuccess('Pipeline stage added.');
      }
      setStageForm({
        statusValue: 'NEW',
        label: '',
        color: '#3b82f6',
        analyticBucket: 'UNASSIGNED',
        orderIndex: 0,
        active: true,
        defaultFollowupDays: 1,
        requireNote: false,
        requireDate: false,
        createTask: false
      });
      setEditingStage(null);
      fetchDataForTab('pipeline');
    } catch (err) {
      showError(err);
    }
  };

  const handleEditStage = (stage) => {
    setEditingStage(stage);
    setStageForm({
      statusValue: stage.statusValue,
      label: stage.label,
      color: stage.color || '#3b82f6',
      analyticBucket: stage.analyticBucket || 'UNASSIGNED',
      orderIndex: stage.orderIndex,
      active: stage.active,
      defaultFollowupDays: stage.defaultFollowupDays,
      requireNote: stage.requireNote,
      requireDate: stage.requireDate,
      createTask: stage.createTask
    });
  };

  const handleDeleteStage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pipeline stage?')) return;
    try {
      await api.delete(`/pipeline-stages/${id}`);
      showSuccess('Pipeline stage deleted.');
      fetchDataForTab('pipeline');
    } catch (err) {
      showError(err);
    }
  };

  const handleReorderStage = async (id, direction) => {
    try {
      const response = await api.patch(`/pipeline-stages/${id}/reorder?direction=${direction}`);
      setStages(response.data || []);
      showSuccess('Reordered stages.');
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Modern Header Banner */}
        <div className="p-5 text-white position-relative" style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        }}>
          <h2 className="fw-bold mb-1">System Configuration Settings</h2>
          <p className="opacity-75 mb-0 fs-6">Manage multi-tenant workflow architectures, employee/lead templates, geolocations, and attendance schedules.</p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="bg-light px-4 border-bottom">
          <ul className="nav nav-pills py-3 gap-2">
            <li className="nav-item">
              <button 
                className={`nav-link px-4 py-2 fw-semibold border-0 rounded-pill ${activeTab === 'id-settings' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('id-settings')}
              >
                Id Formats (Lead/Emp)
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link px-4 py-2 fw-semibold border-0 rounded-pill ${activeTab === 'branches' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('branches')}
              >
                Branches & Geofences
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link px-4 py-2 fw-semibold border-0 rounded-pill ${activeTab === 'shifts' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('shifts')}
              >
                Attendance Shifts
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link px-4 py-2 fw-semibold border-0 rounded-pill ${activeTab === 'pipeline' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('pipeline')}
              >
                Lead Flow / Pipeline
              </button>
            </li>
          </ul>
        </div>

        {/* Card Body */}
        <div className="card-body p-4 p-md-5">
          {message && (
            <div className="alert alert-success border-0 shadow-sm rounded-3 py-3 px-4 mb-4 d-flex align-items-center">
              <span className="me-2">✨</span> {message}
            </div>
          )}
          {error && (
            <div className="alert alert-danger border-0 shadow-sm rounded-3 py-3 px-4 mb-4 d-flex align-items-center">
              <span className="me-2">⚠️</span> {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Retrieving configurations...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: ID Settings */}
              {activeTab === 'id-settings' && (
                <div>
                  <h4 className="fw-bold mb-3">ID Generation Presets</h4>
                  <p className="text-muted mb-4">Set format expressions and track registration sequences for generating new lead and employee identifiers automatically.</p>
                  
                  <form onSubmit={handleSaveIdSettings}>
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <div className="card p-4 border border-light-subtle rounded-3 h-100 shadow-sm">
                          <h5 className="fw-bold text-primary mb-3">Employee Template</h5>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Employee ID Format</label>
                            <input 
                              type="text" 
                              className="form-control form-control-lg rounded-3" 
                              placeholder="e.g. EMP-{TENANT}-{YYYY}-{SEQ}" 
                              value={employeeIdFormat} 
                              onChange={e => setEmployeeIdFormat(e.target.value)} 
                            />
                            <div className="form-text mt-2">
                              Placeholder tokens: <code>{'{TENANT}'}</code> (code), <code>{'{YYYY}'}</code> (year), <code>{'{SEQ}'}</code> (sequence).
                            </div>
                          </div>
                          <div>
                            <label className="form-label fw-semibold">Next Sequence Number</label>
                            <input 
                              type="number" 
                              className="form-control rounded-3" 
                              value={employeeSequence} 
                              onChange={e => setEmployeeSequence(e.target.value)} 
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card p-4 border border-light-subtle rounded-3 h-100 shadow-sm">
                          <h5 className="fw-bold text-purple mb-3" style={{ color: '#7c3aed' }}>Lead Template</h5>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Lead ID Format</label>
                            <input 
                              type="text" 
                              className="form-control form-control-lg rounded-3" 
                              placeholder="e.g. LEA-{TENANT}-{YYYY}-{SEQ}" 
                              value={leadIdFormat} 
                              onChange={e => setLeadIdFormat(e.target.value)} 
                            />
                            <div className="form-text mt-2">
                              Placeholder tokens: <code>{'{TENANT}'}</code> (code), <code>{'{YYYY}'}</code> (year), <code>{'{SEQ}'}</code> (sequence).
                            </div>
                          </div>
                          <div>
                            <label className="form-label fw-semibold">Next Sequence Number</label>
                            <input 
                              type="number" 
                              className="form-control rounded-3" 
                              value={leadSequence} 
                              onChange={e => setLeadSequence(e.target.value)} 
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">Save ID Settings</button>
                  </form>
                </div>
              )}

              {/* TAB 2: Branches (Office Locations) */}
              {activeTab === 'branches' && (
                <div>
                  <h4 className="fw-bold mb-3">{editingBranch ? 'Edit' : 'Add'} Office Location (Branch)</h4>
                  <p className="text-muted mb-4">Set up coordinates and geofencing configurations for employee check-ins and tracking bounds.</p>

                  <form onSubmit={handleBranchSubmit} className="mb-5 bg-light p-4 rounded-4 border">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Branch Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Head Office" 
                          value={branchForm.name}
                          onChange={e => setBranchForm({...branchForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Latitude</label>
                        <input 
                          type="number" 
                          step="0.0000001" 
                          className="form-control" 
                          placeholder="e.g. 12.9716" 
                          value={branchForm.latitude}
                          onChange={e => setBranchForm({...branchForm, latitude: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Longitude</label>
                        <input 
                          type="number" 
                          step="0.0000001" 
                          className="form-control" 
                          placeholder="e.g. 77.5946" 
                          value={branchForm.longitude}
                          onChange={e => setBranchForm({...branchForm, longitude: e.target.value})}
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Geofence Radius (meters)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={branchForm.radiusMeters}
                          onChange={e => setBranchForm({...branchForm, radiusMeters: parseFloat(e.target.value)})}
                          min="5"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Interval Sec (GPS Tracking)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={branchForm.trackingIntervalSec}
                          onChange={e => setBranchForm({...branchForm, trackingIntervalSec: parseInt(e.target.value, 10)})}
                          min="10"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Max GPS Accuracy Allowed (m)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={branchForm.maxAccuracyMeters}
                          onChange={e => setBranchForm({...branchForm, maxAccuracyMeters: parseInt(e.target.value, 10)})}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Max Idle Time (minutes)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={branchForm.maxIdleMinutes}
                          onChange={e => setBranchForm({...branchForm, maxIdleMinutes: parseInt(e.target.value, 10)})}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <button type="submit" className="btn btn-primary rounded-pill px-4 me-2">
                        {editingBranch ? 'Update Location' : 'Add Location'}
                      </button>
                      {editingBranch && (
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary rounded-pill px-4"
                          onClick={() => {
                            setEditingBranch(null);
                            setBranchForm({
                              name: '',
                              latitude: '',
                              longitude: '',
                              radiusMeters: 30,
                              trackingIntervalSec: 300,
                              maxAccuracyMeters: 100,
                              maxIdleMinutes: 30
                            });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <h5 className="fw-bold mb-3">Active Branch Locations</h5>
                  {branches.length === 0 ? (
                    <div className="alert alert-light text-center py-4 rounded-3 border">No office locations configured yet.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border">
                        <thead className="table-light">
                          <tr>
                            <th>Branch Name</th>
                            <th>Coordinates</th>
                            <th>Geofence Radius</th>
                            <th>GPS Tracking Config</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map(branch => (
                            <tr key={branch.id}>
                              <td className="fw-bold">{branch.name}</td>
                              <td>
                                <span className="badge bg-light text-dark border me-1">Lat: {branch.latitude}</span>
                                <span className="badge bg-light text-dark border">Lng: {branch.longitude}</span>
                              </td>
                              <td>{branch.radiusMeters} meters</td>
                              <td>
                                <small className="d-block">Interval: {branch.trackingIntervalSec}s</small>
                                <small className="d-block">Max Accuracy: {branch.maxAccuracyMeters}m</small>
                                <small className="d-block">Max Idle: {branch.maxIdleMinutes}m</small>
                              </td>
                              <td className="text-end">
                                <button 
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2"
                                  onClick={() => handleEditBranch(branch)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                  onClick={() => handleDeleteBranch(branch.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Shifts */}
              {activeTab === 'shifts' && (
                <div>
                  <h4 className="fw-bold mb-3">{editingShift ? 'Edit' : 'Add'} Attendance Shift</h4>
                  <p className="text-muted mb-4">Establish daily timing schedules, break rules, and grace constraints for employee check-ins.</p>

                  {branches.length === 0 ? (
                    <div className="alert alert-warning rounded-3 border">
                      ⚠️ You must add at least one Branch Location before setting up shifts.
                    </div>
                  ) : (
                    <form onSubmit={handleShiftSubmit} className="mb-5 bg-light p-4 rounded-4 border">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Shift Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Day Shift" 
                            value={shiftForm.name}
                            onChange={e => setShiftForm({...shiftForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Branch Office</label>
                          <select 
                            className="form-select"
                            value={shiftForm.office.id}
                            onChange={e => setShiftForm({...shiftForm, office: { id: e.target.value }})}
                            required
                          >
                            <option value="">Select Branch...</option>
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label fw-semibold">Start Time</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            value={shiftForm.startTime}
                            onChange={e => setShiftForm({...shiftForm, startTime: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label fw-semibold">End Time</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            value={shiftForm.endTime}
                            onChange={e => setShiftForm({...shiftForm, endTime: e.target.value})}
                            required
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Grace Minutes (Late entry limit)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={shiftForm.graceMinutes}
                            onChange={e => setShiftForm({...shiftForm, graceMinutes: parseInt(e.target.value, 10)})}
                            min="0"
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Min Half-Day (minutes)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={shiftForm.minHalfDayMinutes}
                            onChange={e => setShiftForm({...shiftForm, minHalfDayMinutes: parseInt(e.target.value, 10)})}
                            min="0"
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Min Full-Day (minutes)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={shiftForm.minFullDayMinutes}
                            onChange={e => setShiftForm({...shiftForm, minFullDayMinutes: parseInt(e.target.value, 10)})}
                            min="0"
                            required
                          />
                        </div>

                        {/* Break Times */}
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">Short Break Start</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            value={shiftForm.shortBreakStartTime}
                            onChange={e => setShiftForm({...shiftForm, shortBreakStartTime: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">Short Break End</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            value={shiftForm.shortBreakEndTime}
                            onChange={e => setShiftForm({...shiftForm, shortBreakEndTime: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">Lunch Break Start</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            value={shiftForm.longBreakStartTime}
                            onChange={e => setShiftForm({...shiftForm, longBreakStartTime: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">Lunch Break End</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            value={shiftForm.longBreakEndTime}
                            onChange={e => setShiftForm({...shiftForm, longBreakEndTime: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <button type="submit" className="btn btn-primary rounded-pill px-4 me-2">
                          {editingShift ? 'Update Shift' : 'Add Shift'}
                        </button>
                        {editingShift && (
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary rounded-pill px-4"
                            onClick={() => {
                              setEditingShift(null);
                              setShiftForm({
                                name: '',
                                startTime: '09:00',
                                endTime: '18:00',
                                graceMinutes: 15,
                                minHalfDayMinutes: 240,
                                minFullDayMinutes: 480,
                                shortBreakStartTime: '',
                                shortBreakEndTime: '',
                                longBreakStartTime: '',
                                longBreakEndTime: '',
                                office: { id: '' }
                              });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  <h5 className="fw-bold mb-3">Configured Attendance Shifts</h5>
                  {shifts.length === 0 ? (
                    <div className="alert alert-light text-center py-4 rounded-3 border">No shifts configured yet.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border">
                        <thead className="table-light">
                          <tr>
                            <th>Shift Name</th>
                            <th>Office location</th>
                            <th>Timing</th>
                            <th>Workday thresholds</th>
                            <th>Breaks</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shifts.map(shift => (
                            <tr key={shift.id}>
                              <td className="fw-bold text-primary">{shift.name}</td>
                              <td>{shift.office?.name || 'Unknown Branch'}</td>
                              <td>
                                <span className="badge bg-dark text-white me-1">{shift.startTime?.substring(0, 5)}</span>
                                to
                                <span className="badge bg-dark text-white ms-1">{shift.endTime?.substring(0, 5)}</span>
                                <small className="d-block text-muted mt-1">Grace period: {shift.graceMinutes} min</small>
                              </td>
                              <td>
                                <small className="d-block">Half-day: {shift.minHalfDayMinutes} min</small>
                                <small className="d-block">Full-day: {shift.minFullDayMinutes} min</small>
                              </td>
                              <td>
                                {shift.shortBreakStartTime && (
                                  <div className="small">☕ {shift.shortBreakStartTime.substring(0, 5)} - {shift.shortBreakEndTime?.substring(0, 5)}</div>
                                )}
                                {shift.longBreakStartTime && (
                                  <div className="small">🍔 {shift.longBreakStartTime.substring(0, 5)} - {shift.longBreakEndTime?.substring(0, 5)}</div>
                                )}
                                {!shift.shortBreakStartTime && !shift.longBreakStartTime && (
                                  <span className="text-muted small">No breaks</span>
                                )}
                              </td>
                              <td className="text-end">
                                <button 
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2"
                                  onClick={() => handleEditShift(shift)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                  onClick={() => handleDeleteShift(shift.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Pipeline Stages (Lead status / lead flow) */}
              {activeTab === 'pipeline' && (
                <div>
                  <h4 className="fw-bold mb-3">{editingStage ? 'Edit' : 'Create'} Lead Pipeline Stage</h4>
                  <p className="text-muted mb-4">Customize lead statuses and smart actions (requiring dates, notes, and task generation triggers) across lead lifecycles.</p>

                  <form onSubmit={handleStageSubmit} className="mb-5 bg-light p-4 rounded-4 border">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Status Code Key</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. NEW_STATUS" 
                          value={stageForm.statusValue}
                          onChange={e => setStageForm({...stageForm, statusValue: e.target.value.toUpperCase()})}
                          disabled={!!editingStage}
                          required
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Display Label</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Hot Lead" 
                          value={stageForm.label}
                          onChange={e => setStageForm({...stageForm, label: e.target.value})}
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Color Hex Code</label>
                        <div className="d-flex align-items-center gap-2">
                          <input 
                            type="color" 
                            className="form-control form-control-color border" 
                            value={stageForm.color}
                            onChange={e => setStageForm({...stageForm, color: e.target.value})}
                            title="Choose color"
                          />
                          <input 
                            type="text" 
                            className="form-control" 
                            value={stageForm.color}
                            onChange={e => setStageForm({...stageForm, color: e.target.value})}
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Analytic Bucket</label>
                        <select 
                          className="form-select"
                          value={stageForm.analyticBucket}
                          onChange={e => setStageForm({...stageForm, analyticBucket: e.target.value})}
                          required
                        >
                          <option value="UNASSIGNED">UNASSIGNED</option>
                          <option value="ENGAGED">ENGAGED</option>
                          <option value="WON">WON (Converted)</option>
                          <option value="LOST">LOST (Closed/Rejected)</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Order Index</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={stageForm.orderIndex}
                          onChange={e => setStageForm({...stageForm, orderIndex: parseInt(e.target.value, 10)})}
                          min="0"
                          required
                        />
                      </div>



                      <div className="col-md-6 d-flex align-items-center gap-4 mt-4 pt-3">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="requireNoteSwitch" 
                            checked={stageForm.requireNote}
                            onChange={e => setStageForm({...stageForm, requireNote: e.target.checked})}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="requireNoteSwitch">Require Note</label>
                        </div>

                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="requireDateSwitch" 
                            checked={stageForm.requireDate}
                            onChange={e => setStageForm({...stageForm, requireDate: e.target.checked})}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="requireDateSwitch">Require Date</label>
                        </div>

                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="createTaskSwitch" 
                            checked={stageForm.createTask}
                            onChange={e => setStageForm({...stageForm, createTask: e.target.checked})}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="createTaskSwitch">Create Task Trigger</label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button type="submit" className="btn btn-primary rounded-pill px-4 me-2">
                        {editingStage ? 'Update Stage' : 'Create Stage'}
                      </button>
                      {editingStage && (
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary rounded-pill px-4"
                          onClick={() => {
                            setEditingStage(null);
                            setStageForm({
                              statusValue: 'NEW',
                              label: '',
                              color: '#3b82f6',
                              analyticBucket: 'UNASSIGNED',
                              orderIndex: 0,
                              active: true,
                              defaultFollowupDays: 1,
                              requireNote: false,
                              requireDate: false,
                              createTask: false
                            });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <h5 className="fw-bold mb-3">Workflow Stages Order</h5>
                  {stages.length === 0 ? (
                    <div className="alert alert-light text-center py-4 rounded-3 border">No pipeline stages configured.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '80px' }}>Order</th>
                            <th>Status Value</th>
                            <th>Label</th>
                            <th>Analytic Bucket</th>
                            <th>Smart Rules Trigger</th>
                            <th className="text-end" style={{ width: '220px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stages.map((stage, idx) => (
                            <tr key={stage.id}>
                              <td className="fw-bold text-center">
                                <span className="badge bg-secondary rounded-circle">{stage.orderIndex}</span>
                              </td>
                              <td className="fw-bold">
                                <span className="d-flex align-items-center gap-2">
                                  <span className="rounded-circle border" style={{
                                    display: 'inline-block',
                                    width: '14px',
                                    height: '14px',
                                    backgroundColor: stage.color || '#cccccc'
                                  }}></span>
                                  {stage.statusValue}
                                </span>
                              </td>
                              <td>{stage.label}</td>
                              <td>
                                <span className={`badge ${
                                  stage.analyticBucket === 'WON' ? 'bg-success-subtle text-success border border-success' :
                                  stage.analyticBucket === 'LOST' ? 'bg-danger-subtle text-danger border border-danger' :
                                  stage.analyticBucket === 'ENGAGED' ? 'bg-info-subtle text-info border border-info' : 'bg-light text-dark border'
                                } px-3 py-1`}>
                                  {stage.analyticBucket}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {stage.requireNote && <span className="badge bg-light text-dark border">Require Note</span>}
                                  {stage.requireDate && <span className="badge bg-light text-dark border">Require Date</span>}
                                  {stage.createTask && <span className="badge bg-light text-dark border">Auto Task</span>}

                                </div>
                              </td>
                              <td className="text-end">
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  <button 
                                    className="btn btn-sm btn-light border px-2"
                                    onClick={() => handleReorderStage(stage.id, 'UP')}
                                    disabled={idx === 0}
                                    title="Move Up"
                                  >
                                    ▲
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-light border px-2 me-2"
                                    onClick={() => handleReorderStage(stage.id, 'DOWN')}
                                    disabled={idx === stages.length - 1}
                                    title="Move Down"
                                  >
                                    ▼
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                    onClick={() => handleEditStage(stage)}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                    onClick={() => handleDeleteStage(stage.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
