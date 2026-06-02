import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { backendClient } from "../api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Activity,
  AlertCircle,
  Layers,
  Truck,
  ShieldCheck,
  Cpu,
  Package,
  Info,
  Calendar,
  Sparkles
} from "lucide-react";

const getProductMeta = (product) => {
  const name = (product.name || "").toLowerCase();
  const sku = (product.sku || "").toUpperCase();
  
  let category = "General Merchandise";
  let description = "Premium-grade inventory item optimized for rapid logistics processing and enterprise-level supply chain mapping.";
  let specs = {
    "Manufacturer": "EasyMart Enterprise",
    "Origin": "United States",
    "Dimensions": "12.5 x 8.4 x 4.2 in",
    "Weight": "1.4 lbs",
    "Warranty": "24 Months International",
    "Material": "Carbon-neutral Polymer",
    "Batch Code": `B-${sku.slice(0, 5)}-2026`
  };
  
  if (name.includes("mouse") || name.includes("keyboard") || name.includes("headset") || name.includes("trackpad") || name.includes("accessory") || name.includes("audio")) {
    category = "Computer Accessories";
    description = "Ergonomic tactile interface device engineered for high-precision workflows, low latency connectivity, and lasting structural durability.";
    specs = {
      "Interface": "Bluetooth 5.2 / 2.4GHz Wireless",
      "Sensor Resolution": "16,000 DPI Optical Tracker",
      "Battery Life": "Up to 120 Hours (USB-C Rechargeable)",
      "Switch Lifespan": "80 Million Tactile Clicks",
      "Compatibility": "Windows, macOS, Linux, iPadOS",
      "Weight": "72g Ultra-lightweight Design",
      "Acoustic Rating": "Silent Tactile Feedback"
    };
  } else if (name.includes("laptop") || name.includes("computer") || name.includes("desktop") || name.includes("monitor") || name.includes("screen") || name.includes("macbook") || name.includes("chromebook")) {
    category = "Advanced Hardware Systems";
    description = "Next-generation computing workstation with liquid-cooled thermal channels, high refresh rate panels, and high-performance multi-thread architecture.";
    specs = {
      "Processor Cores": "16-Core / 24-Thread (Max 5.2 GHz)",
      "System Memory": "32GB Dual-Channel DDR5 @ 6000MHz",
      "Solid State Drive": "2TB NVMe PCIe Gen 4 (7200 MB/s)",
      "Display Specs": "16.2\" Liquid Glass Panel (120Hz, 4K)",
      "Energy Rating": "ENERGY STAR® Certified v8.0",
      "Materials": "Recycled Aerospace-grade Aluminum",
      "Heat Dissipation": "Vapor Chamber Liquid Cooling"
    };
  } else if (name.includes("coffee") || name.includes("maker") || name.includes("blender") || name.includes("appliance") || name.includes("cook") || name.includes("oven") || name.includes("brewer")) {
    category = "Premium Culinary Systems";
    description = "Chef-grade kitchen appliance with custom micro-controller brewing algorithms, temperature sensor feedback, and robust steel construction.";
    specs = {
      "Power Rating": "120V ~ 60Hz, 1450 Watts",
      "Pressure System": "19-Bar High-Extraction Pump",
      "Water Tank": "2.4L Removable BPA-free Reservoir",
      "Brew Temp Control": "Dual PID Intelligent Controllers",
      "Grinder System": "Conical Steel Burrs (30 Grinds)",
      "Materials": "Brushed SUS304 Stainless Steel",
      "Safety Cert": "UL/CSA Commercial Sanitation"
    };
  } else if (name.includes("shirt") || name.includes("jacket") || name.includes("apparel") || name.includes("clothing") || name.includes("wear") || name.includes("pant") || name.includes("hoodie")) {
    category = "Textile & Apparel";
    description = "Sustainable smart-fit apparel woven with high-breathability organic fibers, anti-crease fabric matrix, and premium seam stitching.";
    specs = {
      "Material Composition": "85% Organic Cotton, 15% Recycled Silk",
      "Weave Type": "High-Density Breathable Jacquard",
      "Fit Profile": "Editorial Tailored Fit",
      "Care Instructions": "Machine Wash Cold, Hang Dry",
      "Tensile Strength": "Premium Anti-tear Seam Stitching",
      "Dye Certification": "OEKO-TEX® Standard 100 Certified",
      "Thermal Control": "Active Temperature Regulation Weave"
    };
  }
  
  return { category, description, specs };
};

