import React, { useState, useEffect } from 'react';
import { getReferralCode, getReferralStats } from '../../services/api';
import { LuLink, LuUsers, LuInfo } from 'react-icons/lu';

export default function ReferralHub() {
    const [learnerId] = useState(null); // Learner ID should be fetched from Auth Context
    const [referralCode, setReferralCode] = useState(null);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (learnerId) {
            fetchReferralData();
        } else {
            setLoading(false);
        }
    }, [learnerId]);

    const fetchReferralData = async () => {
        try {
            const codeRes = await getReferralCode(learnerId);
            setReferralCode(codeRes.data.code);
            const statsRes = await getReferralStats(learnerId);
            setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
        } catch (err) {
            console.error('Failed to fetch referral data', err);
            setStats([]);
        } finally {
            setLoading(false);
        }
    };

    const shareUrl = referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : '';

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    if (!learnerId) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-info border-0 shadow-sm p-4 rounded-4">
                    <LuInfo size={40} className="mb-3 opacity-50" />
                    <h4 className="fw-bold">Sign in to view Referral Hub</h4>
                    <p className="text-muted mb-0">You need to be logged in as a learner to share your referral link and earn rewards.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg border-0 overflow-hidden rounded-4">
                        <div className="card-body p-5 text-center bg-primary text-white">
                            <h2 className="display-6 fw-bold mb-3">Refer & Earn Rewards!</h2>
                            <p className="lead mb-4 opacity-75">Share the love for learning and get rewarded. Your friends get credits, and you get bonuses on their first purchase!</p>

                            <div className="bg-white rounded-3 p-3 d-inline-block shadow-sm">
                                <span className="text-dark fw-bold fs-3 text-uppercase">{referralCode}</span>
                            </div>

                            <div className="mt-4">
                                <button className="btn btn-light btn-lg px-5 fw-bold text-primary rounded-pill shadow" onClick={handleCopy}>
                                    <LuLink className="me-2" /> Copy Sharing Link
                                </button>
                            </div>
                        </div>

                        <div className="card-body p-5">
                            <h4 className="fw-bold mb-4">Your Referral Activity</h4>

                            {stats.length === 0 ? (
                                <div className="text-center py-4 bg-light rounded-3">
                                    <LuUsers size={48} className="text-muted opacity-25 d-block mx-auto mb-3" />
                                    <p className="text-muted">No referrals yet. Start sharing to earn rewards!</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Friend</th>
                                                <th>Status</th>
                                                <th className="text-end">Your Reward</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(stats) && stats.map(s => (
                                                <tr key={s.id}>
                                                    <td>
                                                        <div className="fw-bold">User #{s.refereeId}</div>
                                                        <div className="smallest text-muted">{new Date(s.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${s.status === 'REWARDED' ? 'success' : 'info'} rounded-pill px-3`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-bold text-success">
                                                        {s.status === 'REWARDED' ? `+₹${s.referrerReward}` : '--'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-5 bg-info-subtle p-4 rounded-3 text-start">
                                <h6 className="fw-bold text-info-emphasis"><LuInfo className="me-2" /> How it works?</h6>
                                <p className="small mb-0">When they register with your link, they get 20 credits. When they complete their first enrollment, you get 50 credits in your wallet! Credits can be used for up to 10% of any course price.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
