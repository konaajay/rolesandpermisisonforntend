import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AttendanceSnapshot = ({ stats }) => {

    const data = [
        { name: 'Present', value: stats.present, color: '#10b981' }, // Green
        { name: 'Absent', value: stats.absent, color: '#ef4444' }, // Red
        { name: 'Late', value: stats.late, color: '#f59e0b' }, // Yellow
    ];

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">Attendance Snapshot</h5>
                <small className="text-muted">Today's metrics</small>
            </div>
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                    <div style={{ width: '120px', height: '120px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={40}
                                    outerRadius={55}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-grow-1 ps-4">
                        {data.map(item => (
                            <div key={item.name} className="d-flex justify-content-between mb-2 small">
                                <span className="d-flex align-items-center gap-2">
                                    <span className="dot" style={{ background: item.color }}></span>
                                    {item.name}
                                </span>
                                <span className="fw-bold">{item.value}%</span>
                            </div>
                        ))}
                        {stats.offlinePending > 0 && (
                            <div className="alert alert-warning py-1 px-2 mt-2 mb-0 small text-center">
                                {stats.offlinePending} Offline Batches Pending
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSnapshot;
