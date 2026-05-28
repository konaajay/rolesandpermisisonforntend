import React, { useState, useEffect } from 'react';

// === DYNAMIC FIELD COMPONENT ===
const DynamicFieldInput = ({ field, value, onChange }) => {
    if (field.type === 'DROPDOWN') {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <select
                    className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required={field.required}
                    value={value || ''}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                >
                    <option value="">Select...</option>
                    {field.options && field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={field.type === 'NUMBER' ? 'number' : 'text'}
                placeholder={field.label}
                className="w-full p-2.5 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required={field.required}
                value={value || ''}
                onChange={(e) => onChange(field.fieldName, e.target.value)}
            />
        </div>
    );
};

// === MAIN FORM COMPONENT ===
export default function CreateUserForm() {
    const [assignableRoles, setAssignableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    
    // Core payload structure
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: null,
        roleCode: '',
        supervisorUserId: '',
        profileData: {}
    });

    useEffect(() => {
        const fetchRoles = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('/api/roles', { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const roles = await res.json();
                    setAssignableRoles(roles);
                }
            } catch (err) {
                console.error("Failed to fetch roles", err);
            }
        };
        fetchRoles();
    }, []);

    const handleRoleSelect = async (e) => {
        const roleId = e.target.value;
        const roleObj = assignableRoles.find(r => r.id.toString() === roleId);
        
        setSelectedRole(roleObj);
        
        if (roleObj) {
            // Reset profile fields, supervisor, and set role info
            setFormData(prev => ({
                ...prev,
                roleId: roleObj.id,
                roleCode: roleObj.code,
                supervisorUserId: '',
                profileData: {}
            }));

            // Fetch Dynamic Extra Fields
            try {
                const token = localStorage.getItem('token');
                const fieldsRes = await fetch(`/api/roles/${roleObj.id}/extra-fields`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (fieldsRes.ok) {
                    const fields = await fieldsRes.json();
                    setDynamicFields(fields);
                } else {
                    setDynamicFields([]);
                }
            } catch (err) {
                console.error("Error fetching role extra fields", err);
                setDynamicFields([]);
            }

            // Fetch Supervisors
            try {
                const token = localStorage.getItem('token');
                const supervisorRes = await fetch(`/api/users/supervisors?roleId=${roleObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (supervisorRes.ok) {
                    const data = await supervisorRes.json();
                    setSupervisors(data);
                } else {
                    setSupervisors([]);
                }
            } catch (err) {
                console.error("Error fetching supervisors", err);
                setSupervisors([]);
            }
        } else {
            setDynamicFields([]);
            setSupervisors([]);
            setSelectedRole(null);
            setFormData(prev => ({
                ...prev,
                roleId: null,
                roleCode: '',
                supervisorUserId: '',
                profileData: {}
            }));
        }
    };

    const handleProfileDataChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            profileData: {
                ...prev.profileData,
                [key]: value
            }
        }));
    };

    const handleSupervisorChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            supervisorUserId: val ? Number(val) : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage('User successfully created with dynamic profile and hierarchy mapping!');
                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    roleId: null,
                    roleCode: '',
                    supervisorUserId: '',
                    profileData: {}
                });
                setSelectedRole(null);
                setDynamicFields([]);
                setSupervisors([]);
                e.target.reset();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to create user');
            }
        } catch (err) {
            setError('An error occurred during submission');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Onboard New User</h2>
                
                {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">{message}</div>}
                {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">{error}</div>}

                <h3 className="font-semibold text-gray-700 mb-3 text-lg">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="First Name" 
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                    />
                    
                    <input 
                        type="text" 
                        placeholder="Last Name" 
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                    
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                </div>

                <h3 className="font-semibold text-gray-700 mt-8 mb-3 text-lg">Role & Access</h3>
                <div className="">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Select User Role</label>
                    <select 
                        className="w-full p-3 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        required 
                        onChange={handleRoleSelect}
                        value={formData.roleId || ''}
                    >
                        <option value="">Select a Role...</option>
                        {assignableRoles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.name} ({role.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Supervisor Selection Rendering */}
                {supervisors.length > 0 && (
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Supervisor (Reports To)
                        </label>
                        <select 
                            className="w-full p-3 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.supervisorUserId || ''}
                            onChange={handleSupervisorChange}
                            required
                        >
                            <option value="">Select Supervisor...</option>
                            {supervisors.map(sup => (
                                <option key={sup.id} value={sup.id}>
                                    {sup.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Dynamic Extra Fields Rendering */}
                {dynamicFields.length > 0 && (
                    <div className="mt-8 transition-all duration-300 ease-in-out border border-blue-100 p-6 rounded-xl bg-blue-50/30">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">
                            Additional Profile Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {dynamicFields.map(field => (
                                <DynamicFieldInput
                                    key={field.fieldName}
                                    field={field}
                                    value={formData.profileData[field.fieldName] || ''}
                                    onChange={handleProfileDataChange}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" className="w-full mt-8 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 font-bold transition shadow-md">
                    Provision User
                </button>
            </form>
        </div>
    );
}
