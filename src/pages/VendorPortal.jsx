import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, LogOut, Package, CheckCircle, Clock, History } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';


const VendorPortal = () => {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const fetchMyPOs = async () => {
    try {
      setLoading(true);
      const [vendorsRes, poRes] = await Promise.all([
        api.get('/api/vendors'),
        api.get('/api/purchase-orders')
      ]);
      const vendors = vendorsRes.data.data.content || [];
      const allPOs = poRes.data.data || [];

      const matchedVendor = vendors.find(v => v.email && v.email.trim().toLowerCase() === currentUser.trim().toLowerCase());

      let myPOs = [];
      if (matchedVendor) {
        myPOs = allPOs.filter(po => po.vendorId === matchedVendor.id);
      }
      setPurchaseOrders(myPOs);
    } catch (error) {
      console.error("Failed to fetch POs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPOs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReject = async (po) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await api.put(`/api/purchase-orders/${po.id}`, { ...po, status: 'Rejected' });
      fetchMyPOs();
    } catch (e) {
      console.error(e);
    }
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...selectedPO,
        status: 'Approved',
        items: selectedPO.items.map(item => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice || 0)
        }))
      };
      const updatedPO = await api.put(`/api/purchase-orders/${selectedPO.id}`, payload);

      // Automatically create an invoice for this quote
      const totalAmount = payload.items.reduce((sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 1)), 0);
      
      const invoicePayload = {
        invoiceNumber: `INV-${selectedPO.poNumber}`,
        vendorId: selectedPO.vendorId,
        amount: totalAmount.toString(),
        poRef: selectedPO.poNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        status: 'Pending'
      };

      try {
        await api.post('/api/vendor-invoices', invoicePayload);
      } catch (invoiceErr) {
        console.error("Failed to auto-create invoice", invoiceErr);
      }

      setQuoteModalOpen(false);
      setSelectedPO(null);
      fetchMyPOs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTransit = async (po) => {
    const date = window.prompt("Enter expected delivery date (YYYY-MM-DD):", po.deliveryDate);
    if (!date) return;
    try {
      await api.put(`/api/purchase-orders/${po.id}`, { ...po, status: 'In Transit', deliveryDate: date });
      fetchMyPOs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelivered = async (po) => {
    try {
      await api.put(`/api/purchase-orders/${po.id}`, { ...po, status: 'Delivered' });
      fetchMyPOs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="font-bold text-xl text-slate-100">Vendor Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{currentUser}</span>
          <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 flex items-center text-sm gap-2 transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Welcome back!</h1>
          <p className="text-slate-400">Here are the latest purchase order requests assigned to your company.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2">
            <ShoppingCart className="text-cyan-400" size={20} />
            <h2 className="text-lg font-semibold text-slate-100">Your Pending Requests</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading your purchase orders...</div>
          ) : purchaseOrders.filter(po => ['Requested', 'Approved', 'In Transit'].includes(po.status)).length === 0 ? (
            <div className="p-8 text-center text-slate-500">You don't have any pending purchase order requests right now.</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {purchaseOrders.filter(po => ['Requested', 'Approved', 'In Transit'].includes(po.status)).map((po) => (
                <div key={po.id} className="p-5 hover:bg-slate-800/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-cyan-400 font-medium">{po.poNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          po.status === 'Requested' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Requested on {new Date(po.date).toLocaleDateString()} • Expected by {new Date(po.deliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500 mb-1">Total Items</p>
                      <p className="text-sm font-medium text-slate-200">
                        {po.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                      </p>
                    </div>

                    {po.status === 'Requested' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleReject(po)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => { setSelectedPO(JSON.parse(JSON.stringify(po))); setQuoteModalOpen(true); }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Accept & Quote
                        </button>
                      </div>
                    ) : po.status === 'Approved' ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-slate-500 text-sm italic">Quotation Submitted</span>
                        <button 
                          onClick={() => handleTransit(po)}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Transit Order
                        </button>
                      </div>
                    ) : po.status === 'In Transit' ? (
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => handleDelivered(po)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delivery Complete
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Status: {po.status}</span>
                    )}
                  </div>
                  
                  {po.items && po.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/30">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm bg-slate-950/30 p-2 rounded-md border border-slate-800/50">
                            <Package size={14} className="text-slate-500 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <span className="text-slate-300 font-medium">{item.itemDescription}</span>
                              {item.brand && <span className="text-slate-500 ml-1">({item.brand})</span>}
                              <span className="text-cyan-400 ml-2">x{item.quantity}</span>
                            </div>
                            {po.status !== 'Requested' && (
                              <div className="text-emerald-400 font-medium">${item.unitPrice || 0}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-8 opacity-80">
          <div className="p-4 bg-slate-800/30 border-b border-slate-700/50 flex items-center gap-2">
            <History className="text-slate-400" size={20} />
            <h2 className="text-lg font-semibold text-slate-300">Order History</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading history...</div>
          ) : purchaseOrders.filter(po => ['Delivered', 'Rejected'].includes(po.status)).length === 0 ? (
            <div className="p-8 text-center text-slate-500">No past orders found.</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {purchaseOrders.filter(po => ['Delivered', 'Rejected'].includes(po.status)).map((po) => (
                <div key={po.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-cyan-400 font-medium">{po.poNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          po.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Requested on {new Date(po.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500 mb-1">Total Items</p>
                      <p className="text-sm font-medium text-slate-300">
                        {po.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Quote Modal */}
      {quoteModalOpen && selectedPO && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-slate-50">Submit Quotation</h3>
              <p className="text-slate-400 text-sm mt-1">Enter your pricing for PO {selectedPO.poNumber}</p>
            </div>
            <form onSubmit={submitQuote}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {selectedPO.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium">{item.itemDescription}</p>
                      <p className="text-slate-500 text-sm">Brand: {item.brand || 'Any'} | Qty: {item.quantity}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Unit Price ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        required
                        className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 w-32 focus:ring-cyan-500 focus:border-cyan-500"
                        value={item.unitPrice || ''}
                        onChange={(e) => {
                          const newItems = [...selectedPO.items];
                          newItems[idx].unitPrice = e.target.value;
                          setSelectedPO({ ...selectedPO, items: newItems });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button type="button" onClick={() => setQuoteModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20">
                  Submit Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPortal;
