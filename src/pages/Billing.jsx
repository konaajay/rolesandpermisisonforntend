import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Zap, Shield, Crown } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Billing() {
  const { tenantCode } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/subscriptions');
      if (res.data && res.data.success) {
        setHistory(res.data.data);
        if (res.data.data.length > 0) {
          setCurrentPlan(res.data.data[0]); // assuming 0 is latest
        }
      }
    } catch (error) {
      console.error("Error fetching subscription history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName, amount, durationDays) => {
    try {
      setUpgrading(true);
      // Mock payment flow
      const req = {
        planName,
        amount,
        durationDays,
        paymentReference: 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      };
      
      const res = await api.post('/api/subscriptions', req);
      if (res.data && res.data.success) {
        alert('Subscription upgraded successfully!');
        fetchHistory();
      }
    } catch (error) {
      console.error("Error upgrading", error);
      alert('Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const plans = [
    { name: 'Starter', price: 99, days: 30, icon: <Zap className="w-6 h-6 text-yellow-400" />, features: ['Up to 10 Users', 'Basic Modules', 'Email Support'] },
    { name: 'Professional', price: 299, days: 30, icon: <Shield className="w-6 h-6 text-blue-400" />, features: ['Up to 50 Users', 'All Modules', 'Priority Support', 'Custom Branding'] },
    { name: 'Enterprise', price: 999, days: 30, icon: <Crown className="w-6 h-6 text-purple-400" />, features: ['Unlimited Users', 'Dedicated Success Manager', '24/7 Phone Support', 'Custom Integrations'] }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            Billing & Subscriptions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage your workspace plan and billing history</p>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Current Subscription</h2>
        {currentPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Active Plan</p>
              <p className="text-xl font-bold text-cyan-400">{currentPlan.planName}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{currentPlan.status}</span>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Renewal Date</p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-slate-200">{currentPlan.endDate}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-amber-400 bg-amber-400/10 p-4 rounded-lg border border-amber-400/20">
            <AlertCircle className="w-5 h-5" />
            <p>You are currently on a Free Trial or no active plan is detected.</p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-slate-800 border ${currentPlan?.planName === plan.name ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-700'} rounded-xl p-6 flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:border-slate-500`}>
              {currentPlan?.planName === plan.name && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  CURRENT
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-slate-900 rounded-lg">
                  {plan.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{plan.name}</h3>
                  <p className="text-2xl font-black text-white">${plan.price}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleUpgrade(plan.name, plan.price, plan.days)}
                disabled={upgrading || currentPlan?.planName === plan.name}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                  currentPlan?.planName === plan.name 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                }`}
              >
                {upgrading ? 'Processing...' : (currentPlan?.planName === plan.name ? 'Active Plan' : 'Upgrade')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Billing History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Period</th>
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No billing history found.</td></tr>
              ) : (
                history.map((invoice, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-colors text-sm">
                    <td className="p-4 text-slate-300">{invoice.createdAt?.split(' ')[0]}</td>
                    <td className="p-4 text-slate-100 font-medium">{invoice.planName}</td>
                    <td className="p-4 text-slate-300">${invoice.amount?.toFixed(2)}</td>
                    <td className="p-4 text-slate-400 text-xs">{invoice.startDate} to {invoice.endDate}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{invoice.paymentReference}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded text-xs font-medium">
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
