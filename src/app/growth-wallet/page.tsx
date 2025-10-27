"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import SideNav from '../../components/SideNav';
import { translations } from '../../lib/translations';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AutoPilotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Product Database with Indian Art & Crafts ---
const PRODUCTS = [
  {
    id: 1,
    name: "Golden Elephant",
    category: "Madhubani Art",
    basePrice: 2500,
    description: "Handcrafted heritage elephant with gold leaf detailing",
    image: "https://images.unsplash.com/photo-1560415751-3fdf6c7f5e47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    productionTime: 3,
    materialCost: 800,
    initialMarketingCost: 1200
  },
  {
    id: 2,
    name: "Blue Pottery Vase",
    category: "Rajasthani Craft",
    basePrice: 1800,
    description: "Traditional blue pottery with intricate patterns",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    productionTime: 2,
    materialCost: 600,
    initialMarketingCost: 900
  },
  {
    id: 3,
    name: "Silk Embroidery",
    category: "Kashmiri Textile",
    basePrice: 3500,
    description: "Hand-stitched silk embroidery with natural dyes",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    productionTime: 5,
    materialCost: 1200,
    initialMarketingCost: 1500
  }
];

// --- Helper Function to Format Currency in Rupees ---
const formatRupees = (amount) => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return `₹${amount.toFixed(2)}`;
};

// --- Instructions Popup Component ---
const InstructionsPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl border border-slate-600/50 shadow-2xl max-w-md mx-4 w-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-600/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <HelpIcon />
            How to Use This Simulator
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-slate-700/50"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-4">
          <ul className="text-sm text-slate-300 space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Select an Indian handicraft product to simulate pricing strategies</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Use different pricing strategies to test market responses</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Monitor how price changes affect sales volume and earnings</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Enable Autopilot for AI-driven continuous optimization</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Goal: Maximize profit while maintaining sustainable sales</span>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-slate-600/50">
          <button
            onClick={onClose}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Compact Helper Components ---

const DashboardStatCard = ({ label, value, trend = null, size = "normal" }) => (
  <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600/30 backdrop-blur-sm">
    <p className="text-xs text-slate-400 mb-1 font-medium">
      {label}
    </p>
    <div className="flex items-end justify-between">
      <p className={`font-bold text-white ${size === "large" ? 'text-2xl' : 'text-lg'}`}>
        {value}
      </p>
      {trend !== null && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : trend < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {trend !== 0 ? `${Math.abs(trend).toFixed(1)}%` : ''}
        </span>
      )}
    </div>
  </div>
);

const SimulationButton = ({ onClick, children, className = '', icon = null, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-white transition-all duration-200 text-sm hover:scale-105 active:scale-95 disabled:opacity-50 ${className}`}
  >
    {icon}
    {children}
  </button>
);

const ToggleButton = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
    <div className="flex-1 min-w-0">
      <label className="text-sm font-semibold text-white block truncate">
        {label}
      </label>
    </div>
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 flex-shrink-0 ${enabled ? 'bg-teal-500' : 'bg-gray-600'}`}
    >
      <span
        className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-1'}`}
      />
    </button>
  </div>
);

