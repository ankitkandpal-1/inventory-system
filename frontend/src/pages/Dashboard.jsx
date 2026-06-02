import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { backendClient } from "../api";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  AlertCircle,
  TrendingUp
} from "lucide-react";

export default function Dashboard({ triggerNotification }) {
  const { user, isAdmin, isBuyer } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_count: 0,
    low_stock_products: []
  });
  const [orders, setOrders] = useState([]);
  const [orderTracking, setOrderTracking] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("easymart_order_tracking") || "{}");
    } catch (e) {
      return {};
    }
  });

  const loadData = async () => {
    try {
      const statsData = await backendClient.fetchOverviewMetrics();
      setStats(statsData);

      const ordersData = await backendClient.fetchOrderLogs();
      setOrders(ordersData);
    } catch (e) {
      console.error("Dashboard failed to sync logs.", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEcosystemTrackingStep = (orderId) => {
    const steps = [
      { label: "Invoice Archive", desc: "Placed successfully" },
      { label: "Stock Assigned", desc: "Inventory cap loaded" },
      { label: "Gate Dispatched", desc: "Transit clearance done" },
      { label: "Route Active", desc: "Shipment in transit" },
      { label: "Arrived Safely", desc: "Ecosystem complete" }
    ];
    const storedStep = orderTracking[orderId];
    const activeStep = storedStep !== undefined ? storedStep : (orderId % 4);
    return { steps, activeStep };
  };

  const trackingCards = orders.slice(-2);

  return (
    <div className="space-y-12 animate-fade-in">
      <section className="w-full text-center md:text-left mb-16 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16 py-12 md:py-20 border-b border-slate-200 relative overflow-hidden rounded-3xl liquid-glass p-8 md:p-14">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Ecosystem Core</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-light text-slate-900 tracking-tight leading-tight">
            Modern Inventory <br />
            <span className="text-slate-400 font-light">
              Order Management
            </span>
          </h1>
          
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-light tracking-wide">
            Welcome, <span className="font-semibold text-slate-800">{user?.username}</span>. Archive records, monitor real-time stock balances, and track active shipment transit. Integrated securely with relational database systems.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {isBuyer && (
            <button 
              onClick={() => navigate("/checkout")}
              className="px-8 py-3.5 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all duration-300 shadow-md shadow-slate-955/10 cursor-pointer"
            >
              Checkout Terminal
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => navigate("/customers")}
              className="px-8 py-3.5 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all duration-300 shadow-md shadow-slate-955/10 cursor-pointer"
            >
              Client Directory
            </button>
          )}
          <button 
            onClick={() => navigate("/catalog")}
            className="px-8 py-3.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all duration-300 shadow-sm cursor-pointer"
          >
            Product Catalog
          </button>
        </div>
      </section>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xs font-bold tracking-[0.25em] text-slate-800 uppercase">Ecosystem Summary</h2>
          <p className="text-[10px] text-slate-400 tracking-wider mt-1">Metrics computed instantly on database layers.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Ecosystem Products", value: stats.total_products, icon: Package },
          { label: "Active Clients", value: stats.total_customers, icon: Users },
          { label: "Archived Invoices", value: stats.total_orders, icon: ShoppingCart },
          { 
            label: "Low Stock Alerts", 
            value: stats.low_stock_count, 
            icon: AlertCircle, 
            alert: stats.low_stock_count > 0 
          }
        ].map((card, idx) => (
          <div 
            key={idx}
            className="liquid-glass rounded-3xl p-6 md:p-8 flex flex-col justify-between h-[180px] group transition-all duration-500 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                {card.label}
              </span>
              <div className="p-2 rounded border border-slate-200 bg-white text-slate-500 shadow-sm">
                <card.icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light text-slate-900 tracking-tight">
                  {card.value}
                </span>
                {card.alert && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                )}
              </div>
              {card.alert && (
                <span className="text-[9px] text-red-500 block font-semibold tracking-wider uppercase">
                  Requires Balance
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="liquid-glass rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/70 shadow-md">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-slate-800 uppercase">Order Fulfillment Logs</h3>
            <p className="text-[9px] text-slate-400 tracking-wider mt-1">Live simulated dispatch monitoring of orders.</p>
          </div>
          <span className="text-[9px] font-bold text-slate-500 border border-slate-200 rounded px-2.5 py-0.5 bg-white shadow-sm uppercase tracking-widest">
            Live Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trackingCards.length > 0 ? (
            trackingCards.map(o => {
              const tracking = getEcosystemTrackingStep(o.id);
              return (
                <div key={o.id} className="p-5 rounded-2xl border border-slate-100 bg-white/40 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Invoice: ORD-{o.id}</span>
                    <span className="text-[10px] text-slate-500 font-bold">${parseFloat(o.total_amount).toFixed(2)}</span>
                  </div>
                  
                  <div className="relative pt-2">
                    <div className="absolute left-0 top-6 w-full h-[2px] bg-slate-100 -z-10" />
                    <div 
                      className="absolute left-0 top-6 h-[2px] bg-slate-800 -z-10 transition-all duration-1000" 
                      style={{ width: `${(tracking.activeStep / (tracking.steps.length - 1)) * 100}%` }}
                    />
                    
                    <div className="flex justify-between items-center">
                      {tracking.steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                            idx <= tracking.activeStep 
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                              : "bg-white border-slate-200 text-slate-400"
                          }`}>
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <span>Status: {tracking.steps[tracking.activeStep].label}</span>
                    <button 
                      onClick={() => navigate("/transactions")}
                      className="px-2.5 py-1 rounded border border-slate-200 hover:border-slate-400 bg-white text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-8 text-center text-slate-400 font-light text-xs tracking-wider">
              Build checkout invoices to populate shipment tracking logs.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
