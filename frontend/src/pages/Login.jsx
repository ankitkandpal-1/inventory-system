import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { AlertCircle, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username_or_email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.username_or_email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid username/email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 animate-fade-in relative z-10 flex flex-col justify-center min-h-[75vh]">
      <div className="text-center mb-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full border-2 border-slate-900/10 flex items-center justify-center bg-white shadow-md">
          <span className="text-slate-900 font-bold text-sm tracking-widest uppercase font-mono">EM</span>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-[0.3em] text-slate-900 uppercase block leading-none">EasyMart Workspace</h2>
          <p className="text-[9px] text-slate-400 tracking-[0.2em] font-bold uppercase mt-2.5 block leading-none">Secure Gateway Portal</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="liquid-glass rounded-3xl p-8 border border-slate-200 bg-white/70 shadow-2xl space-y-6"
      >
        <h3 className="text-sm font-bold tracking-[0.2em] text-slate-800 uppercase text-center pb-2 border-b border-slate-100">Sign In</h3>

        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold tracking-wider uppercase">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
            <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Username or Email</label>
            <input 
              type="text" 
              required
              disabled={loading}
              placeholder="Enter your email or username..."
              value={formData.username_or_email}
              onChange={(e) => setFormData({ ...formData, username_or_email: e.target.value })}
              className="w-full bg-transparent border-none text-xs text-slate-850 outline-none font-medium p-0"
            />
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
            <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Password</label>
            <input 
              type="password" 
              required
              disabled={loading}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-transparent border-none text-xs text-slate-855 outline-none font-medium p-0"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" /> {loading ? "Authenticating..." : "Sign In to Vault"}
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] text-slate-500">
          Need a workspace?{" "}
          <Link to="/register" className="font-bold text-slate-800 hover:underline">
            Register Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