// --- Compact Line Chart Component ---
const CompactLineChart = ({ data, width = 280, height = 120 }) => {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center w-full h-[120px] bg-slate-700/30 rounded-lg border border-slate-600/30 text-slate-400 text-xs">
        Run simulation to see chart...
      </div>
    );
  }

  const padding = { top: 15, right: 10, bottom: 25, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const prices = data.map(d => d.price);
  const earnings = data.map(d => d.earnings);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minEarnings = Math.min(...earnings);
  const maxEarnings = Math.max(...earnings);

  const scaleX = (price) => {
    return padding.left + (price - minPrice) / (maxPrice - minPrice || 1) * chartWidth;
  };

  const scaleY = (earning) => {
    return padding.top + chartHeight - (earning - minEarnings) / (maxEarnings - minEarnings || 1) * chartHeight;
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid Lines */}
        {[0, 0.5, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * ratio}
            x2={width - padding.right}
            y2={padding.top + chartHeight * ratio}
            stroke="rgba(100, 116, 139, 0.2)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Chart Line */}
        <path 
          d={`M${data.map(d => `${scaleX(d.price)},${scaleY(d.earnings)}`).join(' L')}`} 
          fill="none" 
          stroke="#2dd4bf" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        
        {/* Data Points */}
        {data.map((d, i) => (
          <circle 
            key={i}
            cx={scaleX(d.price)} 
            cy={scaleY(d.earnings)} 
            r="2" 
            fill="#2dd4bf"
            stroke="#0f766e"
            strokeWidth="1"
          >
            <title>{`Price: ${formatRupees(d.price)}, Earnings: ${formatRupees(d.earnings)}`}</title>
          </circle>
        ))}
        
        {/* Current Point */}
        {data.length > 0 && (
          <circle 
            cx={scaleX(data[data.length - 1].price)} 
            cy={scaleY(data[data.length - 1].earnings)} 
            r="3" 
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />
        )}
        
        {/* X-axis label */}
        <text x={width / 2} y={height - 5} fill="#94a3b8" fontSize="10" textAnchor="middle">
          Price (₹)
        </text>
        
        {/* Y-axis label */}
        <text x={10} y={height / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90, 10, ${height / 2})`}>
          Earnings (₹)
        </text>
      </svg>
    </div>
  );
};

// --- AI Simulation Logic with Realistic Limits ---
class AIPricingSimulation {
  constructor(product) {
    this.product = product;
    this.state = {
      price: product.basePrice,
      sales: 8,
      earnings: product.basePrice * 8,
      marketingCost: product.initialMarketingCost,
      marketDemand: 1.0,
      customerSatisfaction: 0.8,
      weeksRunning: 0,
      totalProfit: 0
    };
    this.history = [{
      price: this.state.price,
      earnings: this.state.earnings,
      sales: this.state.sales,
      marketingCost: this.state.marketingCost,
      week: 0
    }];
    
    // Realistic limits for traditional crafts business
    this.maxPrice = product.basePrice * 5; // Maximum 5x base price
    this.maxWeeklySales = 50; // Maximum 50 units per week
    this.profitSaturation = 500000; // ₹5L total profit saturation
  }

  calculateMarketResponse(newPrice, marketingBoost = 0) {
    const baseDemand = this.product.basePrice / newPrice;
    const priceSensitivity = 1.2;
    const marketingEffect = marketingBoost * 0.3;
    
    let demand = baseDemand * this.state.marketDemand;
    demand = Math.max(0.1, Math.min(2.0, demand + marketingEffect));
    
    const priceRatio = newPrice / this.product.basePrice;
    if (priceRatio > 3.0) {
      demand *= 0.3; // Heavy penalty for very high prices
    } else if (priceRatio > 2.0) {
      demand *= 0.6;
    } else if (priceRatio > 1.5) {
      demand *= 0.8;
    }
    
    return demand;
  }

  optimizePrice(strategy) {
    const current = this.state;
    let newPrice = current.price;
    let marketingBoost = 0;
    let status = "";

    switch (strategy) {
      case 'high_demand':
        newPrice = Math.min(this.maxPrice, current.price * 1.15);
        status = "Testing premium pricing for high demand...";
        break;
      case 'low_demand':
        newPrice = Math.max(this.product.materialCost * 1.3, current.price * 0.85);
        status = "Testing promotional pricing...";
        break;
      case 'profit_max':
        newPrice = Math.min(this.maxPrice, current.price * 1.25);
        status = "Maximizing profit margins...";
        break;
      case 'market_penetration':
        newPrice = Math.max(this.product.materialCost * 1.5, current.price * 0.75);
        marketingBoost = 0.5;
        status = "Aggressive market penetration...";
        break;
      case 'balanced':
        const profitMargin = (current.price - this.product.materialCost) / current.price;
        newPrice = profitMargin > 0.6 ? 
          Math.max(this.product.materialCost * 1.3, current.price * 0.95) : 
          Math.min(this.maxPrice, current.price * 1.1);
        status = "Balanced price adjustment...";
        break;
    }

    const demand = this.calculateMarketResponse(newPrice, marketingBoost);
    const newSales = Math.max(1, Math.min(this.maxWeeklySales, Math.floor(current.sales * demand)));
    const materialCost = newSales * this.product.materialCost;
    const newMarketingCost = this.product.initialMarketingCost * (1 + marketingBoost);
    const revenue = newPrice * newSales;
    const newEarnings = revenue - materialCost - newMarketingCost;

    const earningsChange = (newEarnings - current.earnings) / current.earnings;
    let newMarketDemand = current.marketDemand;
    
    if (earningsChange > 0.1) {
      newMarketDemand = Math.min(2.0, newMarketDemand * 1.05);
    } else if (earningsChange < -0.1) {
      newMarketDemand = Math.max(0.3, newMarketDemand * 0.95);
    }

    // Apply profit saturation
    const additionalProfit = Math.max(0, newEarnings);
    const saturatedProfit = Math.min(this.profitSaturation - current.totalProfit, additionalProfit);

    this.state = {
      ...this.state,
      price: parseFloat(newPrice.toFixed(2)),
      sales: newSales,
      earnings: parseFloat(newEarnings.toFixed(2)),
      marketingCost: parseFloat(newMarketingCost.toFixed(2)),
      marketDemand: parseFloat(newMarketDemand.toFixed(3)),
      weeksRunning: current.weeksRunning + 1,
      totalProfit: current.totalProfit + saturatedProfit
    };

    this.history.push({
      price: this.state.price,
      earnings: this.state.earnings,
      sales: this.state.sales,
      marketingCost: this.state.marketingCost,
      week: this.state.weeksRunning
    });

    return {
      status,
      price: this.state.price,
      sales: this.state.sales,
      earnings: this.state.earnings,
      marketingCost: this.state.marketingCost,
      marketDemand: this.state.marketDemand
    };
  }

  getCurrentState() {
    return { ...this.state };
  }

  getHistory() {
    return [...this.history];
  }

  reset() {
    this.state = {
      price: this.product.basePrice,
      sales: 8,
      earnings: this.product.basePrice * 8,
      marketingCost: this.product.initialMarketingCost,
      marketDemand: 1.0,
      customerSatisfaction: 0.8,
      weeksRunning: 0,
      totalProfit: 0
    };
    this.history = [{
      price: this.state.price,
      earnings: this.state.earnings,
      sales: this.state.sales,
      marketingCost: this.state.marketingCost,
      week: 0
    }];
  }
}

// --- Main Compact Page Component ---

export default function GrowthWalletPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showInstructions, setShowInstructions] = useState(true); // Show instructions on launch
  const t = translations[language];

  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [simulation, setSimulation] = useState(() => new AIPricingSimulation(PRODUCTS[0]));
  const [aiStatus, setAiStatus] = useState("Select strategy to begin optimization...");
  
  const currentState = simulation.getCurrentState();
  const history = simulation.getHistory();

  useEffect(() => {
    setSimulation(new AIPricingSimulation(selectedProduct));
    setAiStatus("Select strategy to begin optimization...");
  }, [selectedProduct]);

  const handleStrategy = (strategy) => {
    const result = simulation.optimizePrice(strategy);
    setAiStatus(result.status);
  };

  const handleReset = () => {
    simulation.reset();
    setAiStatus("Simulation reset to initial state");
  };

  const priceTrend = history.length > 1 ? 
    ((history[history.length - 1].price - history[history.length - 2].price) / history[history.length - 2].price * 100) : 0;
  
  const earningsTrend = history.length > 1 ? 
    ((history[history.length - 1].earnings - history[history.length - 2].earnings) / history[history.length - 2].earnings * 100) : 0;

  // --- Autopilot State ---
  const [isAutopilotOn, setIsAutopilotOn] = useState(false);
  const [autopilotLog, setAutopilotLog] = useState([
    "[10:31] System: Traditional crafts analysis initialized",
    "[10:31] AI: Market positioning for Indian handicrafts complete",
    "[10:32] Ready: Select pricing strategy to begin",
  ]);
  const logIntervalRef = useRef(null);

  const strategyLogs = {
    high_demand: "Premium pricing for high demand periods",
    low_demand: "Promotional pricing to stimulate demand",
    profit_max: "Maximizing profit margins strategically",
    market_penetration: "Aggressive pricing for market share",
    balanced: "Balanced pricing adjustment applied"
  };

  useEffect(() => {
    if (isAutopilotOn) {
      const strategies = ['high_demand', 'low_demand', 'profit_max', 'balanced'];
      logIntervalRef.current = setInterval(() => {
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        handleStrategy(randomStrategy);
        
        const now = new Date();
        const timestamp = `[${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}]`;
        setAutopilotLog(prev => {
          const newLog = [...prev, `${timestamp} ${strategyLogs[randomStrategy]}`];
          return newLog.slice(-8);
        });
      }, 4000);
    } else {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
    }
    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
    };
  }, [isAutopilotOn]);

  const logContainerRef = useRef(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [autopilotLog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#054b09] to-[#033d07] text-white relative">
      <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} t={t} />

      {/* Instructions Popup */}
      <InstructionsPopup isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

      <div className="fixed top-0 left-0 w-full z-50">
        <Header
          onMenuClick={() => setIsNavOpen(!isNavOpen)}
          onLanguageToggle={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
          t={t}
        />
      </div>

      <div className="fixed top-16 left-4 z-40">
        <Link href="/" className="flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 border border-slate-600/50">
          <BackIcon />
        </Link>
      </div>

      <div className="relative z-10 pt-16">
        {/* Compact Header */}
        <div className="text-center pt-8 pb-6 px-4">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-2 bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Growth Wallet
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            AI-powered pricing optimization for Indian handicrafts • Test strategies in real-time
          </p>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-7xl mx-auto">
            
            {/* --- Left: AI Pricing Lab (Compact) --- */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-700/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-teal-500/20 rounded-lg">
                  <AnalyticsIcon />
                </div>
                <h2 className="text-xl font-bold text-white">AI Pricing Lab</h2>
              </div>
              
              {/* Product Selection Row */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  SELECT INDIAN HANDICRAFT
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {PRODUCTS.map(product => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`flex-shrink-0 p-2 rounded-lg border transition-all duration-200 text-left min-w-0 ${
                        selectedProduct.id === product.id 
                          ? 'bg-teal-500/20 border-teal-500/50' 
                          : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                          <p className="text-xs text-slate-400">{formatRupees(product.basePrice)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Dashboard */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <DashboardStatCard 
                  label="Current Price" 
                  value={formatRupees(currentState.price)}
                  trend={parseFloat(priceTrend.toFixed(1))}
                />
                <DashboardStatCard 
                  label="Weekly Sales" 
                  value={currentState.sales}
                />
                <DashboardStatCard 
                  label="Weekly Earnings" 
                  value={formatRupees(currentState.earnings)}
                  trend={parseFloat(earningsTrend.toFixed(1))}
                />
                <DashboardStatCard 
                  label="Market Demand" 
                  value={`${(currentState.marketDemand * 100).toFixed(0)}%`}
                />
              </div>

              {/* Compact Chart */}
              <div className="mb-4">
                <CompactLineChart data={history.map(h => ({ price: h.price, earnings: h.earnings }))} />
              </div>

              {/* Status & Strategies */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 mb-2 font-semibold">AI STATUS</div>
                <div className="text-sm text-teal-300 bg-slate-700/30 rounded-lg p-2 border border-slate-600/30">
                  {aiStatus}
                </div>
              </div>

              {/* Compact Strategy Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <SimulationButton 
                  onClick={() => handleStrategy('high_demand')}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                  icon="🔼"
                >
                  High Demand
                </SimulationButton>
                <SimulationButton 
                  onClick={() => handleStrategy('low_demand')}
                  className="bg-red-600 hover:bg-red-700 text-xs"
                  icon="🔽"
                >
                  Low Demand
                </SimulationButton>
                <SimulationButton 
                  onClick={() => handleStrategy('profit_max')}
                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                  icon="💰"
                >
                  Max Profit
                </SimulationButton>
                <SimulationButton 
                  onClick={() => handleStrategy('market_penetration')}
                  className="bg-orange-600 hover:bg-orange-700 text-xs"
                  icon="🎯"
                >
                  Gain Market
                </SimulationButton>
                <SimulationButton 
                  onClick={() => handleStrategy('balanced')}
                  className="bg-gray-600 hover:bg-gray-700 text-xs"
                  icon="⚖️"
                >
                  Balanced
                </SimulationButton>
                <SimulationButton 
                  onClick={handleReset}
                  className="bg-red-700 hover:bg-red-800 text-xs"
                  icon="🔄"
                >
                  Reset
                </SimulationButton>
              </div>
            </div>

            {/* --- Right: Autopilot & Product Info (Compact) --- */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-700/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AutoPilotIcon />
                </div>
                <h2 className="text-xl font-bold text-white">AI Autopilot</h2>
              </div>

              {/* Product Preview & Toggle Row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Product Image */}
                <div className="col-span-1">
                  <img 
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-20 object-cover rounded-lg border border-amber-500/30"
                  />
                </div>
                
                {/* Product Info */}
                <div className="col-span-2">
                  <h3 className="font-semibold text-white text-sm truncate">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">{selectedProduct.category}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-slate-300">
                    <div>Cost: {formatRupees(selectedProduct.materialCost)}</div>
                    <div>Base: {formatRupees(selectedProduct.basePrice)}</div>
                    <div>Time: {selectedProduct.productionTime}d</div>
                    <div>Weeks: {currentState.weeksRunning}</div>
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <div className="mb-4">
                <ToggleButton 
                  label="AI Autopilot"
                  enabled={isAutopilotOn}
                  onToggle={() => setIsAutopilotOn(!isAutopilotOn)}
                />
              </div>

              {/* Business Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <DashboardStatCard 
                  label="Total Profit" 
                  value={formatRupees(currentState.totalProfit)}
                  size="large"
                />
                <DashboardStatCard 
                  label="Marketing" 
                  value={formatRupees(currentState.marketingCost)}
                />
                <DashboardStatCard 
                  label="Satisfaction" 
                  value={`${(currentState.customerSatisfaction * 100).toFixed(0)}%`}
                />
                <DashboardStatCard 
                  label="Data Points" 
                  value={history.length}
                />
              </div>

              {/* Compact Log */}
              <div>
                <div className="text-xs text-slate-400 mb-2 font-semibold">AI DECISION LOG</div>
                <div 
                  ref={logContainerRef}
                  className="bg-slate-900/50 h-32 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-y-auto border border-slate-700/30 scrollbar-thin"
                >
                  {autopilotLog.map((line, index) => (
                    <div key={index} className="mb-1 last:mb-0">
                      <span className="text-teal-400">{line.split("]")[0]}]</span>
                      <span className="text-slate-300 ml-1">{line.split("]")[1]}</span>
                    </div>
                  ))}
                  {isAutopilotOn && (
                    <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span>AI actively optimizing pricing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}