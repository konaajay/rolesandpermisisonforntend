import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, MoreVertical, Edit2, Eye, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Modal from '../components/Modal';
import api from '../services/api';

const Vendors = () => {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;
  
  const [filters, setFilters] = useState({ status: [], risk: [] });
  
  const [newVendor, setNewVendor] = useState({ 
    vendorName: '', companyName: '', categoryId: '', contactPerson: '', 
    email: '', mobileNumber: '', alternateMobileNumber: '', 
    gstNumber: '', panNumber: '', address: '', city: '', state: '', 
    country: '', postalCode: '', rating: ''
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/vendor-categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Fetch vendors from backend
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      // Use the search endpoint if there's a search query, else get all
      const endpoint = searchQuery ? '/api/vendors/search' : '/api/vendors';
      const params = {
        page: currentPage - 1, // Spring Boot is 0-indexed
        size: itemsPerPage,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      };
      if (searchQuery) params.searchTerm = searchQuery;

      const response = await api.get(endpoint, { params });
      
      if (response.data.success) {
        // Adapt backend payload to frontend format
        let fetchedVendors = response.data.data.content.map(v => ({
          id: v.id,
          vendorCode: v.vendorCode,
          name: v.vendorName,
          categoryId: v.categoryId,
          categoryName: v.categoryName || 'N/A', 
          companyName: v.companyName,
          gstNumber: v.gstNumber,
          panNumber: v.panNumber,
          address: v.address,
          city: v.city,
          state: v.state,
          country: v.country,
          postalCode: v.postalCode,
          alternateMobileNumber: v.alternateMobileNumber,
          contact: v.contactPerson,
          email: v.email,
          phone: v.mobileNumber,
          status: v.status || (v.active ? 'Active' : 'Inactive'),
          risk: v.risk || 'Low', 
          rating: v.rating || 'N/A',
        }));

        if (filters.status.length > 0) {
          fetchedVendors = fetchedVendors.filter(v => filters.status.includes(v.status));
        }
        if (filters.risk.length > 0) {
          fetchedVendors = fetchedVendors.filter(v => filters.risk.includes(v.risk));
        }

        setVendors(fetchedVendors);
        setTotalPages(response.data.data.totalPages);
        setTotalEntries(response.data.data.totalElements);
      }
    } catch (error) {
      console.error("Error fetching vendors", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [currentPage, searchQuery, filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ status: [], risk: [] });
    setIsFiltersOpen(false);
  };

  const resetForm = () => {
    setNewVendor({ 
      vendorName: '', companyName: '', categoryId: '', contactPerson: '', 
      email: '', mobileNumber: '', alternateMobileNumber: '', 
      gstNumber: '', panNumber: '', address: '', city: '', state: '', 
      country: '', postalCode: '', rating: ''
    });
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vendorCode: `V-${Math.floor(Math.random() * 9000) + 1000}`,
        vendorName: newVendor.vendorName,
        companyName: newVendor.companyName,
        categoryId: newVendor.categoryId,
        contactPerson: newVendor.contactPerson,
        email: newVendor.email,
        mobileNumber: newVendor.mobileNumber,
        alternateMobileNumber: newVendor.alternateMobileNumber,
        gstNumber: newVendor.gstNumber,
        panNumber: newVendor.panNumber,
        address: newVendor.address,
        city: newVendor.city,
        state: newVendor.state,
        country: newVendor.country,
        postalCode: newVendor.postalCode,
        rating: newVendor.rating ? parseFloat(newVendor.rating) : null,
        status: 'Pending',
        active: false
      };
      await api.post('/api/vendors', payload);
      fetchVendors();
      resetForm();
      setIsAddVendorOpen(false);
    } catch (error) {
      console.error("Failed to add vendor", error);
      alert(error.response?.data?.error || "Failed to add vendor");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/vendor-categories', {
        name: newCategoryName,
        active: true
      });
      fetchCategories();
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
    } catch (error) {
      console.error("Failed to add category", error);
      alert(error.response?.data?.error || "Failed to add category");
    }
  };

  const handleEditVendor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vendorCode: newVendor.vendorCode,
        vendorName: newVendor.vendorName,
        companyName: newVendor.companyName,
        categoryId: newVendor.categoryId,
        contactPerson: newVendor.contactPerson,
        email: newVendor.email,
        mobileNumber: newVendor.mobileNumber,
        alternateMobileNumber: newVendor.alternateMobileNumber,
        gstNumber: newVendor.gstNumber,
        panNumber: newVendor.panNumber,
        address: newVendor.address,
        city: newVendor.city,
        state: newVendor.state,
        country: newVendor.country,
        postalCode: newVendor.postalCode,
        rating: newVendor.rating ? parseFloat(newVendor.rating) : null,
        status: newVendor.status,
        active: newVendor.status === 'Active'
      };
      await api.put(`/api/vendors/${newVendor.id}`, payload);
      fetchVendors();
      resetForm();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to edit vendor", error);
      alert(error.response?.data?.error || "Failed to edit vendor");
    }
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await api.delete(`/api/vendors/${id}`);
        fetchVendors();
      } catch (error) {
        console.error("Failed to delete vendor", error);
      }
    }
  };

  const openEditModal = (vendor) => {
    setNewVendor({
      id: vendor.id,
      vendorCode: vendor.vendorCode,
      vendorName: vendor.vendorName,
      companyName: vendor.companyName || '',
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      mobileNumber: vendor.mobileNumber,
      alternateMobileNumber: vendor.alternateMobileNumber || '',
      gstNumber: vendor.gstNumber || '',
      panNumber: vendor.panNumber || '',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      country: vendor.country || '',
      postalCode: vendor.postalCode || '',
      status: vendor.status,
      categoryId: vendor.categoryId,
      categoryName: vendor.categoryName,
      risk: vendor.risk,
      rating: vendor.rating || ''
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const paginatedVendors = vendors; // Filtering & Pagination handled by backend
  const startIndex = (currentPage - 1) * itemsPerPage;

  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Vendor Directory</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and evaluate your vendor network</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button onClick={() => setIsFiltersOpen(true)} className="btn-secondary flex items-center shrink-0">
            <Filter size={16} className="mr-2" />
            Filters
          </button>
          <button onClick={() => setIsAddCategoryOpen(true)} className="btn-secondary flex items-center shrink-0">
            <Plus size={16} className="mr-2" />
            Add Category
          </button>
          <button onClick={() => setIsAddVendorOpen(true)} className="btn-primary flex items-center shrink-0">
            <Plus size={16} className="mr-2" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium hidden md:table-cell">Category</th>
                <th className="p-4 font-medium hidden lg:table-cell">Contact</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden sm:table-cell">Risk Score</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedVendors.length > 0 ? (
                paginatedVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 shrink-0">
                        <span className="text-slate-300 font-semibold">{vendor.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{vendor.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{vendor.vendorCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-slate-300">{vendor.categoryName}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="text-sm text-slate-300">{vendor.contact}</div>
                    <div className="text-xs text-slate-500">{vendor.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`badge-success ${
                      vendor.status === 'Active' ? 'badge-success' : 
                      vendor.status === 'Under Review' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center">
                      {vendor.risk === 'Low' && <ShieldCheck size={16} className="text-emerald-500 mr-2" />}
                      {vendor.risk === 'Medium' && <AlertCircle size={16} className="text-amber-500 mr-2" />}
                      {vendor.risk === 'High' && <AlertCircle size={16} className="text-rose-500 mr-2" />}
                      <span className="text-sm text-slate-300">{vendor.risk}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-sm">
                      {vendor.rating !== 'N/A' ? (
                        <>
                          <span className="font-semibold text-slate-50 mr-1">{vendor.rating}</span>
                          <span className="text-amber-400">★</span>
                        </>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openViewModal(vendor)} className="btn-icon" title="View details"><Eye size={16} /></button>
                      <button onClick={() => openEditModal(vendor)} className="btn-icon" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteVendor(vendor.id)} className="btn-icon hover:text-rose-400" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No vendors found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400 gap-4">
          <span>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalEntries)} of {totalEntries} entries
          </span>
          <div className="flex gap-1 flex-wrap justify-center">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30' 
                    : 'border-slate-700 hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isAddVendorOpen} onClose={() => setIsAddVendorOpen(false)} title="Register New Vendor">
        <form className="space-y-4" onSubmit={handleAddVendor}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
              <input type="text" className="input-field" required placeholder="e.g. Acme Corp" value={newVendor.vendorName} onChange={(e) => setNewVendor({...newVendor, vendorName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select className="input-field" value={newVendor.categoryId || ''} onChange={(e) => setNewVendor({...newVendor, categoryId: e.target.value})}>
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
            <input type="text" className="input-field" placeholder="e.g. Acme Corp Pvt Ltd" value={newVendor.companyName} onChange={(e) => setNewVendor({...newVendor, companyName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contact Person</label>
            <input type="text" className="input-field" placeholder="Full Name" value={newVendor.contactPerson} onChange={(e) => setNewVendor({...newVendor, contactPerson: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
              <input type="email" className="input-field" required placeholder="email@company.com" value={newVendor.email} onChange={(e) => setNewVendor({...newVendor, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number *</label>
              <input type="tel" className="input-field" required placeholder="+1 (555) 000-0000" value={newVendor.mobileNumber} onChange={(e) => setNewVendor({...newVendor, mobileNumber: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Alt. Mobile</label>
            <input type="tel" className="input-field" placeholder="+1 (555) 000-0000" value={newVendor.alternateMobileNumber} onChange={(e) => setNewVendor({...newVendor, alternateMobileNumber: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">GST Number</label>
              <input type="text" className="input-field" placeholder="GSTIN..." value={newVendor.gstNumber} onChange={(e) => setNewVendor({...newVendor, gstNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">PAN Number</label>
              <input type="text" className="input-field" placeholder="PAN..." value={newVendor.panNumber} onChange={(e) => setNewVendor({...newVendor, panNumber: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
            <input type="text" className="input-field" placeholder="123 Street Name" value={newVendor.address} onChange={(e) => setNewVendor({...newVendor, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
              <input type="text" className="input-field" placeholder="City" value={newVendor.city} onChange={(e) => setNewVendor({...newVendor, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
              <input type="text" className="input-field" placeholder="State" value={newVendor.state} onChange={(e) => setNewVendor({...newVendor, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
              <input type="text" className="input-field" placeholder="Country" value={newVendor.country} onChange={(e) => setNewVendor({...newVendor, country: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Postal Code</label>
              <input type="text" className="input-field" placeholder="Zip/Pin" value={newVendor.postalCode} onChange={(e) => setNewVendor({...newVendor, postalCode: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Initial Rating (Optional)</label>
              <input type="number" step="0.1" min="0" max="5" className="input-field" placeholder="0.0 - 5.0" value={newVendor.rating} onChange={(e) => setNewVendor({...newVendor, rating: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddVendorOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Register Vendor</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title="Edit Vendor">
        <form className="space-y-4" onSubmit={handleEditVendor}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
              <input type="text" className="input-field" required placeholder="e.g. Acme Corp" value={newVendor.vendorName} onChange={(e) => setNewVendor({...newVendor, vendorName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select className="input-field" value={newVendor.categoryId || ''} onChange={(e) => setNewVendor({...newVendor, categoryId: e.target.value})}>
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Legal Company Name</label>
            <input type="text" className="input-field" placeholder="Full Legal Entity Name" value={newVendor.companyName} onChange={(e) => setNewVendor({...newVendor, companyName: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Person</label>
              <input type="text" className="input-field" placeholder="Full Name" value={newVendor.contactPerson} onChange={(e) => setNewVendor({...newVendor, contactPerson: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
              <input type="email" className="input-field" required placeholder="email@company.com" value={newVendor.email} onChange={(e) => setNewVendor({...newVendor, email: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number *</label>
              <input type="tel" className="input-field" required placeholder="+1 (555) 000-0000" value={newVendor.mobileNumber} onChange={(e) => setNewVendor({...newVendor, mobileNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Alternate Number</label>
              <input type="tel" className="input-field" placeholder="+1 (555) 000-0000" value={newVendor.alternateMobileNumber} onChange={(e) => setNewVendor({...newVendor, alternateMobileNumber: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">GST Number</label>
              <input type="text" className="input-field" placeholder="GSTIN" value={newVendor.gstNumber} onChange={(e) => setNewVendor({...newVendor, gstNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">PAN Number</label>
              <input type="text" className="input-field" placeholder="PAN" value={newVendor.panNumber} onChange={(e) => setNewVendor({...newVendor, panNumber: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
            <input type="text" className="input-field" placeholder="Street Address" value={newVendor.address} onChange={(e) => setNewVendor({...newVendor, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
              <input type="text" className="input-field" placeholder="City" value={newVendor.city} onChange={(e) => setNewVendor({...newVendor, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
              <input type="text" className="input-field" placeholder="State" value={newVendor.state} onChange={(e) => setNewVendor({...newVendor, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
              <input type="text" className="input-field" placeholder="Country" value={newVendor.country} onChange={(e) => setNewVendor({...newVendor, country: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Postal Code</label>
              <input type="text" className="input-field" placeholder="Zip/Pin" value={newVendor.postalCode} onChange={(e) => setNewVendor({...newVendor, postalCode: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Rating</label>
              <input type="number" step="0.1" min="0" max="5" className="input-field" placeholder="0.0 - 5.0" value={newVendor.rating || ''} onChange={(e) => setNewVendor({...newVendor, rating: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select className="input-field" value={newVendor.status} onChange={(e) => setNewVendor({...newVendor, status: e.target.value})}>
                <option>Active</option>
                <option>Under Review</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Risk Level</label>
              <select className="input-field" value={newVendor.risk} onChange={(e) => setNewVendor({...newVendor, risk: e.target.value})}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Vendor Details">
        {selectedVendor && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 border-b border-slate-700/50 pb-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <span className="text-2xl text-slate-300 font-bold">{selectedVendor.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-50">{selectedVendor.name}</h3>
                <p className="text-sm text-cyan-400 font-mono mt-0.5">{selectedVendor.vendorCode}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Category</p>
                <p className="text-slate-200 font-medium">{selectedVendor.categoryName}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Company Name</p>
                <p className="text-slate-200 font-medium">{selectedVendor.companyName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Contact Person</p>
                <p className="text-slate-200 font-medium">{selectedVendor.contact}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">GST Number</p>
                <p className="text-slate-200">{selectedVendor.gstNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">PAN Number</p>
                <p className="text-slate-200">{selectedVendor.panNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Address</p>
                <p className="text-slate-200">{[selectedVendor.address, selectedVendor.city, selectedVendor.state, selectedVendor.country].filter(Boolean).join(', ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email Address</p>
                <p className="text-slate-200 font-medium">{selectedVendor.email}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Rating</p>
                <div className="flex items-center">
                  {selectedVendor.rating !== 'N/A' ? (
                    <>
                      <span className="font-semibold text-slate-50 mr-1">{selectedVendor.rating}</span>
                      <span className="text-amber-400">★</span>
                    </>
                  ) : (
                    <span className="text-slate-500">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Status</p>
                <span className={`badge-success ${
                  selectedVendor.status === 'Active' ? 'badge-success' : 
                  selectedVendor.status === 'Under Review' ? 'badge-warning' : 'badge-error'
                }`}>
                  {selectedVendor.status}
                </span>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Risk Level</p>
                <div className="flex items-center">
                  {selectedVendor.risk === 'Low' && <ShieldCheck size={16} className="text-emerald-500 mr-2" />}
                  {selectedVendor.risk === 'Medium' && <AlertCircle size={16} className="text-amber-500 mr-2" />}
                  {selectedVendor.risk === 'High' && <AlertCircle size={16} className="text-rose-500 mr-2" />}
                  <span className="text-slate-200 font-medium">{selectedVendor.risk}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} title="Create New Category">
        <form className="space-y-4" onSubmit={handleAddCategory}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category Name *</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              placeholder="e.g. Facilities Management" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddCategoryOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Category</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} title="Advanced Filters">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <div className="flex flex-wrap gap-4">
              {['Active', 'Under Review', 'Inactive'].map(status => (
                <label key={status} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500" 
                    checked={filters.status.includes(status)}
                    onChange={() => toggleFilter('status', status)}
                  /> 
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 mt-4">Risk Level</label>
            <div className="flex flex-wrap gap-4">
              {['Low', 'Medium', 'High'].map(risk => (
                <label key={risk} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500" 
                    checked={filters.risk.includes(risk)}
                    onChange={() => toggleFilter('risk', risk)}
                  /> 
                  <span>{risk}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <button onClick={clearFilters} className="btn-secondary">Clear All</button>
            <button onClick={() => setIsFiltersOpen(false)} className="btn-primary">Apply Filters</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Vendors;