const themeColors = {
  "Computer Accessories": "from-indigo-500 via-purple-500 to-pink-500",
  "Advanced Hardware Systems": "from-cyan-500 via-teal-500 to-emerald-500",
  "Premium Culinary Systems": "from-amber-500 via-orange-500 to-rose-500",
  "Textile & Apparel": "from-pink-400 via-rose-450 to-indigo-400",
  "General Merchandise": "from-slate-400 via-slate-500 to-slate-650"
};

export default function Catalog({
  orderItems,
  handleAddToOrder,
  handleQtyChange,
  recentPurchases,
  triggerNotification
}) {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeCardId, setActiveCardId] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState({ name: "", sku: "", price: "", quantity_in_stock: "" });

  const [qtyInput, setQtyInput] = useState(1);
  const [priorityOption, setPriorityOption] = useState("Standard Sync");
  const [noteText, setNoteText] = useState("");

  const [currentTab, setCurrentTab] = useState("specs");
  const [postal, setPostal] = useState("");
  const [speed, setSpeed] = useState("standard");

  useEffect(() => {
    if (activeCardId) {
      setQtyInput(1);
      setPriorityOption("Standard Sync");
      setNoteText("");
      setCurrentTab("specs");
      setPostal("");
      setSpeed("standard");
    }
  }, [activeCardId]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await backendClient.fetchProductCatalog();
      setItems(data);
    } catch (e) {
      triggerNotification(e.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    
    const priceVal = parseFloat(formData.price);
    const stockVal = parseInt(formData.quantity_in_stock);
    
    if (isNaN(priceVal) || priceVal <= 0) {
      triggerNotification("Price must be a positive number.", "danger");
      return;
    }
    
    if (isNaN(stockVal) || stockVal < 0) {
      triggerNotification("Quantity in stock cannot be negative.", "danger");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: priceVal,
        quantity_in_stock: stockVal
      };

      if (editTarget) {
        await backendClient.updateProductEntry(editTarget.id, payload);
        triggerNotification("Product database updated.");
      } else {
        await backendClient.addNewProductEntry(payload);
        triggerNotification("Product registered successfully.");
      }
      setShowProductModal(false);
      setEditTarget(null);
      setFormData({ name: "", sku: "", price: "", quantity_in_stock: "" });
      fetchCatalog();
    } catch (err) {
      triggerNotification(err.message, "danger");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Confirm deletion from active registry?")) return;
    try {
      await backendClient.removeProductEntry(id);
      triggerNotification("Product deleted successfully.");
      fetchCatalog();
    } catch (err) {
      triggerNotification(err.message, "danger");
    }
  };

  const matchedItems = items.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.25em] text-slate-800 uppercase">Product Catalogue</h2>
          <p className="text-[10px] text-slate-400 tracking-wider mt-1">Select a product card to open details or add to cart directly.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setEditTarget(null);
              setFormData({ name: "", sku: "", price: "", quantity_in_stock: "" });
              setShowProductModal(true);
            }}
            className="px-6 py-3 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md shadow-slate-950/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        )}
      </div>

      <section className="liquid-glass rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/70 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 w-full">
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-800 uppercase">Active Items</h3>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded w-full md:w-80 shadow-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search catalog by name or sku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-slate-700 outline-none text-[10px] tracking-wider uppercase w-full font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs tracking-wider">Syncing database registries...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchedItems.length > 0 ? (
              matchedItems.map(p => {
                const cartItem = orderItems.find(item => item.product_id === p.id);
                const remainingStock = p.quantity_in_stock - (cartItem ? cartItem.quantity : 0);
                const isRecent = recentPurchases.includes(p.id);
                const isLimited = remainingStock < 10;
                const isSelectionForYou = p.id % 2 === 0;
                
                const prodInfo = getProductMeta(p);
                const isExpanded = activeCardId === p.id;
                if (isExpanded) {
                  return (
                    <div 
                      key={p.id}
                      onClick={(e) => e.stopPropagation()}
                      className="col-span-1 md:col-span-2 lg:col-span-3 liquid-glass rounded-3xl p-8 border border-slate-350 bg-white/95 shadow-xl transition-all duration-500 flex flex-col justify-between cursor-default animate-fade-in relative z-20 space-y-6"
                    >
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${themeColors[prodInfo.category] || "from-slate-400 to-slate-650"} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                            {(() => {
                              const IconComp = prodInfo.category === "Computer Accessories" ? Cpu :
                                                prodInfo.category === "Advanced Hardware Systems" ? Layers :
                                                prodInfo.category === "Premium Culinary Systems" ? Sparkles :
                                                prodInfo.category === "Textile & Apparel" ? Package : Info;
                              return <IconComp className="w-5 h-5" />;
                            })()}
                          </div>
                          <div>
                            <div className="flex flex-wrap gap-2 mb-0.5 justify-start items-center">
                              <span className="px-2.5 py-0.5 rounded border border-slate-200 bg-white text-slate-500 text-[9px] font-mono tracking-widest uppercase shadow-sm">
                                {p.sku}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[8px] font-bold tracking-wider uppercase">
                                {prodInfo.category} Specifications
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{p.name}</h3>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveCardId(null)} 
                          className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-full hover:bg-slate-50 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                        
                        <div className="lg:col-span-2 space-y-6 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-slate-250 pb-6 lg:pb-0">
                          
                          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                            {[
                              { id: "specs", label: "Specifications", icon: Cpu },
                              { id: "logistics", label: "Warehouse Mapping", icon: MapPin },
                              { id: "telemetry", label: "Compliance & Score", icon: ShieldCheck },
                              { id: "shipping", label: "Transit Estimator", icon: Truck }
                            ].map(tab => {
                              const TabIcon = tab.icon;
                              const isActive = currentTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setCurrentTab(tab.id)}
                                  className={`flex items-center gap-2 py-2 px-4 rounded-xl text-[9px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer border ${
                                    isActive
                                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/10 scale-[1.03]"
                                      : "bg-white border-slate-250 text-slate-500 hover:border-slate-400 hover:text-slate-800"
                                  }`}
                                >
                                  <TabIcon className="w-3.5 h-3.5" />
                                  {tab.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="min-h-[220px]">
                            {currentTab === "specs" && (
                              <div className="space-y-5 animate-fade-in">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                  <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description Matrix</span>
                                    <p className="text-xs text-slate-650 leading-relaxed font-light mt-0.5">{prodInfo.description}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                  {Object.entries(prodInfo.specs).map(([key, val]) => (
                                    <div key={key} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center transition-all hover:border-slate-350">
                                      <span className="text-[8px] font-bold text-slate-450 uppercase tracking-[0.2em]">{key}</span>
                                      <span className="text-xs font-semibold text-slate-850 mt-1">{val}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {currentTab === "logistics" && (
                              <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-50 pb-1.5"><MapPin className="w-3.5 h-3.5 text-slate-800" /> Physical Mapping</span>
                                    <div className="space-y-2 text-[11px] text-slate-650 font-light">
                                      <div className="flex justify-between border-b border-slate-50 pb-1">
                                        <span>Warehouse Center:</span>
                                        <span className="font-bold text-slate-850">Zone-B, Logistics Hub 3</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-50 pb-1">
                                        <span>Aisle / Rack:</span>
                                        <span className="font-bold text-slate-850">Aisle 14, Rack Section D</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Storage Bin Coord:</span>
                                        <span className="font-bold text-slate-850">Bin C-43 (Temp Controlled)</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-50 pb-1.5"><Activity className="w-3.5 h-3.5 text-slate-800" /> Operational Metrics</span>
                                    <div className="space-y-2 text-[11px] text-slate-650 font-light">
                                      <div className="flex justify-between border-b border-slate-50 pb-1">
                                        <span>Storage Allocation:</span>
                                        <span className="font-bold text-slate-850">84.2% Safe Utilization</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-50 pb-1">
                                        <span>Transit Threshold:</span>
                                        <span className="font-bold text-slate-850">Minimum 12 Units Reserve</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Optimal Temp:</span>
                                        <span className="font-bold text-slate-850">68°F (Standard Ambience)</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Dynamic Storage Level Capacity</span>
                                    <span>{p.quantity_in_stock} Units / 150 Limit</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-slate-900 transition-all duration-1000" 
                                      style={{ width: `${Math.min((p.quantity_in_stock / 150) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-[8px] text-slate-450 block font-light leading-snug">
                                    * When stock level falls below 10 units, system triggers an automatic logistics restock command to Zone-B.
                                  </span>
                                </div>
                              </div>
                            )}

                            {currentTab === "telemetry" && (
                              <div className="space-y-5 animate-fade-in">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
                                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Compliance Checklist</span>
                                  <div className="grid grid-cols-2 gap-3 text-[10px] font-bold tracking-wider uppercase font-mono">
                                    {[
                                      { name: "CE Compliance", pass: true },
                                      { name: "RoHS Directive", pass: true },
                                      { name: "UL Sanitation", pass: true },
                                      { name: "EnergyStar v8.0", pass: p.id % 2 === 0 },
                                      { name: "ISO 9001 Audited", pass: true },
                                      { name: "Carbon Neutral", pass: p.price > 50 }
                                    ].map(item => (
                                      <div key={item.name} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <span className={`w-2 h-2 rounded-full ${item.pass ? "bg-emerald-500" : "bg-slate-350"}`} />
                                        <span className="text-slate-700">{item.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                                    <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase block">Carbon Offset</span>
                                    <span className="text-sm font-bold text-slate-850 block mt-1">{p.price > 50 ? "A+ Premium" : "B- Standard"}</span>
                                  </div>
                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                                    <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase block">Real-time Demand</span>
                                    <span className="text-sm font-bold text-slate-850 block mt-1">{p.quantity_in_stock < 15 ? "High Spike" : "Steady Sync"}</span>
                                  </div>
                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                                    <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase block">Quality Rate</span>
                                    <span className="text-sm font-bold text-slate-850 block mt-1">99.4% Pass</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {currentTab === "shipping" && (
                              <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                                    <label className="text-[9px] font-bold text-slate-450 tracking-wider uppercase block">Target Zip Code / Region</label>
                                    <input 
                                      type="text" 
                                      maxLength={5}
                                      placeholder="e.g. 90210"
                                      value={postal}
                                      onChange={(e) => setPostal(e.target.value.replace(/\D/g, ""))}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-slate-450 focus:bg-white transition-all font-mono"
                                    />
                                    <span className="text-[8px] text-slate-400 block font-light leading-none">
                                      Enter a 5-digit code to estimate transit speed.
                                    </span>
                                  </div>

                                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
                                    <span className="text-[9px] font-bold text-slate-450 tracking-wider uppercase block">Logistics Speed</span>
                                    <div className="flex gap-2">
                                      {[
                                        { id: "standard", label: "Ground", fee: 0, days: 5 },
                                        { id: "air", label: "Air Sync", fee: 14.99, days: 2 },
                                        { id: "courier", label: "Courier", fee: 39.99, days: 0 }
                                      ].map(carrier => (
                                        <button
                                          key={carrier.id}
                                          type="button"
                                          onClick={() => setSpeed(carrier.id)}
                                          className={`flex-1 py-2 px-1 rounded-lg border text-[8px] font-bold tracking-wider uppercase text-center transition-all cursor-pointer ${
                                            speed === carrier.id 
                                              ? "bg-slate-900 border-slate-900 text-white"
                                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                          }`}
                                        >
                                          {carrier.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {postal.length === 5 ? (
                                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-950 text-white space-y-2.5 shadow-md shadow-slate-950/15 animate-fade-in">
                                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Estimated Delivery Coordinates</span>
                                    <div className="flex justify-between items-center text-xs">
                                      <div>
                                        <span className="block font-bold">
                                          {speed === "standard" ? "Delivered in 5 Days" : speed === "air" ? "Delivered in 2 Days" : "Delivered Today!"}
                                        </span>
                                        <span className="text-[9px] text-slate-350 block mt-0.5">
                                          Expected Arrival: {
                                            (() => {
                                              const date = new Date();
                                              const addDays = speed === "standard" ? 5 : speed === "air" ? 2 : 0;
                                              date.setDate(date.getDate() + addDays);
                                              return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                            })()
                                          }
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span className="block font-bold text-emerald-400">
                                          {speed === "standard" ? "FREE Sync" : `$${(speed === "air" ? 14.99 : 39.99).toFixed(2)}`}
                                        </span>
                                        <span className="text-[9px] text-slate-350 block mt-0.5">Estimated Charge</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center py-6">
                                    <span className="text-[9px] text-slate-400 font-light tracking-wide block">
                                      Specify target region ZIP code above to trigger dynamic transit calculation.
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-5">
                          <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.25em] uppercase">Configuration Terminal</h4>

                          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex justify-between items-center">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Base Value</span>
                              <span className="text-2xl font-light text-slate-900">${parseFloat(p.price).toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] font-bold text-slate-455 uppercase tracking-[0.2em] block">Total Synced Value</span>
                              <span className="text-xl font-bold text-slate-800 block">${(parseFloat(p.price) * qtyInput).toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              <span>Remaining Stock Available</span>
                              <span className={remainingStock < 10 ? "text-amber-600 font-bold" : ""}>
                                {remainingStock} Units
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${
                                  remainingStock >= 10 
                                    ? "bg-slate-900" 
                                    : remainingStock === 0 
                                      ? "bg-red-500" 
                                      : "bg-amber-500"
                                }`} 
                                style={{ width: `${Math.min((remainingStock / 120) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-slate-455 tracking-[0.2em] uppercase block">Logistics Sync Priority</label>
                            <div className="flex flex-wrap gap-2 text-[8px] font-bold tracking-wider uppercase font-mono">
                              {["Standard Sync", "Priority Air", "VIP Express"].map(prio => (
                                <button
                                  key={prio}
                                  type="button"
                                  onClick={() => setPriorityOption(prio)}
                                  className={`py-2 px-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                                    priorityOption === prio
                                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-850"
                                  }`}
                                >
                                  {prio}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                            <label className="text-[8px] font-bold text-slate-455 tracking-[0.2em] uppercase block">Custom Dispatch Instructions</label>
                            <input
                              type="text"
                              placeholder="e.g. Fragile handle with care..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full bg-transparent border-none text-[11px] text-slate-800 outline-none font-medium p-0"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                            <label className="text-[8px] font-bold text-slate-455 tracking-[0.2em] uppercase block">Order Quantity</label>
                            <div className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                              <button
                                type="button"
                                disabled={qtyInput <= 1}
                                onClick={() => setQtyInput(qtyInput - 1)}
                                className="w-6.5 h-6.5 rounded flex items-center justify-center font-bold text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-slate-900 min-w-[14px] text-center font-mono">
                                {qtyInput}
                              </span>
                              <button
                                type="button"
                                disabled={qtyInput >= remainingStock}
                                onClick={() => setQtyInput(qtyInput + 1)}
                                className="w-6.5 h-6.5 rounded flex items-center justify-center font-bold text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={remainingStock <= 0}
                            onClick={() => {
                              const finalNote = `[${priorityOption}] ${noteText}`.trim();
                              handleAddToOrder(p, {
                                quantity: qtyInput,
                                note: finalNote
                              });
                              triggerNotification(`Configured ${p.name} & added to cart!`);
                              setActiveCardId(null);
                            }}
                            className={`w-full py-3.5 rounded-xl font-bold text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer flex justify-center items-center gap-2 shadow-md ${
                              remainingStock <= 0
                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10"
                            }`}
                          >
                            {remainingStock <= 0 
                              ? "Out of Stock" 
                              : `Sync Config & Add — $${(parseFloat(p.price) * qtyInput).toFixed(2)}`
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={p.id}
                    onClick={() => setActiveCardId(p.id)}
                    className={`liquid-glass rounded-3xl p-6 flex flex-col justify-between min-h-[300px] cursor-pointer group shadow-sm transition-all duration-300 relative border hover:scale-[1.02] active:scale-[0.99] hover:shadow-lg active:shadow-md hover:border-slate-350 ${
                      isRecent 
                        ? "border-emerald-400 bg-emerald-50/50 shadow-emerald-100 ring-2 ring-emerald-400/20" 
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3 justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded border border-slate-200 bg-white text-slate-500 text-[9px] font-mono tracking-widest uppercase shadow-sm">
                          {p.sku}
                        </span>
                        
                        <div className="flex gap-1">
                          {isRecent && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-bold tracking-wider uppercase animate-pulse">
                              Just Bought
                            </span>
                          )}
                          {isLimited && (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[8px] font-bold tracking-wider uppercase">
                              Limited Stock
                            </span>
                          )}
                          {isSelectionForYou && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[8px] font-bold tracking-wider uppercase">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight group-hover:text-slate-850 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 tracking-wide font-light line-clamp-2">
                          {prodInfo.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="space-y-1 mb-4 font-mono">
                        <div className="flex justify-between text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                          <span>Stock Level</span>
                          <span className={remainingStock < 10 ? "text-amber-600 font-bold" : ""}>
                            {remainingStock} Units
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              remainingStock >= 10 
                                ? "bg-slate-900" 
                                : remainingStock === 0 
                                  ? "bg-red-500" 
                                  : "bg-amber-500"
                            }`} 
                            style={{ width: `${Math.min((remainingStock / 125) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-center py-2 px-3 rounded-xl border border-slate-100 bg-slate-50/50 group-hover:border-slate-350 group-hover:bg-slate-50 transition-all duration-300 mb-4 block w-full text-[9px] font-bold text-slate-500 group-hover:text-slate-850 tracking-wider uppercase">
                        🔬 Expand Specs & Telemetry
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.25em]">Value</span>
                          <span className="text-base font-light text-slate-950">${parseFloat(p.price).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                        {(() => {
                          const cartItem = orderItems.find(item => item.product_id === p.id);
                          if (cartItem) {
                            return (
                              <div className="flex items-center gap-2 px-2 py-1 rounded border border-slate-200 bg-slate-50 shadow-inner animate-fade-in">
                                <button 
                                  onClick={() => {
                                    handleQtyChange(p.id, -1);
                                    triggerNotification(`Decremented ${p.name} from cart.`);
                                  }} 
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold text-xs hover:bg-white rounded transition-colors cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-slate-900 min-w-[14px] text-center">
                                  {cartItem.quantity}
                                </span>
                                <button 
                                  onClick={() => {
                                    handleQtyChange(p.id, 1);
                                    triggerNotification(`Incremented ${p.name} in cart.`);
                                  }} 
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold text-xs hover:bg-white rounded transition-colors cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            );
                          }
                          return (
                            <button
                              onClick={() => {
                                handleAddToOrder(p);
                                triggerNotification(`Added ${p.name} to checkout cart!`);
                              }}
                              disabled={remainingStock === 0}
                              className={`px-4 py-2 rounded font-semibold text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                                remainingStock === 0 
                                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10"
                              }`}
                            >
                              Add To Cart
                            </button>
                          );
                        })()}

                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => {
                                setEditTarget(p);
                                setFormData({
                                  name: p.name,
                                  sku: p.sku,
                                  price: parseFloat(p.price).toString(),
                                  quantity_in_stock: p.quantity_in_stock.toString()
                                });
                                setShowProductModal(true);
                              }}
                              className="p-2 rounded border border-slate-200 hover:border-slate-400 bg-white text-slate-500 hover:text-slate-800 transition-all shadow-sm cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => removeProduct(p.id)}
                              className="p-2 rounded border border-slate-200 hover:border-red-400 bg-white text-slate-500 hover:text-red-600 transition-all shadow-sm cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-400 font-light text-xs tracking-wider">
                Catalogue empty. Configure products to begin.
              </div>
            )}
          </div>
        )}
      </section>

      {showProductModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content max-w-lg mx-4 bg-white border border-slate-200 p-8 rounded-3xl animate-slide-up shadow-2xl">
            <div className="modal-header pb-4 border-b border-slate-100 mb-4">
              <h3 className="modal-title text-slate-950 uppercase tracking-wider text-xs font-bold">{editTarget ? "Edit Catalog Product" : "Add Catalog Product"}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={saveProduct} className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Product Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Wireless Optical Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
                />
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">SKU / Serial Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. MS-WIRELESS-100"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="24.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-slate-400 focus-within:bg-white transition-all duration-300">
                  <label className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase block">Stock Qty</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    placeholder="50"
                    value={formData.quantity_in_stock}
                    onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                    className="w-full bg-transparent border-none text-xs text-slate-800 outline-none font-medium p-0"
                  />
                </div>
              </div>

              <div className="modal-footer pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2.5 rounded border border-slate-200 bg-white text-slate-600 hover:text-slate-800 font-semibold text-[10px] tracking-widest uppercase transition-all shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded bg-slate-900 text-white font-semibold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  {editTarget ? "Update Catalog" : "Add to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
