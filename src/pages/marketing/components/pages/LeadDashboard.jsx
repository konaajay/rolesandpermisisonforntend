import React, { useState, useEffect } from 'react';
import { getLeads } from '../../services/api';

const LeadDashboard = () => {
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await getLeads();
            // Spring Data Page usually has 'content' field, fallback to array
            const leadList = res?.content || (Array.isArray(res) ? res : []);
            setLeads(leadList);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch leads', err);
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.courseInterest?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
                        <h5 className="card-title mb-0">Marketing Leads</h5>
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ maxWidth: '250px' }}
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-premium-primary btn-sm px-3" onClick={fetchLeads}>Refresh</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact</th>
                                        <th>Interest</th>
                                        <th>UTM Source</th>
                                        <th>Campaign</th>
                                        <th>Date</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(filteredLeads) && filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                                        <tr key={lead.id}>
                                            <td><strong>{lead.name}</strong></td>
                                            <td>
                                                <div className="small">{lead.email}</div>
                                                <div className="small text-muted">{lead.phone}</div>
                                            </td>
                                            <td><span className="badge bg-info text-dark">{lead.courseInterest}</span></td>
                                            <td>{lead.utmSource || lead.source || 'DIRECT'}</td>
                                            <td>{lead.utmCampaign || '-'}</td>
                                            <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                            <td className="text-end">
                                                <a 
                                                    href={`/admin/users?name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email)}&role=Student&phone=${encodeURIComponent(lead.phone || '')}`}
                                                    className="btn btn-premium-primary btn-sm px-3"
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    Create Account
                                                </a>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">No leads found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadDashboard;
