import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { backendClient } from "../api";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  X,
  MapPin,
  Shield,
  Activity
} from "lucide-react";

export default function Transactions({ triggerNotification }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [orderTracking, setOrderTracking] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("easymart_order_tracking") || "{}");
    } catch (e) {
      return {};
    }
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await backendClient.fetchOrderLogs();
      setOrders(data);
    } catch (e) {
      triggerNotification(e.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderViewDetails = async (id) => {
    try {
      const details = await backendClient.fetchOrderDetailsById(id);
      setSelectedOrder(details);
      setShowOrderModal(true);
    } catch (e) {
      triggerNotification(e.message, "danger");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Restore transaction inventory?")) return;
    try {
      await backendClient.cancelOrderEntry(id);
      triggerNotification("Order cancelled. Inventory fully restored.");
      loadOrders();
    } catch (err) {
      triggerNotification(err.message, "danger");
    }
  };

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

  const updateTrackingStep = (orderId, stepIdx) => {
    const newTracking = { ...orderTracking, [orderId]: stepIdx };
    setOrderTracking(newTracking);
    localStorage.setItem("easymart_order_tracking", JSON.stringify(newTracking));
    triggerNotification(`Fulfillment updated to: ${getEcosystemTrackingStep(orderId).steps[stepIdx].label}`);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      handleOrderViewDetails(orderId);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.25em] text-slate-800 uppercase">Transaction Records</h2>
          <p className="text-[10px] text-slate-400 tracking-wider mt-1">Audit invoice logs, view live shipment timeline details, or cancel orders.</p>
        </div>
        <button 
          onClick={() => navigate("/checkout")}
          className="px-6 py-3 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md shadow-slate-950/10 cursor-pointer"
        >
          Place New Order
        </button>
      </div>

      <section className="liquid-glass rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/70 shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-850 uppercase">Invoice History</h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs tracking-wider">Syncing database transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6 font-semibold">Transaction ID</th>
                  <th className="py-4 px-6 font-semibold">Client Profile</th>
                  <th className="py-4 px-6 font-semibold">Invoice Total</th>
                  <th className="py-4 px-6 font-semibold">Archived Date</th>
                  <th className="py-4 px-6 font-semibold">Active Tracking Step</th>
                  <th className="py-4 px-6 text-right font-semibold">Ecosystem Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length > 0 ? (
                  orders.map(o => {
                    const tracking = getEcosystemTrackingStep(o.id);
                    return (
                      <tr key={o.id} className="text-xs hover:bg-slate-50 transition-colors duration-500">
                        <td className="py-4.5 px-6">
                          <span className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 text-[9px] font-mono tracking-wider uppercase shadow-sm">
                            ORD-{o.id}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-slate-600 font-semibold">
                          {o.customer ? o.customer.full_name : `Client #${o.customer_id}`}
                        </td>
                        <td className="py-4.5 px-6 font-bold text-slate-800">${parseFloat(o.total_amount).toFixed(2)}</td>
                        <td className="py-4.5 px-6 text-slate-500">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="py-4.5 px-6">
                          <span className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-800 text-[9px] uppercase font-bold tracking-wider shadow-sm animate-pulse">
                            {tracking.steps[tracking.activeStep].label}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleOrderViewDetails(o.id)}
                              className="px-4 py-1.5 rounded border border-slate-200 hover:border-slate-400 bg-white text-slate-500 hover:text-slate-800 font-semibold text-[9px] uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer"
                            >
                              View & Track
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={() => deleteOrder(o.id)}
                                className="p-2 rounded border border-slate-200 hover:border-red-400 bg-white text-slate-500 hover:text-red-600 transition-all duration-300 shadow-sm inline-flex align-middle cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-light text-xs tracking-wider">
                      No transactions archived. Build an invoice to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showOrderModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl mx-4 space-y-6 bg-white border border-slate-200 p-8 rounded-3xl animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="modal-header border-b border-slate-100 pb-4">
              <h3 className="modal-title text-slate-955 uppercase tracking-wider text-xs font-bold">Invoice ORD-{selectedOrder.id} Details</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">Order Fulfillment Journey Progress</h4>
              {(() => {
                const tracking = getEcosystemTrackingStep(selectedOrder.id);
                return (
                  <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-4">
                    <div className="relative pt-2">
                      <div className="absolute left-0 top-6 w-full h-[2px] bg-slate-200 -z-10" />
                      <div 
                        className="absolute left-0 top-6 h-[2px] bg-slate-800 -z-10 transition-all duration-1000" 
                        style={{ width: `${(tracking.activeStep / (tracking.steps.length - 1)) * 100}%` }}
                      />
                      
                      <div className="flex justify-between items-center">
                        {tracking.steps.map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <button
                              disabled={!isAdmin}
                              onClick={() => updateTrackingStep(selectedOrder.id, idx)}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                                isAdmin ? "cursor-pointer hover:scale-105" : ""
                              } ${
                                idx <= tracking.activeStep 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                                  : "bg-white border-slate-200 text-slate-400"
                              }`}
                            >
                              {idx + 1}
                            </button>
                            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-wider mt-2 hidden sm:block">
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
              {isAdmin && (
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide mt-2 text-center">
                  * Administrator clearance active: select dispatch nodes above to override tracking state.
                </p>
              )}
            </div>

            <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fulfillment & Delivery Journey Log</h4>
              </div>
              
              {(() => {
                const tracking = getEcosystemTrackingStep(selectedOrder.id);
                
                const journeyLogs = [
                  { time: "09:30 AM", place: "EasyMart Central Hub, Delhi", details: "Invoice registration complete. Package dispatched to scanning deck.", step: 0 },
                  { time: "11:45 AM", place: "Ecosystem Warehousing Bay B", details: "Inventory verified, SKU barcode applied, and weight checks completed.", step: 1 },
                  { time: "02:15 PM", place: "Logistics Clearance Terminal 2B", details: "Carrier assigned, customs logs synced, and cargo load complete.", step: 2 },
                  { time: "04:30 PM", place: "Route Active via Cargo Express", details: "Shipment in transit. Active GPS ping registered on NH-48 route.", step: 3 },
                  { time: "07:00 PM", place: "Client Destination Gateway", details: "Package arrived safely, signature checked, and transaction closed.", step: 4 }
                ];
                
                return (
                  <div className="space-y-4">
                    {journeyLogs.map((log, idx) => {
                      const isActive = idx <= tracking.activeStep;
                      return (
                        <div key={idx} className="flex gap-4 items-start relative">
                          {idx < journeyLogs.length - 1 && (
                            <div className={`absolute left-2.5 top-6 w-[2px] h-[34px] -z-10 ${
                              idx < tracking.activeStep ? "bg-slate-800" : "bg-slate-100"
                            }`} />
                          )}
                          
                          <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                            isActive 
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                              : "bg-white border-slate-200 text-slate-400"
                          }`}>
                            {idx + 1}
                          </div>
                          
                          <div className="flex-1 text-[11px]">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className={`font-bold uppercase tracking-wider ${
                                isActive ? "text-slate-900" : "text-slate-450"
                              }`}>
                                {log.place}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">{log.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-light leading-relaxed">
                              {log.details}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-2">Customer Profile</h4>
                {selectedOrder.customer ? (
                  <div className="p-4 rounded border border-slate-200 bg-white/40 shadow-sm">
                    <div className="font-bold text-xs text-slate-900 mb-1">{selectedOrder.customer.full_name}</div>
                    <div className="text-[9px] text-slate-500 mb-0.5">Email: {selectedOrder.customer.email}</div>
                    <div className="text-[9px] text-slate-500">Phone: {selectedOrder.customer.phone_number}</div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Customer profile deleted.</p>
                )}
              </div>
              
              <div>
                <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-2">Meta Details</h4>
                <div className="p-4 rounded border border-slate-200 bg-white/40 shadow-sm space-y-1 text-[10px] text-slate-500 font-medium">
                  <div>Placed: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                  <div>Ecosystem Status: <span className="text-slate-800 font-semibold tracking-wider uppercase">Active Sync</span></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-2">Invoice Items</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/[0.01] text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {item.product ? item.product.name : `Product ID #${item.product_id}`}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {item.product ? item.product.sku : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          ${item.product ? parseFloat(item.product.price).toFixed(2) : "0.00"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          ${(parseFloat(item.product ? item.product.price : 0) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Grand Total</span>
              <span className="text-lg font-bold text-slate-900">${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
