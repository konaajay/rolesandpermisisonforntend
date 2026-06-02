import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, DollarSign, Upload, FileUp, Eye, Edit2, Trash2, Check, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Modal from '../components/Modal';



const statusStyle = {
  Paid:     { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Paid' },
  Approved: { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',         label: 'Approved' },
  Pending:  { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',       label: 'Pending' },
  Rejected: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',          label: 'Rejected' },
  'Partially Paid': { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',  label: 'Partially Paid' },
};

const Invoices = () => {
  const { searchQuery } = useAppStore();
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isUploadOpen, setIsUploadOpen]   = useState(false);
  const [isViewOpen,   setIsViewOpen]     = useState(false);
  const [isEditOpen,   setIsEditOpen]     = useState(false);
  const [selectedFile, setSelectedFile]   = useState(null);
  const fileInputRef = useRef(null);
  const [selected,     setSelected]       = useState(null);
  const [editInvoice,  setEditInvoice]    = useState(null);
  const [newInvoice,   setNewInvoice]     = useState({ vendorId: '', amount: '', poRef: '', dueDate: '', notes: '' });

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/vendor-invoices');
      if (res.data.success) setInvoices(res.data.data);
    } catch (e) { console.error("Error fetching invoices", e); }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/api/vendors');
      if (response.data.success) setVendors(response.data.data.content || response.data.data);
    } catch (error) { console.error("Error fetching vendors", error); }
  };

  useEffect(() => {
    fetchInvoices();
    fetchVendors();
  }, []);

  /* ── helpers ── */
  const openView = (inv) => { setSelected(inv); setIsViewOpen(true); };
  const openEdit = (inv) => { setEditInvoice({ ...inv }); setIsViewOpen(false); setIsEditOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice?')) {
      try {
        await api.delete(`/api/vendor-invoices/${id}`);
        fetchInvoices();
        setIsViewOpen(false);
        setSelected(null);
      } catch (e) { console.error("Error deleting invoice", e); }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const invToUpdate = invoices.find(i => i.id === id);
      if (invToUpdate) {
        await api.put(`/api/vendor-invoices/${id}`, { ...invToUpdate, status: newStatus });
        fetchInvoices();
        setSelected(prev => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (e) { console.error("Error updating invoice status", e); }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vendorId: newInvoice.vendorId,
        amount: newInvoice.amount,
        date: new Date().toISOString().split('T')[0],
        dueDate: newInvoice.dueDate || 'TBD',
        poRef: newInvoice.poRef || '—',
        status: 'Pending',
        notes: newInvoice.notes || '',
      };
      const res = await api.post('/api/vendor-invoices', payload);
      
      if (res.data.success && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/api/vendor-invoices/${res.data.data.id}/upload-receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      fetchInvoices();
      setNewInvoice({ vendorId: '', amount: '', poRef: '', dueDate: '', notes: '' });
      setSelectedFile(null);
      setIsUploadOpen(false);
    } catch (e) { console.error("Error creating invoice", e); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/vendor-invoices/${editInvoice.id}`, editInvoice);
      fetchInvoices();
      setIsEditOpen(false);
      setEditInvoice(null);
    } catch (e) { console.error("Error editing invoice", e); }
  };

  const filteredInvoices = invoices.filter(inv => {
    const searchLower = (searchQuery || '').toLowerCase();
    if (!searchLower) return true;
    return (inv.invoiceNumber || '').toLowerCase().includes(searchLower) ||
           (inv.vendorName || '').toLowerCase().includes(searchLower) ||
           (inv.status || '').toLowerCase().includes(searchLower);
  });

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.amountValue || 0), 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + (i.amountValue || 0), 0);
  const totalApproved = invoices.filter(i => i.status === 'Approved').reduce((sum, i) => sum + (i.amountValue || 0), 0);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Invoices &amp; Payments</h2>
          <p className="text-slate-400 text-sm mt-1">Track financial transactions and approvals</p>
        </div>
        <button onClick={() => setIsUploadOpen(true)} className="btn-primary flex items-center shrink-0 w-full sm:w-auto justify-center">
          <Upload size={16} className="mr-2" /> Upload Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Total Paid (MTD)', value: formatCurrency(totalPaid), icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Pending Approval', value: formatCurrency(totalPending),  icon: FileText,   color: 'text-amber-500'  },
          { label: 'Approved, Unpaid', value: formatCurrency(totalApproved),  icon: CheckCircle2, color: 'text-cyan-500'  },
        ].map((c, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm mb-1">{c.label}</p>
                <h3 className="text-2xl font-bold text-slate-50">{c.value}</h3>
              </div>
              <c.icon className={c.color} size={32} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium hidden sm:table-cell">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                const s = statusStyle[inv.status] || statusStyle.Pending;
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 font-mono text-sm text-cyan-400">{inv.invoiceNumber}</td>
                    <td className="p-4 text-sm text-slate-200">{inv.vendorName}</td>
                    <td className="p-4 text-sm font-semibold text-slate-50">{inv.amount}</td>
                    <td className="p-4 text-sm text-slate-400 hidden sm:table-cell">{inv.dueDate}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.badge}`}>{inv.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {inv.receiptUrl && (
                          <a href={`http://localhost:8080/api/vendor-invoices/${inv.id}/receipt`} target="_blank" rel="noreferrer" className="btn-icon text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10" title="Download Receipt">
                            <Download size={16} />
                          </a>
                        )}
                        <button onClick={() => openView(inv)} className="btn-icon" title="View details"><Eye size={16} /></button>
                        <button onClick={() => openEdit(inv)} className="btn-icon" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(inv.id)} className="btn-icon text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No invoices found matching "{searchQuery}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Invoice Modal ── */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Invoice Details">
        {selected && (() => {
          const s = statusStyle[selected.status] || statusStyle.Pending;
          return (
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-slate-700/50 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 block mb-1">{selected.invoiceNumber}</span>
                  <h3 className="text-xl font-bold text-slate-50">{selected.vendorName}</h3>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${s.badge}`}>{selected.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-500 text-xs mb-0.5">Amount</p><p className="text-slate-50 font-bold text-lg">{selected.amount}</p></div>
                <div><p className="text-slate-500 text-xs mb-0.5">PO Reference</p><p className="text-slate-200 font-mono">{selected.poRef}</p></div>
                <div><p className="text-slate-500 text-xs mb-0.5">Invoice Date</p><p className="text-slate-200">{selected.date}</p></div>
                <div><p className="text-slate-500 text-xs mb-0.5">Due Date</p><p className="text-slate-200">{selected.dueDate}</p></div>
              </div>

              {selected.notes && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-300">{selected.notes}</p>
                </div>
              )}

              {selected.receiptUrl && (
                <div className="mt-4">
                  <a href={`http://localhost:8080/api/vendor-invoices/${selected.id}/receipt`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">
                    <Download size={16} /> Download Payment Receipt
                  </a>
                </div>
              )}

              {/* Quick status actions */}
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Approved', 'Partially Paid', 'Paid', 'Rejected'].filter(st => st !== selected.status).map(st => (
                  <button key={st} onClick={() => handleStatusChange(selected.id, st)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                    Mark as {st}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-700/50">
                <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 px-3 py-2 rounded-lg transition-colors">
                  <Trash2 size={15} /> Delete
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setIsViewOpen(false)} className="btn-secondary">Close</button>
                  <button onClick={() => openEdit(selected)} className="btn-primary flex items-center gap-2">
                    <Edit2 size={15} /> Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Edit Invoice Modal ── */}
      {editInvoice && (
        <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditInvoice(null); }} title="Edit Invoice">
          <form className="space-y-4" onSubmit={handleEditSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Vendor *</label>
                <select className="input-field" required value={editInvoice.vendorId} onChange={(e) => setEditInvoice({ ...editInvoice, vendorId: e.target.value })}>
                  <option value="">Select Vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($) *</label>
                <input type="text" className="input-field" required value={editInvoice.amount} onChange={(e) => setEditInvoice({ ...editInvoice, amount: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">PO Reference</label>
                <input type="text" className="input-field" placeholder="PO-2024-xxx" value={editInvoice.poRef} onChange={(e) => setEditInvoice({ ...editInvoice, poRef: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                <input type="date" className="input-field" value={editInvoice.dueDate} onChange={(e) => setEditInvoice({ ...editInvoice, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select className="input-field" value={editInvoice.status} onChange={(e) => setEditInvoice({ ...editInvoice, status: e.target.value })}>
                  <option>Pending</option><option>Approved</option><option>Paid</option><option>Rejected</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea rows={3} className="input-field resize-none" value={editInvoice.notes} onChange={(e) => setEditInvoice({ ...editInvoice, notes: e.target.value })} />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50">
              <button type="button" onClick={() => { setIsEditOpen(false); setEditInvoice(null); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Upload Invoice Modal ── */}
      <Modal isOpen={isUploadOpen} onClose={() => { setIsUploadOpen(false); setSelectedFile(null); }} title="Upload Vendor Invoice">
        <form className="space-y-4" onSubmit={handleAddInvoice}>
          <div 
            className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 hover:border-cyan-500/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            {selectedFile ? (
              <>
                <div className="p-4 bg-emerald-500/10 rounded-full mb-3 text-emerald-400"><FileText size={32} /></div>
                <p className="text-sm font-medium text-slate-200">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button type="button" className="text-cyan-400 hover:text-cyan-300 text-xs mt-4">Change File</button>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-800 rounded-full mb-3 text-cyan-400"><FileUp size={32} /></div>
                <p className="text-sm font-medium text-slate-200">Drag &amp; drop your invoice file here</p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF, PNG, JPG (Max 10MB)</p>
                <button type="button" className="btn-secondary text-xs py-1.5 mt-4">Browse Files</button>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Select Vendor *</label>
              <select className="input-field" required value={newInvoice.vendorId} onChange={(e) => setNewInvoice({ ...newInvoice, vendorId: e.target.value })}>
                <option value="">Select Vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invoice Amount *</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00" required value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">PO Reference</label>
              <input type="text" className="input-field" placeholder="PO-2024-xxx" value={newInvoice.poRef} onChange={(e) => setNewInvoice({ ...newInvoice, poRef: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
              <input type="date" className="input-field" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <textarea rows={2} className="input-field resize-none" placeholder="Any additional notes..." value={newInvoice.notes} onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50">
            <button type="button" onClick={() => setIsUploadOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Invoice</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Invoices;
