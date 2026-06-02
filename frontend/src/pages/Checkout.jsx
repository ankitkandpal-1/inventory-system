import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { backendClient } from "../api";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Trash2,
  X,
  User,
  Activity,
  ChevronRight
} from "lucide-react";

export default function Checkout({
  orderItems,
  handleAddToOrder,
  handleQtyChange,
  handleRemoveFromOrder,
  clearCart,
  setRecentPurchases,
  triggerNotification
}) {
  const { user, isAdmin, isBuyer } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderCustomer, setOrderCustomer] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const prods = await backendClient.fetchProductCatalog();
      setProducts(prods);

      if (isAdmin) {
        const custs = await backendClient.fetchClientList();
        setCustomers(custs);
      }
    } catch (e) {
      triggerNotification(e.message, "danger");
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleOrderCheckout = async () => {
    let customerId = null;

    if (isBuyer) {
      if (!user?.customer_id) {
        triggerNotification("Buyer profile has no associated Customer record.", "danger");
        return;
      }
      customerId = user.customer_id;
    } else if (isAdmin) {
      if (!orderCustomer) {
        triggerNotification("Please select a customer profile first.", "danger");
        return;
      }
      customerId = parseInt(orderCustomer);
    }

    if (orderItems.length === 0) {
      triggerNotification("Your cart is empty.", "danger");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: customerId,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          note: item.note || ""
        }))
      };

      const itemsPurchased = [...orderItems];
      await backendClient.submitNewOrder(payload);
      
      setRecentPurchases(itemsPurchased.map(i => i.product_id));
      triggerNotification("Order checkout complete. Inventory decremented!");
      
      clearCart();
      navigate("/transactions");
      
      setTimeout(() => {
        setRecentPurchases([]);
      }, 8000);
    } catch (e) {
      triggerNotification(e.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xs font-bold tracking-[0.25em] text-slate-800 uppercase">Checkout Terminal</h2>
          <p className="text-[10px] text-slate-400 tracking-wider mt-1">Interactive transaction workspace. Stocks validate in real time.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        <div className="liquid-glass rounded-3xl p-6 md:p-8 lg:col-span-3 space-y-6 border border-slate-200 bg-white/70 shadow-md">
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-800 uppercase pb-2 border-b border-slate-100">Catalogue Shelf</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {products.length > 0 ? (
              products.map(p => {
                const cartItem = orderItems.find(item => item.product_id === p.id);
                const remainingStock = p.quantity_in_stock - (cartItem ? cartItem.quantity : 0);
                const inCart = cartItem !== undefined;
                return (
                  <button 
                    key={p.id}
                    disabled={remainingStock === 0}
                    onClick={() => handleAddToOrder(p)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] w-full block ${
                      remainingStock === 0
                        ? "bg-slate-100 border-slate-200 text-slate-450 opacity-60 cursor-not-allowed"
                        : inCart
                          ? "bg-slate-150 border-slate-400 shadow-md ring-2 ring-slate-900/5"
                          : "bg-white border-slate-200 shadow-sm hover:border-slate-350"
                    }`}
                  >
                    <h4 className="text-xs font-bold text-slate-900 mb-1 tracking-tight truncate">{p.name}</h4>
                    <span className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-500 text-[9px] font-mono tracking-widest uppercase block w-max mb-4">
                      {p.sku}
                    </span>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">${parseFloat(p.price).toFixed(2)}</span>
                      <span className="text-[9px] text-slate-400">{remainingStock} left</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-400 text-xs tracking-wider">
                Ecosystem catalog empty.
              </div>
            )}
          </div>
        </div>

        <div className="liquid-glass rounded-3xl p-6 md:p-8 lg:col-span-2 space-y-6 border border-slate-200 bg-white/70 shadow-md">
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-800 uppercase pb-2 border-b border-slate-100">Invoice Terminal</h3>
          
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Client Profile Binding</label>
            {isBuyer ? (
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xs flex items-center gap-3">
                <User className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-bold block leading-none mb-1">{user?.username} Profile</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Synced Client Account</span>
                </div>
              </div>
            ) : isAdmin ? (
              <select 
                value={orderCustomer}
                onChange={(e) => setOrderCustomer(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] tracking-wide text-slate-700 outline-none shadow-sm cursor-pointer"
              >
                <option value="" className="bg-white text-slate-400">-- Choose Client Profile --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-700">
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block border-b border-slate-200 pb-2">Invoice Items</label>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
              {orderItems.length > 0 ? (
                orderItems.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 bg-white/40 shadow-sm">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-900 truncate max-w-[140px]">{item.name}</h5>
                      <span className="text-[9px] text-slate-400">${item.price.toFixed(2)} each</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white shadow-sm font-mono">
                        <button 
                          onClick={() => handleQtyChange(item.product_id, -1)} 
                          className="text-slate-400 hover:text-slate-850 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-[12px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item.product_id, 1)} 
                          className="text-slate-400 hover:text-slate-850 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveFromOrder(item.product_id)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-350 text-xs tracking-wide">
                  Select catalog products to build invoice.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-6 flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Invoice Total</span>
            <span className="text-xl font-bold text-slate-850">${calculateOrderTotal()}</span>
          </div>

          <button 
            onClick={handleOrderCheckout}
            disabled={loading}
            className="w-full py-4 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {loading ? "Syncing checkout..." : "Complete Checkout"}
          </button>
        </div>
      </section>
    </div>
  );
}
