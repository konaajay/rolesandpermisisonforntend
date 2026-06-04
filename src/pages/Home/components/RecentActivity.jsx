import React, { useState } from 'react';
import { MoreHorizontal, Filter, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const RecentActivity = ({ students, payments }) => {
    const [activeTab, setActiveTab] = useState('students');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const currentData = activeTab === 'students' ? students : payments;
    const totalItems = currentData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

    const handleAction = (action) => {
        toast.info(`${action} feature coming soon!`);
    };

    const handleMoreAction = (name) => {
        toast.info(`Options for ${name}`);
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="recent-activity-container">
            <div className="activity-header">
                <div className="header-left">
                    <h3 className="section-title">Recent Activity</h3>
                    <p className="section-subtitle">Latest student registrations and transaction history</p>
                </div>
                <div className="header-actions-group">
                    <div className="tabs-pill">
                        <button
                            className={`tab-pill-btn ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('students'); setCurrentPage(1); }}
                        >
                            New Students
                        </button>
                        <button
                            className={`tab-pill-btn ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('payments'); setCurrentPage(1); }}
                        >
                            Transactions
                        </button>
                    </div>
                    <button className="icon-btn-outline" onClick={() => handleAction('Filter')}><Filter size={16} /></button>
                    <button className="icon-btn-outline" onClick={() => handleAction('Download Report')}><Download size={16} /></button>
                </div>
            </div>

            <div className="table-wrapper">
                {activeTab === 'students' ? (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th width="30%">Student</th>
                                <th width="25%">Course</th>
                                <th width="20%">Progress</th>
                                <th width="15%">Status</th>
                                <th width="10%">Date</th>
                                <th width="5%">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((student) => (
                                <tr key={student.id}>
                                    <td>
                                        <div className="user-profile-cell">
                                            <div className="avatar-wrapper">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt={student.name} />
                                                ) : (
                                                    <span className="avatar-placeholder">{student.name.charAt(0)}</span>
                                                )}
                                                <div className="status-dot-online"></div>
                                            </div>
                                            <div className="user-meta">
                                                <span className="name">{student.name}</span>
                                                <span className="email">{student.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="course-badge">{student.course}</span>
                                    </td>
                                    <td>
                                        <div className="progress-cell">
                                            <div className="progress-track">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${student.progress}%`,
                                                        backgroundColor: student.progress === 100 ? '#10b981' :
                                                            student.progress > 50 ? '#3B82F6' : '#F59E0B'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="progress-label">{student.progress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-chip ${student.status.toLowerCase()}`}>
                                            <span className="chip-dot"></span>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="date-cell">{student.date}</td>
                                    <td>
                                        <button className="action-dots" onClick={() => handleMoreAction(student.name)}><MoreHorizontal size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th width="30%">User</th>
                                <th width="15%">Invoice ID</th>
                                <th width="15%">Amount</th>
                                <th width="15%">Method</th>
                                <th width="15%">Status</th>
                                <th width="10%">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <div className="user-profile-cell">
                                            <div className="avatar-wrapper placeholder-blue">
                                                <span className="avatar-placeholder">{payment.user.charAt(0)}</span>
                                            </div>
                                            <div className="user-meta">
                                                <span className="name">{payment.user}</span>
                                                <span className="email">{payment.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="invoice-text">#{payment.invoiceId}</span></td>
                                    <td><span className="amount-text">${payment.amount}</span></td>
                                    <td>
                                        <div className="method-badge">
                                            <i className={`bi bi-${payment.method === 'PayPal' ? 'paypal' : 'credit-card'}`}></i>
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-chip ${payment.status.toLowerCase()}`}>
                                            <span className="chip-dot"></span>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="date-cell">{payment.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="table-footer">
                <p>Showing <strong>{currentItems.length}</strong> of <strong>{totalItems}</strong> results</p>
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={currentPage === page ? 'active' : ''}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;
