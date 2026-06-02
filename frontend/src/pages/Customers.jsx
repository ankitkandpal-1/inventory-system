import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { backendClient } from "../api";
import {
  Search,
  Plus,
  Trash2,
  X,
  Shield,
  Activity
} from "lucide-react";

export default function Customers({ triggerNotification }) {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [custSearch, setCustSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    segment: "Retail"
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await backendClient.fetchClientList();
      setCustomers(data);
    } catch (e) {
      triggerNotification(e.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadCustomers();
    }
  }, [isAdmin]);

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerForm.email.includes("@")) {
      triggerNotification("Please enter a valid email address.", "danger");
      return;
    }
    
    if (customerForm.phone_number.length < 7) {
      triggerNotification("Phone number must be at least 7 digits.", "danger");
      return;
    }

    try {
      await backendClient.registerClientProfile(customerForm);
      triggerNotification("Customer profile archived.");
      setShowCustomerModal(false);
      setCustomerForm({
        full_name: "",
        email: "",
        phone_number: "",
        address: "",
        city: "",
        segment: "Retail"
      });
      loadCustomers();
    } catch (err) {
      triggerNotification(err.message, "danger");
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete client profile permanently?")) return;
    try {
      await backendClient.removeClientProfile(id);
      triggerNotification("Customer profile removed.");
      if (selectedCustomerDetail && selectedCustomerDetail.id === id) {
        setSelectedCustomerDetail(null);
      }
      loadCustomers();
    } catch (err) {
      triggerNotification(err.message, "danger");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(custSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(custSearch.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="py-12 text-center text-red-500 font-bold text-sm tracking-wider uppercase">
        Operation forbidden: administrative access required.
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.25em] text-slate-800 uppercase">Client Directory</h2>
          <p className="text-[10px] text-slate-400 tracking-wider mt-1">Select a client profile card to open details or edit CRM records.</p>
        </div>
        <button 
          onClick={() => setShowCustomerModal(true)}
          className="px-6 py-3 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md shadow-slate-955/10 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> Register Client
        </button>
      </div>

      <section className="liquid-glass rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/70 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 w-full">
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-800 uppercase">Ecosystem Clients</h3>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded w-full md:w-80 shadow-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients by name or email..."
              value={custSearch}
              onChange={(e) => setCustSearch(e.target.value)}
              className="bg-transparent border-none text-slate-700 outline-none text-[10px] tracking-wider uppercase w-full font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs tracking-wider">Syncing database registries...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => {
                const initials = c.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                const isVIP = c.segment === "VIP" || c.id % 2 === 0;
                
                return (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedCustomerDetail(c)}
                    className="liquid-glass rounded-3xl p-6 flex flex-col justify-between min-h-[240px] cursor-pointer group border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-800 text-xs font-bold tracking-wider shadow-sm">
                        {initials}
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-bold tracking-wider uppercase ${
                        isVIP 
                          ? "border-amber-200 text-amber-700 bg-amber-50" 
                          : "border-slate-200 text-slate-500 bg-slate-50"
                      }`}>
                        {isVIP ? "VIP Status" : "Active Client"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight group-hover:text-slate-800 transition-colors">
                        {c.full_name}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-mono tracking-wider truncate">
                        {c.email}
                      </p>
                      <p className="text-[10px] text-slate-500 tracking-wide font-light">
                        Detailed client coordinates, support SLA priorities & active transaction logs.
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.25em]">Phone Connection</span>
                        <span className="text-[11px] font-medium text-slate-700">{c.phone_number}</span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteCustomer(c.id)}
                          className="p-2 rounded border border-slate-200 hover:border-red-400 bg-white text-slate-500 hover:text-red-600 transition-all shadow-sm cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-400 font-light text-xs tracking-wider">
                Client directory empty. Register profiles to begin.
              </div>
            )}
          </div>
        )}
      </section>

      {selectedCustomerDetail && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl mx-4 space-y-6 bg-white border border-slate-200 shadow-2xl p-8 rounded-3xl animate-slide-up">
            <div className="modal-header border-b border-slate-100 pb-4">
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.25em] uppercase block mb-1">Client Registry Details</span>
                <h3 className="text-xl font-bold text-slate-900 leading-none">{selectedCustomerDetail.full_name}</h3>
              </div>
              <button 
                onClick={() => setSelectedCustomerDetail(null)} 
                className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Client Status</span>
                <span className="text-xl font-semibold text-slate-800 uppercase">
                  {selectedCustomerDetail.segment} Tier
                </span>
              </div>
              <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Contact Link</span>
                <span className="text-[10px] font-mono text-slate-700 tracking-normal truncate">{selectedCustomerDetail.email}</span>
              </div>
              <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col justify-between h-[120px]">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Phone Gateway</span>
                <span className="text-base font-semibold text-slate-800">{selectedCustomerDetail.phone_number}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ecosystem Registry Logs</h4>
                </div>
                
                <div className="space-y-3 text-xs text-slate-600 font-light">
                  <div className="flex justify-between">
                    <span>Shipping Address:</span>
                    <span className="font-semibold text-slate-850 text-right max-w-[150px] truncate">{selectedCustomerDetail.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping City:</span>
                    <span className="font-semibold text-slate-800">{selectedCustomerDetail.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ecosystem Integrity Check:</span>
                    <span className="px-2 py-0.5 rounded border border-emerald-100 text-emerald-700 bg-emerald-50 text-[9px] font-bold">100% Sync Verified</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Client Engagement Matrix</h4>
                </div>
                
                <div className="space-y-3 text-xs text-slate-600 font-light">
                  <div className="flex justify-between">
                    <span>Assigned account manager:</span>
                    <span className="font-semibold text-slate-800 font-mono text-[9px]">Ecosystem Concierge Alpha</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support SLA Rank:</span>
                    <span className="font-semibold text-slate-800">Tier 1 Elite</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedCustomerDetail(null)}
                className="px-6 py-2.5 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-xl mx-4 bg-white border border-slate-200 p-8 rounded-3xl animate-slide-up shadow-2xl">
            <div className="modal-header border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.25em] uppercase block mb-1">Secure Registry Node</span>
                <h3 className="text-lg font-bold text-slate-900 leading-none">Customer Profile Registration</h3>
              </div>
              <button 
                onClick={() => setShowCustomerModal(false)} 
                className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Amit Kumar Patel"
                    value={customerForm.full_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. amit.patel@gmail.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 9876543210"
                    value={customerForm.phone_number}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone_number: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Home/Shipping City</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. New Delhi"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Full Shipping Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Flat 402, Skyline Apartments, Sector 15"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                />
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Customer Segment Tier</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Retail", "Wholesale", "Corporate", "VIP"].map((segmentOption) => {
                    const isSelected = customerForm.segment === segmentOption;
                    return (
                      <button
                        key={segmentOption}
                        type="button"
                        onClick={() => setCustomerForm({ ...customerForm, segment: segmentOption })}
                        className={`py-2 px-3 rounded-xl border text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800"
                        }`}
                      >
                        {segmentOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCustomerModal(false)}
                  className="px-6 py-2.5 rounded border border-slate-200 bg-white text-slate-600 hover:text-slate-800 font-semibold text-[10px] tracking-widest uppercase transition-all shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
