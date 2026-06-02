import { useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FileSignature, Calendar, AlertCircle, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Modal from '../components/Modal';

import { useEffect } from 'react';


const statusBadge = {
  Active:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Expired: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  Renewed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const Contracts = () => {
  const { searchQuery } = useAppStore();
  const [contracts, setContracts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isAddOpen,  setIsAddOpen]  = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [editContract, setEditContract] = useState(null);
  const [newContract, setNewContract] = useState({ title: '', vendorId: '', amount: '', startDate: '', expires: '', notes: '' });

  const fetchContracts = async () => {
    try {
      const res = await api.get('/api/vendor-contracts');
      if (res.data.success) setContracts(res.data.data);
    } catch (e) { console.error("Error fetching contracts", e); }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/api/vendors');
      if (response.data.success) setVendors(response.data.data.content || response.data.data);
    } catch (error) { console.error("Error fetching vendors", error); }
  };

  useEffect(() => {
    fetchContracts();
    fetchVendors();
  }, []);

  const openView = (c) => { setSelected(c); setIsViewOpen(true); };
  const openEdit = (c) => { setEditContract({ ...c }); setIsViewOpen(false); setIsEditOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this contract?')) {
      try {
        await api.delete(`/api/vendor-contracts/${id}`);
        fetchContracts();
        setIsViewOpen(false);
      } catch (e) { console.error("Error deleting contract", e); }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newContract, status: 'Active' };
      await api.post('/api/vendor-contracts', payload);
      fetchContracts();
      setNewContract({ title: '', vendorId: '', amount: '', startDate: '', expires: '', notes: '' });
      setIsAddOpen(false);
    } catch (e) { console.error("Error creating contract", e); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/vendor-contracts/${editContract.id}`, editContract);
      fetchContracts();
      setIsEditOpen(false);
      setEditContract(null);
    } catch (e) { console.error("Error updating contract", e); }
  };

  const filteredContracts = contracts.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expiringContract = contracts.find(c => c.status === 'Active') || null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Contract Management</h2>
          <p className="text-slate-400 text-sm mt-1">Manage agreements and track SLA renewals</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary flex items-center shrink-0 w-full sm:w-auto justify-center">
          <Plus size={16} className="mr-2" /> New Contract
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Contracts List */}
        <div className="glass-panel p-4 sm:p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Active Contracts</h3>
          <div className="space-y-4">
            {filteredContracts.length > 0 ? filteredContracts.map((c) => (
              <div key={c.id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800/60 hover:border-slate-600 transition-all group cursor-pointer" onClick={() => openView(c)}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg mr-4 shrink-0"><FileSignature size={22} /></div>
                    <div>
                      <h4 className="font-medium text-slate-200">{c.title}</h4>
                      <p className="text-sm text-slate-400">{c.vendorName} · {c.amount}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 ml-14 sm:ml-0">
                    <div className="flex items-center text-sm text-slate-300">
                      <Calendar size={13} className="mr-1.5 text-slate-400" /> Expires {c.expires}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge[c.status] || statusBadge.Active}`}>{c.status}</span>
                  </div>
                </div>
                {/* Hover actions */}
                <div className="flex gap-2 justify-end mt-3 pt-3 border-t border-slate-700/40">
                  <button onClick={(e) => { e.stopPropagation(); openView(c); }} className="btn-icon text-xs gap-1 flex items-center px-2 py-1" title="View">
                    <Eye size={13} /> View
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="btn-icon text-xs gap-1 flex items-center px-2 py-1" title="Edit">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="btn-icon hover:text-rose-400 text-xs gap-1 flex items-center px-2 py-1" title="Delete">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">No contracts found matching "{searchQuery}"</div>
            )}
          </div>
        </div>

        {/* Action Required */}
        <div className="glass-panel p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center">
            <AlertCircle className="text-rose-400 mr-2" size={20} /> Action Required
          </h3>
          <div className="space-y-4">
            {expiringContract ? (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                <h4 className="font-medium text-rose-300 text-sm">Expiring Soon</h4>
                <p className="text-slate-300 text-sm mt-1">{expiringContract.vendorName} — {expiringContract.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">Expires {expiringContract.expires}</p>
                <button
                  onClick={() => { openEdit({ ...expiringContract, status: 'Renewed' }); }}
                  className="mt-3 text-xs bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/30 transition-colors"
                >
                  Renew Contract
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">No action required at this time.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── View Contract Modal ── */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Contract Details">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-slate-700/50 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">{selected.title}</h3>
                <p className="text-sm text-cyan-400 mt-0.5">{selected.vendorName}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusBadge[selected.status] || statusBadge.Active}`}>{selected.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 text-xs mb-0.5">Contract Value</p><p className="text-slate-50 font-bold text-lg">{selected.amount}</p></div>
              <div><p className="text-slate-500 text-xs mb-0.5">Start Date</p><p className="text-slate-200">{selected.startDate}</p></div>
              <div className="col-span-2"><p className="text-slate-500 text-xs mb-0.5">Expiry Date</p><p className="text-slate-200">{selected.expires}</p></div>
            </div>
            {selected.notes && (
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-300">{selected.notes}</p>
              </div>
            )}
            <div className="pt-2 flex justify-between items-center border-t border-slate-700/50">
              <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 px-3 py-2 rounded-lg transition-colors">
                <Trash2 size={15} /> Delete
              </button>
              <div className="flex gap-3">
                <button onClick={() => setIsViewOpen(false)} className="btn-secondary">Close</button>
                <button onClick={() => openEdit(selected)} className="btn-primary flex items-center gap-2"><Edit2 size={15} /> Edit</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Contract Modal ── */}
      {editContract && (
        <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditContract(null); }} title="Edit Contract">
          <form className="space-y-4" onSubmit={handleEditSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Contract Title *</label>
                <input type="text" className="input-field" required value={editContract.title} onChange={(e) => setEditContract({ ...editContract, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vendor *</label>
                <select className="input-field" required value={editContract.vendorId} onChange={(e) => setEditContract({ ...editContract, vendorId: e.target.value })}>
                  <option value="">Select Vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contract Value</label>
                <input type="text" className="input-field" placeholder="$0" value={editContract.amount} onChange={(e) => setEditContract({ ...editContract, amount: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                <input type="date" className="input-field" value={editContract.startDate} onChange={(e) => setEditContract({ ...editContract, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                <input type="date" className="input-field" value={editContract.expires} onChange={(e) => setEditContract({ ...editContract, expires: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select className="input-field" value={editContract.status} onChange={(e) => setEditContract({ ...editContract, status: e.target.value })}>
                  <option>Active</option><option>Renewed</option><option>Expired</option><option>Pending</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea rows={3} className="input-field resize-none" value={editContract.notes} onChange={(e) => setEditContract({ ...editContract, notes: e.target.value })} />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50">
              <button type="button" onClick={() => { setIsEditOpen(false); setEditContract(null); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Add Contract Modal ── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Contract">
        <form className="space-y-4" onSubmit={handleAdd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Contract Title *</label>
              <input type="text" className="input-field" required placeholder="e.g. Annual Software License 2025" value={newContract.title} onChange={(e) => setNewContract({ ...newContract, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Vendor *</label>
              <select className="input-field" required value={newContract.vendorId} onChange={(e) => setNewContract({ ...newContract, vendorId: e.target.value })}>
                <option value="">Select Vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contract Value</label>
              <input type="text" className="input-field" placeholder="$0" value={newContract.amount} onChange={(e) => setNewContract({ ...newContract, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <input type="date" className="input-field" value={newContract.startDate} onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
              <input type="date" className="input-field" value={newContract.expires} onChange={(e) => setNewContract({ ...newContract, expires: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Any special terms or notes..." value={newContract.notes} onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50">
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Contract</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Contracts;
