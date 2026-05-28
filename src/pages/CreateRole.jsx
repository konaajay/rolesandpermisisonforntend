import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CreateRole() {
  const [roles, setRoles] = useState([]);

  // Create/Edit Role State
  const [editRoleId, setEditRoleId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Manage Extra Fields State
  const [selectedRoleForFields, setSelectedRoleForFields] = useState(null);
  const [roleFields, setRoleFields] = useState([]);
  const [fieldEditingId, setFieldEditingId] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldDisplayOrder, setFieldDisplayOrder] = useState('0');
  const [modalMessage, setModalMessage] = useState(null);
  const [modalError, setModalError] = useState(null);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const payload = {
      name,
      description,
      permissionIds: [], // We send an empty array because CreateRoleRequest requires it but we no longer map here
    };

    try {
      if (editRoleId) {
        await api.put(`/roles/${editRoleId}`, payload);
        setMessage('Role Updated Successfully!');
      } else {
        await api.post('/roles', payload);
        setMessage('Role Created Successfully!');
      }
      resetForm();
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleEditClick = (role) => {
    setEditRoleId(role.id);
    setName(role.name);
    setDescription(role.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditRoleId(null);
    setName('');
    setDescription('');
    setError(null);
    setMessage(null);
  };

  const handleToggleStatus = async (role) => {
    setMessage(null);
    setError(null);
    try {
      if (role.active) {
        await api.put(`/roles/${role.id}/disable`);
        setMessage(`Role '${role.name}' disabled successfully!`);
      } else {
        await api.put(`/roles/${role.id}/enable`);
        setMessage(`Role '${role.name}' enabled successfully!`);
      }
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Extra Fields Handlers
  const fetchRoleFields = async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}/extra-fields`);
      setRoleFields(response.data);
    } catch (err) {
      console.error('Error fetching role fields:', err);
    }
  };

  const handleOpenFields = (role) => {
    setSelectedRoleForFields(role);
    fetchRoleFields(role.id);
    resetFieldForm();
    setModalMessage(null);
    setModalError(null);
  };

  const handleSaveField = async (e) => {
    e.preventDefault();
    setModalMessage(null);
    setModalError(null);

    const parsedOptions = fieldOptions
      ? fieldOptions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      fieldName,
      fieldLabel,
      fieldType,
      required: fieldRequired,
      options: parsedOptions,
      displayOrder: parseInt(fieldDisplayOrder, 10) || 0
    };

    try {
      if (fieldEditingId) {
        await api.put(`/roles/${selectedRoleForFields.id}/extra-fields/${fieldEditingId}`, payload);
        setModalMessage('Field updated successfully!');
      } else {
        await api.post(`/roles/${selectedRoleForFields.id}/extra-fields`, payload);
        setModalMessage('Field created successfully!');
      }
      resetFieldForm();
      fetchRoleFields(selectedRoleForFields.id);
    } catch (err) {
      setModalError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleEditField = (field) => {
    setFieldEditingId(field.id);
    setFieldName(field.fieldName);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldOptions(field.options ? field.options.join(', ') : '');
    setFieldDisplayOrder(field.displayOrder?.toString() || '0');
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    setModalMessage(null);
    setModalError(null);
    try {
      await api.delete(`/roles/${selectedRoleForFields.id}/extra-fields/${fieldId}`);
      setModalMessage('Field deleted successfully!');
      fetchRoleFields(selectedRoleForFields.id);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message);
    }
  };

  const resetFieldForm = () => {
    setFieldEditingId(null);
    setFieldName('');
    setFieldLabel('');
    setFieldType('TEXT');
    setFieldRequired(false);
    setFieldOptions('');
    setFieldDisplayOrder('0');
  };

  return (
    <div className="container-fluid mt-4">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* Left Column - Forms */}
        <div className="col-lg-4 col-md-12 mb-4">
          
          {/* Card: Create/Edit Role */}
          <div className="card p-3 shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">{editRoleId ? 'Edit Role' : 'Create Role'}</h4>
              {editRoleId && (
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleCreateRole}>
              <div className="mb-3">
                <label className="form-label font-weight-bold">Role Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. MANAGER"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Role description"
                  rows="3"
                />
              </div>

              <div className="d-grid">
                <button type="submit" className={`btn ${editRoleId ? 'btn-warning' : 'btn-primary'} btn-lg`}>
                  {editRoleId ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Roles List */}
        <div className="col-lg-8 col-md-12">
          <div className="card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Roles List</h4>
              <button className="btn btn-outline-primary btn-sm" onClick={fetchRoles}>
                Refresh Roles
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover table-sm">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Permissions Map</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No roles found.
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id}>
                        <td><code>{role.id}</code></td>
                        <td><strong>{role.name}</strong></td>
                        <td>{role.description}</td>
                        <td>
                          <span className={`badge bg-${role.active ? 'success' : 'danger'}`}>
                            {role.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          {role.permissions && Array.from(role.permissions).length > 0 ? (
                            <span className="text-success small fw-bold">
                              {Array.from(role.permissions).length} Permissions Mapped
                            </span>
                          ) : (
                            <span className="text-muted small">None</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                            onClick={() => handleEditClick(role)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-info btn-sm me-2 text-white"
                            style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                            onClick={() => handleOpenFields(role)}
                          >
                            Fields
                          </button>
                          <button
                            className={`btn btn-${role.active ? 'danger' : 'success'} btn-sm`}
                            style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                            onClick={() => handleToggleStatus(role)}
                          >
                            {role.active ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedRoleForFields && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  Manage Extra Fields for Role: <strong>{selectedRoleForFields.name}</strong>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedRoleForFields(null)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {modalMessage && <div className="alert alert-success py-2">{modalMessage}</div>}
                {modalError && <div className="alert alert-danger py-2">{modalError}</div>}

                {/* Form to Create/Edit Extra Field */}
                <div className="card p-3 mb-4 bg-light border">
                  <h6>{fieldEditingId ? 'Edit Extra Field' : 'Add New Extra Field'}</h6>
                  <form onSubmit={handleSaveField}>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label small mb-1 fw-bold">Field Name (camelCase key)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={fieldName}
                          onChange={(e) => setFieldName(e.target.value)}
                          required
                          placeholder="e.g. rollNo"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small mb-1 fw-bold">Field Label (Display name)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={fieldLabel}
                          onChange={(e) => setFieldLabel(e.target.value)}
                          required
                          placeholder="e.g. Roll Number"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small mb-1 fw-bold">Field Type</label>
                        <select
                          className="form-select form-select-sm"
                          value={fieldType}
                          onChange={(e) => setFieldType(e.target.value)}
                          required
                        >
                          <option value="TEXT">Text</option>
                          <option value="NUMBER">Number</option>
                          <option value="DROPDOWN">Dropdown</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-2 mt-2">
                      <div className="col-md-6">
                        <label className="form-label small mb-1 fw-bold">Options (Comma separated, for Dropdown)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={fieldOptions}
                          onChange={(e) => setFieldOptions(e.target.value)}
                          placeholder="e.g. CSE, ECE, IT"
                          disabled={fieldType !== 'DROPDOWN'}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small mb-1 fw-bold">Display Order</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={fieldDisplayOrder}
                          onChange={(e) => setFieldDisplayOrder(e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="col-md-3 d-flex align-items-end">
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="fieldRequiredCheck"
                            checked={fieldRequired}
                            onChange={(e) => setFieldRequired(e.target.checked)}
                          />
                          <label className="form-check-label small fw-bold" htmlFor="fieldRequiredCheck">
                            Required Field
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      {fieldEditingId && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={resetFieldForm}>
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary btn-sm">
                        {fieldEditingId ? 'Save Field' : 'Add Field'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of Existing Fields */}
                <h6>Existing Fields</h6>
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-sm border align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Key</th>
                        <th>Label</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Options</th>
                        <th>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleFields.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-3">
                            No custom fields defined for this role.
                          </td>
                        </tr>
                      ) : (
                        roleFields.map((field) => (
                          <tr key={field.id}>
                            <td><code>{field.fieldName}</code></td>
                            <td><strong>{field.label}</strong></td>
                            <td><span className="badge bg-secondary">{field.type}</span></td>
                            <td>
                              <span className={`badge bg-${field.required ? 'danger' : 'light text-dark'}`}>
                                {field.required ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td>
                              {field.options && field.options.length > 0 ? (
                                <span className="small text-muted">{field.options.join(', ')}</span>
                              ) : (
                                <span className="text-muted small">-</span>
                              )}
                            </td>
                            <td>{field.displayOrder || 0}</td>
                            <td>
                              <button
                                className="btn btn-warning btn-sm me-1 py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleEditField(field)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleDeleteField(field.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRoleForFields(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
