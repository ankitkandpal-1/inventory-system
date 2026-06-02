import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { AlertCircle, UserPlus } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
    full_name: "",
    phone_number: "",
    address: "",
    city: "",
    segment: "Retail"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (formData.role === "buyer") {
      if (!formData.full_name || !formData.phone_number || !formData.address || !formData.city) {
        setError("All customer profile fields are required for buyer registration.");
        setLoading(false);
        return;
      }
    }

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Username or email might be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12 animate-fade-in relative z-10 flex flex-col justify-center min-h-[85vh]">
      <div className="text-center mb-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full border-2 border-slate-900/10 flex items-center justify-center bg-white shadow-md">
          <span className="text-slate-900 font-bold text-sm tracking-widest uppercase font-mono">EM</span>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-[0.3em] text-slate-900 uppercase block leading-none">Register EasyMart Profile</h2>
          <p className="text-[9px] text-slate-400 tracking-[0.2em] font-bold uppercase mt-2.5 block leading-none">Establish Security Credentials</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="liquid-glass rounded-3xl p-8 border border-slate-200 bg-white/70 shadow-2xl space-y-6"
      >
        <h3 className="text-sm font-bold tracking-[0.2em] text-slate-800 uppercase text-center pb-2 border-b border-slate-100">Sign Up</h3>

        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold tracking-wider uppercase">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block text-center">Select Security Workspace Clearance</label>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold tracking-wider uppercase font-mono">
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, role: "buyer" })}
                className={`py-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                  formData.role === "buyer" 
                    ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                Buyer Profile
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, role: "admin" })}
                className={`py-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                  formData.role === "admin" 
                    ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                Administrator
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
              <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Username</label>
              <input 
                type="text" 
                required
                disabled={loading}
                placeholder="e.g. gotingeorgi"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
              <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Email Address</label>
              <input 
                type="email" 
                required
                disabled={loading}
                placeholder="e.g. georgi@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300 sm:col-span-2">
              <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Secure Password</label>
              <input 
                type="password" 
                required
                disabled={loading}
                placeholder="Must be at least 6 characters..."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
              />
            </div>
          </div>

          {formData.role === "buyer" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-4 border-t border-slate-200"
            >
              <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.25em] uppercase text-center mb-4">Customer CRM Synchronization Coordinates</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Full Name</label>
                  <input 
                    type="text" 
                    required={formData.role === "buyer"}
                    disabled={loading}
                    placeholder="e.g. Amit Kumar Patel"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-850 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Phone Number</label>
                  <input 
                    type="tel" 
                    required={formData.role === "buyer"}
                    disabled={loading}
                    placeholder="e.g. 9876543210"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300 sm:col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Full Shipping Address</label>
                  <input 
                    type="text" 
                    required={formData.role === "buyer"}
                    disabled={loading}
                    placeholder="e.g. Flat 402, Skyline Apartments, Sector 15"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/55 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Home/Shipping City</label>
                  <input 
                    type="text" 
                    required={formData.role === "buyer"}
                    disabled={loading}
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Loyalty Segment Tier</label>
                  <select 
                    value={formData.segment}
                    disabled={loading}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-850 outline-none font-medium p-0 cursor-pointer"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Corporate">Corporate</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer animate-fade-in"
          >
            <UserPlus className="w-3.5 h-3.5" /> {loading ? "Establishing Profile..." : "Register Workspace Node"}
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] text-slate-500">
          Already have credentials?{" "}
          <Link to="/login" className="font-bold text-slate-800 hover:underline">
            Sign In Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
