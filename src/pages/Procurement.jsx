import { useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle2, Truck, Plus, Eye, Edit2, Trash2, X, Package, User, DollarSign, CalendarDays } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Modal from '../components/Modal';

import { useEffect } from 'react';


const statusColors = {
  Requested: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  Approved:  { text: 'text-blue-400',  bg: 'bg-blue-400/10',  border: 'border-blue-400/30' },
  'In Transit': { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  Delivered: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
};

const Procurement = () => {
  const { searchQuery } = useAppStore();
  const [pos, setPos] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isAddPOOpen, setIsAddPOOpen] = useState(false);
  const [isViewPOOpen, setIsViewPOOpen] = useState(false);
  const [isEditPOOpen, setIsEditPOOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const [newPO, setNewPO] = useState({ vendorId: '', items: [{ itemDescription: '', brand: '', quantity: 1 }], deliveryDate: '', notes: '', date: '' });
  const [editPO, setEditPO] = useState(null);

  const handleAddItem = (isEdit) => {
    if (isEdit) {
      setEditPO({ ...editPO, items: [...(editPO.items || []), { itemDescription: '', brand: '', quantity: 1 }] });
    } else {
      setNewPO({ ...newPO, items: [...newPO.items, { itemDescription: '', brand: '', quantity: 1 }] });
    }
  };

  const updateItem = (isEdit, index, field, value) => {
    if (isEdit) {
      const newItems = [...editPO.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setEditPO({ ...editPO, items: newItems });
    } else {
      const newItems = [...newPO.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setNewPO({ ...newPO, items: newItems });
    }
  };

  const fetchPOs = async () => {
    try {
      const res = await api.get('/api/purchase-orders');
      if (res.data.success) setPos(res.data.data);
    } catch (e) { console.error("Error fetching POs", e); }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/api/vendors');
      if (response.data.success) setVendors(response.data.data.content || response.data.data);
    } catch (error) { console.error("Error fetching vendors", error); }
  };

  useEffect(() => {
    fetchPOs();
    fetchVendors();
  }, []);

  const handleAddPO = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        poNumber: `PO-2024-${Math.floor(Math.random() * 900) + 100}`,
        vendorId: newPO.vendorId,
        items: newPO.items.map(item => ({
          itemDescription: item.itemDescription,
          brand: item.brand,
          quantity: parseInt(item.quantity || 1)
        })),
        date: newPO.date || new Date().toISOString().split('T')[0],
        deliveryDate: newPO.deliveryDate || 'TBD',
        status: 'Requested',
        notes: newPO.notes || '',
      };
      await api.post('/api/purchase-orders', payload);
      fetchPOs();
      setNewPO({ vendorId: '', items: [{ itemDescription: '', brand: '', quantity: 1 }], deliveryDate: '', notes: '', date: '' });
      setIsAddPOOpen(false);
    } catch (e) { console.error("Error creating PO", e); }
  };

  const handleEditPO = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/purchase-orders/${editPO.id}`, editPO);
      fetchPOs();
      setIsEditPOOpen(false);
      setEditPO(null);
    } catch (e) { console.error("Error editing PO", e); }
  };

  const handleDeletePO = async (id) => {
    if (window.confirm('Are you sure you want to delete this Purchase Order?')) {
      try {
        await api.delete(`/api/purchase-orders/${id}`);
        fetchPOs();
        setIsViewPOOpen(false);
        setSelectedPO(null);
      } catch (e) { console.error("Error deleting PO", e); }
    }
  };

  const handleMarkDelivered = async () => {
    try {
      const updatedPO = { ...selectedPO, status: 'Delivered' };
      await api.put(`/api/purchase-orders/${selectedPO.id}`, updatedPO);
      fetchPOs();
      setIsViewPOOpen(false);
      setSelectedPO(null);
    } catch (e) { console.error("Error marking PO as delivered", e); }
  };

  const openViewPO = (po) => {
    setSelectedPO(po);
    setIsViewPOOpen(true);
  };

  const openEditFromView = () => {
    setEditPO({ ...selectedPO });
    setIsViewPOOpen(false);
    setIsEditPOOpen(true);
  };

  const filteredPOs = pos.filter(po =>
    (po.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (po.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (po.item || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Procurement Operations</h2>
          <p className="text-slate-400 text-sm mt-1">Manage purchase orders and workflows</p>
        </div>
        <button onClick={() => setIsAddPOOpen(true)} className="btn-primary flex items-center shrink-0 w-full sm:w-auto justify-center">
          <Plus size={16} className="mr-2" />
          Create PO
        </button>
      </div>

      {/* Workflow Tracker (Kanban style) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { title: "Requested", icon: Clock, count: pos.filter(p => p.status === 'Requested').length, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
          { title: "Approved", icon: CheckCircle2, count: pos.filter(p => p.status === 'Approved').length, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
          { title: "In Transit", icon: Truck, count: pos.filter(p => p.status === 'In Transit').length, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
          { title: "Delivered", icon: ShoppingCart, count: pos.filter(p => p.status === 'Delivered').length, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
        ].map((col, i) => (
          <div key={i} className="glass-panel p-4 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
              <div className="flex items-center">
                <div className={`p-1.5 rounded-lg ${col.bg} ${col.border} border mr-2`}>
                  <col.icon size={16} className={col.color} />
                </div>
                <h3 className="font-semibold text-slate-200">{col.title}</h3>
              </div>
              <span className="bg-slate-800 text-slate-300 text-xs py-1 px-2 rounded-full font-medium">{col.count}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredPOs.filter(po => po.status === col.title).map((card) => (
                <div
                  key={card.id}
                  onClick={() => openViewPO(card)}
                  className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all shadow-sm hover:shadow-cyan-500/10 hover:shadow-lg group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-cyan-400">{card.poNumber}</span>
                    <span className="text-xs text-slate-400">{card.date}</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-200 mb-1">{card.item}</h4>
                  <p className="text-xs text-slate-400 mb-3">{card.vendorName}</p>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-slate-50">{card.amountFormatted}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-slate-500">View details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PO Details Modal (View) */}
      <Modal isOpen={isViewPOOpen} onClose={() => setIsViewPOOpen(false)} title="Purchase Order Details">
        {selectedPO && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-700/50 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 block mb-1">{selectedPO.poNumber}</span>
                <h3 className="text-xl font-bold text-slate-50">{selectedPO.items && selectedPO.items.length > 0 ? selectedPO.items[0].itemDescription + (selectedPO.items.length > 1 ? ` (+${selectedPO.items.length - 1} more)` : '') : 'Purchase Order'}</h3>
              </div>
              {(() => {
                const s = statusColors[selectedPO.status] || {};
                return (
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${s.text} ${s.bg} ${s.border}`}>
                    {selectedPO.status}
                  </span>
                );
              })()}
            </div>

            {/* Line Items List */}
            {selectedPO.items && selectedPO.items.length > 0 && (
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 mb-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Line Items</h4>
                <div className="space-y-2">
                  {selectedPO.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-700/30 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-200">{item.itemDescription} {item.brand ? <span className="text-slate-400 text-xs">({item.brand})</span> : ''}</span>
                      <div className="flex gap-4 text-slate-400">
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg shrink-0"><User size={14} className="text-cyan-400" /></div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Vendor</p>
                  <p className="text-slate-200 font-medium">{selectedPO.vendorName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg shrink-0"><DollarSign size={14} className="text-emerald-400" /></div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Total Amount</p>
                  <p className="text-slate-200 font-semibold">{selectedPO.amountFormatted}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg shrink-0"><CalendarDays size={14} className="text-amber-400" /></div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Order Date</p>
                  <p className="text-slate-200 font-medium">{selectedPO.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <div className="p-2 bg-slate-800 rounded-lg shrink-0"><CalendarDays size={14} className="text-rose-400" /></div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Expected Delivery</p>
                  <p className="text-slate-200 font-medium">{selectedPO.deliveryDate}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedPO.notes && (
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-300">{selectedPO.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex justify-between items-center border-t border-slate-700/50">
              <button
                onClick={() => handleDeletePO(selectedPO.id)}
                className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={15} /> Delete PO
              </button>
              <div className="flex gap-3">
                {selectedPO.status === 'In Transit' && (
                  <button onClick={handleMarkDelivered} className="btn-primary bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2 border-none">
                    <CheckCircle2 size={15} /> Delivery Complete
                  </button>
                )}
                <button onClick={() => setIsViewPOOpen(false)} className="btn-secondary">Close</button>
                <button onClick={openEditFromView} className="btn-primary flex items-center gap-2">
                  <Edit2 size={15} /> Edit PO
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit PO Modal */}
      {editPO && (
        <Modal isOpen={isEditPOOpen} onClose={() => { setIsEditPOOpen(false); setEditPO(null); }} title="Edit Purchase Order">
          <form className="space-y-4" onSubmit={handleEditPO}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Vendor *</label>
                <select className="input-field" required value={editPO.vendorId} onChange={(e) => setEditPO({ ...editPO, vendorId: e.target.value })}>
                  <option value="">Select Vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-slate-300">Line Items *</label>
                  <button type="button" onClick={() => handleAddItem(true)} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center"><Plus size={14} className="mr-1"/> Add Item</button>
                </div>
                {(editPO.items || []).map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input type="text" className="input-field" required placeholder="Item description" value={item.itemDescription} onChange={(e) => updateItem(true, index, 'itemDescription', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <input type="text" className="input-field" placeholder="Brand" value={item.brand || ''} onChange={(e) => updateItem(true, index, 'brand', e.target.value)} />
                    </div>
                    <div className="w-20">
                      <input type="number" min="1" className="input-field" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(true, index, 'quantity', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select className="input-field" value={editPO.status} onChange={(e) => setEditPO({ ...editPO, status: e.target.value })}>
                  <option>Requested</option>
                  <option>Approved</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expected Delivery</label>
                <input type="date" className="input-field" value={editPO.deliveryDate} onChange={(e) => setEditPO({ ...editPO, deliveryDate: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea rows={3} className="input-field resize-none" value={editPO.notes} onChange={(e) => setEditPO({ ...editPO, notes: e.target.value })} />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50">
              <button type="button" onClick={() => { setIsEditPOOpen(false); setEditPO(null); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create PO Modal */}
      <Modal isOpen={isAddPOOpen} onClose={() => setIsAddPOOpen(false)} title="Create Purchase Order">
        <form className="space-y-4" onSubmit={handleAddPO}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Vendor *</label>
              <select className="input-field" required value={newPO.vendorId} onChange={(e) => setNewPO({ ...newPO, vendorId: e.target.value })}>
                <option value="">Select Vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-300">Line Items *</label>
                <button type="button" onClick={() => handleAddItem(false)} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center"><Plus size={14} className="mr-1"/> Add Item</button>
              </div>
              {newPO.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input type="text" className="input-field" required placeholder="Item name" value={item.itemDescription} onChange={(e) => updateItem(false, index, 'itemDescription', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <input type="text" className="input-field" placeholder="Brand" value={item.brand || ''} onChange={(e) => updateItem(false, index, 'brand', e.target.value)} />
                  </div>
                  <div className="w-20">
                    <input type="number" min="1" className="input-field" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(false, index, 'quantity', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Order Date</label>
              <input type="date" className="input-field text-slate-400" value={newPO.date} onChange={(e) => setNewPO({ ...newPO, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Expected Delivery</label>
              <input type="date" className="input-field" value={newPO.deliveryDate} onChange={(e) => setNewPO({ ...newPO, deliveryDate: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Any special instructions..." value={newPO.notes} onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50 mt-4">
            <button type="button" onClick={() => setIsAddPOOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Generate PO</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Procurement;
