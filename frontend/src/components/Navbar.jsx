import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Plus,
  LogOut,
  UserCheck
} from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin, isBuyer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/catalog", label: "Catalog", icon: Package },
    ...(isAdmin ? [{ path: "/customers", label: "Clients", icon: Users }] : []),
    { path: "/transactions", label: "Transactions", icon: ShoppingCart },
    ...(isBuyer ? [{ path: "/checkout", label: "Checkout", icon: Plus }] : [])
  ];

  return (
    <header className="w-full py-8 mb-12 flex justify-between items-center border-b border-slate-200">
      <div 
        className="flex items-center gap-4 group cursor-pointer animate-fade-in" 
        onClick={() => navigate("/dashboard")}
      >
        <div className="relative w-11 h-11 rounded-full border-2 border-slate-900/10 flex items-center justify-center bg-white shadow-md group-hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0.5 rounded-full border border-slate-900/5 bg-slate-50" />
          <span className="relative z-10 text-slate-900 font-bold text-xs tracking-widest uppercase font-mono">EM</span>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm animate-pulse" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-[0.3em] text-slate-900 uppercase block leading-none">EasyMart</span>
          <span className="text-[9px] text-slate-400 tracking-[0.22em] font-bold uppercase mt-1.5 block leading-none">INVENTORY & ORDER MANAGEMENT</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-sm backdrop-blur-md">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-semibold tracking-widest uppercase transition-all duration-500 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 px-3.5 bg-slate-100 border border-slate-200 rounded-full shadow-inner text-[9px] font-bold tracking-wider uppercase font-mono text-slate-700">
            <UserCheck className="w-3 h-3 text-slate-500" />
            <span>{user.username}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-[8px] bg-slate-900 text-white px-2 py-0.5 rounded-full">{user.role}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="lg:hidden flex items-center gap-2">
        <select
          value={location.pathname}
          onChange={(e) => navigate(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded px-4 py-2 text-[10px] font-semibold tracking-wider uppercase outline-none shadow-sm cursor-pointer"
        >
          <option value="/dashboard">Dashboard</option>
          <option value="/catalog">Catalog</option>
          {isAdmin && <option value="/customers">Clients</option>}
          <option value="/transactions">Transactions</option>
          {isBuyer && <option value="/checkout">Checkout</option>}
        </select>
      </div>
    </header>
  );
}
