import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import Customers from "./pages/Customers";
import Transactions from "./pages/Transactions";
import Checkout from "./pages/Checkout";
import { AlertCircle } from "lucide-react";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="relative w-full min-h-[100vh] flex items-center justify-center font-sans z-[10]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Loading user workspace...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="relative w-full min-h-[100vh] flex items-center justify-center font-sans z-[10]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Loading user workspace...</p>
        </div>
      </div>
    );
  }
  
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
}

function Layout({
  orderItems,
  handleAddToOrder,
  handleQtyChange,
  handleRemoveFromOrder,
  clearCart,
  recentPurchases,
  setRecentPurchases,
  triggerNotification
}) {
  return (
    <div className="relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-[#030712]/10 selection:text-[#030712]">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="fixed inset-0 w-full h-full object-cover z-[0]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
      />
      <div className="fixed inset-0 bg-slate-50/92 z-[1] pointer-events-none" />
      <div className="fixed inset-0 cinematic-depth z-[1]" />

      <div className="relative w-full max-w-7xl px-4 md:px-8 z-[10] flex-grow flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard triggerNotification={triggerNotification} /></ProtectedRoute>} />
            <Route 
              path="/catalog" 
              element={
                <ProtectedRoute>
                  <Catalog 
                    orderItems={orderItems} 
                    handleAddToOrder={handleAddToOrder} 
                    handleQtyChange={handleQtyChange} 
                    recentPurchases={recentPurchases} 
                    triggerNotification={triggerNotification} 
                  />
                </ProtectedRoute>
              } 
            />
            <Route path="/customers" element={<ProtectedRoute allowedRoles={["admin"]}><Customers triggerNotification={triggerNotification} /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions triggerNotification={triggerNotification} /></ProtectedRoute>} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={["admin", "buyer"]}>
                  <Checkout 
                    orderItems={orderItems} 
                    handleAddToOrder={handleAddToOrder} 
                    handleQtyChange={handleQtyChange} 
                    handleRemoveFromOrder={handleRemoveFromOrder} 
                    clearCart={clearCart} 
                    recentPurchases={recentPurchases} 
                    setRecentPurchases={setRecentPurchases} 
                    triggerNotification={triggerNotification} 
                  />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function AppContent() {
  const [notification, setNotification] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);

  const triggerNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddToOrder = (product, config = {}) => {
    const existing = orderItems.find(item => item.product_id === product.id);
    const quantity = config.quantity || 1;
    const note = config.note || "";
    
    if (existing) {
      if (existing.quantity + quantity > product.quantity_in_stock) {
        triggerNotification(`Active inventory cap reached (${product.quantity_in_stock} items)`, "danger");
        return;
      }
      setOrderItems(orderItems.map(item => 
        item.product_id === product.id ? { 
          ...item, 
          quantity: item.quantity + quantity,
          note: note || item.note
        } : item
      ));
    } else {
      if (product.quantity_in_stock <= 0) {
        triggerNotification("Product inventory unavailable.", "danger");
        return;
      }
      setOrderItems([...orderItems, {
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        sku: product.sku,
        quantity: quantity,
        max_stock: product.quantity_in_stock,
        note: note
      }]);
    }
  };

  const handleQtyChange = (productId, amount) => {
    setOrderItems(orderItems.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + amount;
        if (newQty <= 0) return null;
        if (newQty > item.max_stock) {
          triggerNotification(`Cap reached (${item.max_stock} items)`, "danger");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveFromOrder = (productId) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setOrderItems([]);
  };

  return (
    <>
      {notification && (
        <div className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-500 animate-slide-in ${
          notification.type === "danger" 
            ? "bg-white border-red-200 text-red-700 shadow-red-200/20 animate-fade-in" 
            : "bg-white border-slate-200 text-slate-800 shadow-slate-200/20 animate-fade-in"
        }`}>
          <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-[10px] font-bold tracking-widest uppercase">{notification.message}</span>
        </div>
      )}

      <Layout 
        orderItems={orderItems} 
        handleAddToOrder={handleAddToOrder} 
        handleQtyChange={handleQtyChange} 
        handleRemoveFromOrder={handleRemoveFromOrder} 
        clearCart={clearCart} 
        recentPurchases={recentPurchases} 
        setRecentPurchases={setRecentPurchases} 
        triggerNotification={triggerNotification} 
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
