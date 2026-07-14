import React, { useState, useEffect } from 'react';
import { 
  INDIAN_STATIONS, INITIAL_PARCELS, INITIAL_REVIEWS, LATEST_POSTS, 
  Parcel, Station, Review, PARCEL_TYPES 
} from './data';
import { Map } from './components/Map';
import { BookingForm } from './components/BookingForm';
import { TrackingSection } from './components/TrackingSection';
import { AdminPanel } from './components/AdminPanel';
import { ReviewsAndFAQ } from './components/HeaderFooter';

import { 
  Train, MapPin, Search, Calendar, ShieldCheck, IndianRupee, HelpCircle, 
  Award, Clock, Phone, Mail, LogIn, LogOut, User, Lock, MessageSquare, 
  Send, Sun, Moon, Sparkles, Check, AlertCircle, ChevronRight, BarChart2,
  Truck, RefreshCw
} from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // App Routing tabs: 'home' | 'track' | 'book' | 'pricing' | 'reviews' | 'dashboard' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('home');

  // Central Inventory & review DB persisted in LocalStorage
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    const saved = localStorage.getItem('rpx_parcels');
    return saved ? JSON.parse(saved) : INITIAL_PARCELS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('rpx_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [posts] = useState(LATEST_POSTS);

  // Search/Tracker states
  const [activeParcel, setActiveParcel] = useState<Parcel | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(INDIAN_STATIONS[6]); // default Vijayawada

  // Standing Pricing Calculator state
  const [calcPickup, setCalcPickup] = useState('');
  const [calcDest, setCalcDest] = useState('');
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcType, setCalcType] = useState('general');

  // Booking Page Pre-fill state
  const [prefillPickup, setPrefillPickup] = useState('');
  const [prefillDest, setPrefillDest] = useState('');

  // Login & Authentication Simulation States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'customer' | 'admin'>('customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSentBanner, setOtpSentBanner] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<{ phone?: string; role: 'customer' | 'admin' } | null>(null);

  // Live Support Chat Box States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    { sender: 'bot', text: 'Namaste! Welcome to Railway Parcel Express Support. How can I help you today? You can ask me to track a parcel by sending a message like: "track RPX2026001234".', time: '9:00 AM' }
  ]);

  // Persist edits to LocalStorage
  useEffect(() => {
    localStorage.setItem('rpx_parcels', JSON.stringify(parcels));
  }, [parcels]);

  useEffect(() => {
    localStorage.setItem('rpx_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toast notification state for status transition simulation
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    message: string;
    trackingId: string;
    timestamp: string;
  } | null>(null);

  const showStatusChangeToast = (parcel: Parcel) => {
    const toastId = Math.random().toString(36).substring(2, 9);
    setActiveToast({
      id: toastId,
      title: '🚚 Cargo Out for Delivery!',
      message: `Consignment ${parcel.trackingId} (Route: ${parcel.pickupStation} ➔ ${parcel.destinationStation}) has changed status from 'In Transit' to 'Out for Delivery'!`,
      trackingId: parcel.trackingId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    });

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setActiveToast(prev => prev?.id === toastId ? null : prev);
    }, 8000);
  };

  // Callback to insert new booking
  const handleNewBooking = (newParcel: Parcel) => {
    setParcels(prev => [newParcel, ...prev]);
    // Set as active tracking immediately
    setActiveParcel(newParcel);
    setActiveTab('track');
  };

  const handleUpdateParcel = (updatedParcel: Parcel) => {
    const oldParcel = parcels.find(p => p.trackingId === updatedParcel.trackingId);
    if (oldParcel) {
      if (oldParcel.status === 'In Transit' && updatedParcel.status === 'Out For Delivery') {
        showStatusChangeToast(updatedParcel);
      }
    }
    setParcels(prev => prev.map(p => p.trackingId === updatedParcel.trackingId ? updatedParcel : p));
  };

  const handleSimulateOutForDelivery = (trackingId: string) => {
    const parcel = parcels.find(p => p.trackingId === trackingId);
    if (!parcel) return;

    const updatedHistory = parcel.history.map(step => {
      if (step.status === 'Out For Delivery') {
        return {
          ...step,
          completed: true,
          timestamp: `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
        };
      }
      return step;
    });

    const updatedParcel: Parcel = {
      ...parcel,
      status: 'Out For Delivery',
      currentLocation: `${parcel.destinationStation} Local Hub`,
      history: updatedHistory
    };

    handleUpdateParcel(updatedParcel);
  };

  const handleResetToInTransit = (trackingId: string) => {
    const parcel = parcels.find(p => p.trackingId === trackingId);
    if (!parcel) return;

    const updatedHistory = parcel.history.map(step => {
      if (step.status === 'Out For Delivery' || step.status === 'Delivered') {
        return {
          ...step,
          completed: false,
          timestamp: 'Awaiting arrival'
        };
      }
      return step;
    });

    const updatedParcel: Parcel = {
      ...parcel,
      status: 'In Transit',
      currentLocation: `${parcel.pickupStation} Outbound Yard`,
      history: updatedHistory
    };

    setParcels(prev => prev.map(p => p.trackingId === trackingId ? updatedParcel : p));
  };

  const handleAddReview = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
  };

  // Tracking query helper
  const queryParcel = (id: string) => {
    const found = parcels.find(p => p.trackingId.toLowerCase() === id.toLowerCase().trim());
    return found || null;
  };

  // Standing Calculator cost math
  const getCalcCost = () => {
    if (!calcPickup || !calcDest) return 0;
    const st1 = INDIAN_STATIONS.find(s => s.name === calcPickup);
    const st2 = INDIAN_STATIONS.find(s => s.name === calcDest);
    let distanceFactor = 100;
    if (st1 && st2) {
      const dx = st1.x - st2.x;
      const dy = st1.y - st2.y;
      distanceFactor = Math.max(100, Math.round(Math.sqrt(dx * dx + dy * dy) * 12));
    }
    const typeMultiplier = PARCEL_TYPES.find(p => p.value === calcType)?.multiplier || 1.0;
    const base = 120 * typeMultiplier;
    const weightCost = calcWeight * 12 * (distanceFactor / 200);
    const totalSub = base + weightCost;
    return Math.round(totalSub + (totalSub * 0.18)); // sub + GST
  };

  const calcEstimatedCost = getCalcCost();

  // Redirect to Book page with prefill
  const handleCalcBookNow = () => {
    setPrefillPickup(calcPickup);
    setPrefillDest(calcDest);
    setActiveTab('book');
  };

  // Simulated OTP logic
  const handleRequestOTP = () => {
    if (!customerPhone.trim() || customerPhone.length < 10) {
      return setLoginError('Please enter a valid 10-digit mobile number');
    }
    setLoginError('');
    setOtpSentBanner(true);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '1234') {
      return setLoginError('Invalid verification code. Enter "1234" to bypass authentication.');
    }
    setLoggedInUser({ phone: customerPhone, role: 'customer' });
    setIsLoginModalOpen(false);
    setOtpSentBanner(false);
    setCustomerPhone('');
    setOtpCode('');
    setActiveTab('dashboard');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === 'admin' && adminPass === 'admin') {
      setLoggedInUser({ role: 'admin' });
      setIsLoginModalOpen(false);
      setAdminUser('');
      setAdminPass('');
      setActiveTab('admin');
    } else {
      setLoginError('Invalid Username or Password. Use: admin / admin');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setActiveTab('home');
  };

  // Support Bot Live Reply simulation
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    setChatLogs(prev => [...prev, { sender: 'user', text: userMsg, time: now }]);
    setChatMessage('');

    // Trigger bot typing delay
    setTimeout(() => {
      let botText = "Thank you for contacting Railway Cargo Helpline. For urgent cargo status adjustments, please speak with an agent at the departure station desk.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('track') || lower.includes('rpx')) {
        // Extract possible ID
        const match = userMsg.match(/rpx\d+/i);
        if (match) {
          const matchedId = match[0].toUpperCase();
          const p = parcels.find(item => item.trackingId.toUpperCase() === matchedId);
          if (p) {
            botText = `Found cargo tracking ID ${p.trackingId}. Current status: ${p.status} at ${p.currentLocation}. Estimated delivery is scheduled for ${p.estimatedDelivery}.`;
          } else {
            botText = `Sorry, I couldn't find any registered cargo parcel matching ID "${matchedId}". Please double-check your receipt tracking reference.`;
          }
        } else {
          botText = "Please provide your full 13-digit Tracking ID (e.g. RPX2026001234) so I can query our central database records instantly.";
        }
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fare')) {
        botText = "Our base railway freight cargo rates start from ₹120. You can use our customized standalone 'Pricing Calculator' tab in the menu to simulate precise GST-included freight rates.";
      } else if (lower.includes('insurance') || lower.includes('shield')) {
        botText = "Secure-Shield cargo insurance provides 100% financial protection against natural disasters or collision hazards. It can be toggled on for a nominal premium of 5% of subtotal cargo cost during checkout.";
      } else if (lower.includes('pickup') || lower.includes('door')) {
        botText = "Yes, we support premium door-pickup and door-delivery options across all major Tier-1 hub cities in India. Simply specify your address details during the checkout phase.";
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        botText = "Hello! I am RailBot, your virtual parcel logistics coordinator. How may I assist you with tracking or booking today?";
      }

      setChatLogs(prev => [...prev, { sender: 'bot', text: botText, time: now }]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Upper Alerts Ribbon */}
      <div className="bg-blue-900 text-white py-1 px-4 text-center text-[10px] font-semibold tracking-wider uppercase flex justify-center items-center gap-2">
        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
        <span>National Railway Logistics Network - 99.4% On-Time Cargo SLA Commitment</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-orange-500 flex items-center justify-center text-white shadow-md transform transition-transform group-hover:scale-105">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-blue-900 dark:text-white leading-none">
                RAILWAY PARCEL <span className="text-orange-500">EXPRESS</span>
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Fast • Secure • Reliable logistics
              </p>
            </div>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {[
              { id: 'home', label: 'Home' },
              { id: 'track', label: 'Track Parcel' },
              { id: 'book', label: 'Book Parcel' },
              { id: 'pricing', label: 'Pricing Calculator' },
              { id: 'reviews', label: 'Customer Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'book') {
                    // Reset pre-fills when clicked directly
                    setPrefillPickup('');
                    setPrefillDest('');
                  }
                }}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {loggedInUser?.role === 'customer' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg font-bold text-emerald-600 dark:text-emerald-400 transition-all ${
                  activeTab === 'dashboard' ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                My Dashboard
              </button>
            )}

            {loggedInUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg font-bold text-amber-600 dark:text-amber-400 transition-all ${
                  activeTab === 'admin' ? 'bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Control Room
              </button>
            )}
          </nav>

          {/* Right Header Side: Auth & Theme */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors overflow-hidden"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="relative w-4 h-4">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
                    darkMode 
                      ? 'rotate-0 opacity-100 scale-100' 
                      : 'rotate-90 opacity-0 scale-50 pointer-events-none'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
                    !darkMode 
                      ? 'rotate-0 opacity-100 scale-100' 
                      : '-rotate-90 opacity-0 scale-50 pointer-events-none'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </span>
              </div>
            </button>

            {/* Login Status & CTA */}
            {loggedInUser ? (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border dark:border-slate-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-slate-700 dark:text-slate-200 uppercase truncate max-w-28 font-mono">
                  {loggedInUser.role === 'admin' ? 'Admin Control' : loggedInUser.phone || 'Customer'}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors font-bold text-xs"
                  title="Log Out Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginError('');
                  setIsLoginModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" /> Log In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Mobile Navigation Banner (Hidden on desktop) */}
        <div className="lg:hidden flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {[
            { id: 'home', label: 'Home' },
            { id: 'track', label: 'Track' },
            { id: 'book', label: 'Book' },
            { id: 'pricing', label: 'Calculator' },
            { id: 'reviews', label: 'Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center rounded-lg ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {loggedInUser?.role === 'customer' && (
            <button onClick={() => setActiveTab('dashboard')} className="flex-1 py-2 text-center text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-slate-50">Dashboard</button>
          )}
          {loggedInUser?.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className="flex-1 py-2 text-center text-amber-600 dark:text-amber-400 font-bold rounded-lg hover:bg-slate-50">Admin</button>
          )}
        </div>

        {/* Dynamic Tab Views */}

        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            
            {/* Hero Section Banner */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 sm:p-10 md:p-14 shadow-xl border border-slate-800">
              {/* Background Rail Theme Photo */}
              <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img 
                  src="/src/assets/images/rail_theme_banner_1783920958014.jpg" 
                  alt="Indian Railways Express Cargo Theme" 
                  className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-slate-900/70 to-blue-900/80"></div>
              </div>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> High-Velocity Rail Freight Cargo
                  </span>
                  <h2 id="hero-main-title" style={{ borderColor: '#1f1d1d' }} className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
                    Railway Parcel <span id="hero-main-title-highlight" className="text-orange-500">Express</span>
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Track your parcel in real-time, compute precise freight quotes, book express cargo loads online, and enjoy trusted railway logistics across our comprehensive national station hub network.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('book')}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                      Book Cargo Parcel Now <ChevronRight className="w-4 h-4" />
                    </button>
                    <a
                      href="#quick-cargo-map"
                      className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      Inspect Live Railway Map
                    </a>
                  </div>
                </div>

                {/* Quick Tracking Widget inside Hero */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                    <Search className="w-4.5 h-4.5 text-blue-600" />
                    Quick Cargo Tracking Search
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Enter your 13-character Tracking Number to inspect immediate transit coordinates.
                    </p>
                    <TrackingSection 
                      onSearch={queryParcel}
                      activeParcel={activeParcel}
                      setActiveParcel={setActiveParcel}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Dynamic Logistics Counters Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { count: '48,250+', label: 'Cargo Parcels Handled', detail: 'Safe delivery SLA logs' },
                { count: '120+', label: 'Stations Covered', detail: 'National hub terminals' },
                { count: '99.4%', label: 'On-Time Rail Velocity', detail: 'Express cargo SLA pledge' },
                { count: '14,500+', label: 'Happy Business Clients', detail: '5-star certified bookings' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-center space-y-1.5 transition-all hover:border-blue-500/30">
                  <h4 className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{stat.count}</h4>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{stat.detail}</p>
                </div>
              ))}
            </section>

            {/* Core Services Section */}
            <section className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider">Logistics Suite</span>
                <h3 className="text-xl font-bold">Comprehensive Railway Freight Services</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select premium station transit modes or secure local door-delivery structures matching your business.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Railway Parcel Booking', desc: 'Secure transit space in luggage vans of fast express rolling trains. Cost-effective regional freight cargo operations.' },
                  { title: 'Door Pickup & Station Delivery', desc: 'Premium multi-modal pickup from warehouse origin, direct transit to departure terminal, with safe cargo carriage.' },
                  { title: 'Warehouse Storage Options', desc: 'State-of-the-art secure storage lockers at station parcel depots for flexible storage up to 30 days.' },
                  { title: 'Express Freight Delivery', desc: 'Guaranteed space allocation on high priority regional mail express trains ensuring cargo clearance within 24 hours.' },
                  { title: 'Bulk Logistics & Business Shipping', desc: 'Customized contract cargo structures and full luggage van allocations for agricultural and heavy industrial equipment.' },
                  { title: 'Secure Shield Insurance', desc: '100% financial compensation protection cover policy safeguarding cargo consignments against unexpected transit hazards.' },
                ].map((serv, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 hover:border-orange-500/40 transition-all duration-300">
                    <h4 id={`service-title-${idx}`} className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-blue-600 rounded-xs"></span>
                      {serv.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {serv.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Choose Us & Map Grid */}
            <section id="quick-cargo-map" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              
              {/* Left Side Info: 5 Columns */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Regional Hub Explorer</span>
                  <h3 className="text-xl font-bold">Indian Railways Logistics Map</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Inspect active freight hubs and rail networks. Click on station nodes (e.g., HWH, NDLS, BCT, SBC) to inspect daily freight train schedules, regional parcel capacity, and transit availability.
                  </p>
                </div>

                {/* Benefits checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {[
                    { title: 'Real-Time Map Tracking', desc: 'Track train progress' },
                    { title: 'Secure Local Depots', desc: '24/7 CCTV surveillance' },
                    { title: 'Easy UPI Payments', desc: 'Secure booking clearance' },
                    { title: 'SMS Dispatch Alerts', desc: 'Immediate milestone updates' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{benefit.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Box */}
                <div className="bg-orange-50 dark:bg-orange-950/25 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-5 text-xs text-slate-700 dark:text-slate-300">
                  <h4 className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4.5 h-4.5 shrink-0" />
                    Special Heavy Freight Offers!
                  </h4>
                  <p className="font-normal leading-relaxed text-[11px]">
                    Shipping bulk industrial machinery or farm products above 100kg? Get automated <span className="font-bold">15% discount tariff</span> applied directly during payment.
                  </p>
                </div>
              </div>

              {/* Right Side Map: 7 Columns */}
              <div className="lg:col-span-7">
                <Map 
                  selectedStation={selectedStation}
                  onSelectStation={setSelectedStation}
                  activeParcel={activeParcel}
                  darkMode={darkMode}
                />
              </div>
            </section>

            {/* Testimonials, Feed and FAQs */}
            <ReviewsAndFAQ 
              reviews={reviews}
              onAddReview={handleAddReview}
              posts={posts}
            />
          </div>
        )}

        {/* 2. TRACK PARCEL VIEW */}
        {activeTab === 'track' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold">National Cargo Tracking Registry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check active train speeds, departure depot logs, and door dispatch milestones.
              </p>
            </div>

            <TrackingSection 
              onSearch={queryParcel}
              activeParcel={activeParcel}
              setActiveParcel={setActiveParcel}
            />

            {/* Render route trajectory map preview if tracked */}
            {activeParcel && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Visual Train Trajectory Preview
                </h4>
                <Map 
                  selectedStation={null}
                  onSelectStation={() => {}}
                  activeParcel={activeParcel}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>
        )}

        {/* 3. BOOK PARCEL VIEW */}
        {activeTab === 'book' && (
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold font-black">Online Cargo Booking Portal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register cargo specs, simulate secure payment authorizations, and download verified clearance receipts instantly.
              </p>
            </div>

            <BookingForm 
              onBookingSuccess={handleNewBooking}
              initialPickupStation={prefillPickup}
              initialDestinationStation={prefillDest}
            />
          </div>
        )}

        {/* 4. STANDALONE PRICING CALCULATOR */}
        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold">Logistics Freight Rate Estimator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate approximate weight-based train freight tariffs, logistics GST rates, and secure shield cargo insurances.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 shadow-xs">
              
              {/* Inputs: 7 Columns */}
              <div className="md:col-span-7 space-y-5 text-xs">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  1. Freight Parameters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Origin Departure Station</label>
                    <select
                      value={calcPickup}
                      onChange={(e) => setCalcPickup(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                    >
                      <option value="">Select Origin Station</option>
                      {INDIAN_STATIONS.map(st => (
                        <option key={st.id} value={st.name}>{st.name} ({st.code})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Destination Arrival Station</label>
                    <select
                      value={calcDest}
                      onChange={(e) => setCalcDest(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                    >
                      <option value="">Select Destination</option>
                      {INDIAN_STATIONS.map(st => (
                        <option key={st.id} value={st.name}>{st.name} ({st.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Cargo Weight load (kg)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="1000"
                      value={calcWeight || ''}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Cargo Type Class</label>
                    <select
                      value={calcType}
                      onChange={(e) => setCalcType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                    >
                      {PARCEL_TYPES.map(pt => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Estimate Output Panel: 5 Columns */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between text-xs gap-6">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-4">
                    Freight Estimate Summary
                  </h4>
                  
                  {calcPickup && calcDest ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Origin Node:</span>
                        <span className="font-semibold">{calcPickup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destination Node:</span>
                        <span className="font-semibold">{calcDest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Weight Cargo:</span>
                        <span className="font-semibold">{calcWeight} kg</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-sm">
                        <span className="font-bold">Total (incl. GST 18%):</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 shrink-0" /> {calcEstimatedCost}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic py-6 text-center">
                      Select origin and destination stations to generate dynamic logistics estimates.
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCalcBookNow}
                  disabled={!calcPickup || !calcDest}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  Book This Cargo Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. CUSTOMER REVIEWS VIEW */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold">Verified Customer Testimonials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Read direct logs shared by business owners and local cargo managers across the station network.
              </p>
            </div>

            <ReviewsAndFAQ 
              reviews={reviews}
              onAddReview={handleAddReview}
              posts={posts}
            />
          </div>
        )}

        {/* 6. CUSTOMER DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto text-xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5.5 h-5.5 text-blue-600" />
                My Cargo Booking Portfolio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                View your active booking list, download transport receipts, and trace live locations.
              </p>
            </div>

            {/* Simulation Guide Card */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4.5 flex items-start gap-3 shadow-xs">
              <div className="p-2 bg-orange-500/15 text-orange-500 dark:text-orange-400 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  Real-time Status Toast Simulation Console
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  To test the status transition notification, locate the parcel with status <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded font-bold font-mono">In Transit</span> below and click the <strong className="text-orange-500 font-bold">Simulate 'Out for Delivery'</strong> action button. A gorgeous floating notification toast will appear at the top-right! You can reset it back to transit afterward to test as many times as you like.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                Registered Consignment Inventory
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {parcels.map((parcel) => (
                  <div key={parcel.trackingId} className="p-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {parcel.trackingId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          parcel.status === 'Delivered' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {parcel.status}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Route: <span className="font-semibold text-slate-700 dark:text-slate-300">{parcel.pickupStation}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{parcel.destinationStation}</span> | Weight: {parcel.weight}kg
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      {parcel.status === 'In Transit' && (
                        <button
                          onClick={() => handleSimulateOutForDelivery(parcel.trackingId)}
                          className="flex-1 sm:flex-none py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 shadow-xs"
                          title="Simulate transition from 'In Transit' to 'Out For Delivery' and trigger toast notification"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Simulate 'Out for Delivery'
                        </button>
                      )}

                      {parcel.status === 'Out For Delivery' && (
                        <button
                          onClick={() => handleResetToInTransit(parcel.trackingId)}
                          className="flex-1 sm:flex-none py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1"
                          title="Reset status back to In Transit to test again"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reset to 'In Transit'
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveParcel(parcel);
                          setActiveTab('track');
                        }}
                        className="flex-1 sm:flex-none py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 font-bold rounded-lg transition-all text-center"
                      >
                        Track Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. ADMIN BOARD VIEW */}
        {activeTab === 'admin' && (
          <div className="max-w-6xl mx-auto">
            {loggedInUser?.role === 'admin' ? (
              <AdminPanel 
                parcels={parcels}
                onUpdateParcel={handleUpdateParcel}
                stations={INDIAN_STATIONS}
              />
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto space-y-4">
                <Lock className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold">Dispatcher Room Locked</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-6">
                  Please log in as an administrator to access layout settings, pricing metrics, and real-time status transitions.
                </p>
                <button
                  onClick={() => {
                    setLoginRole('admin');
                    setAdminUser('admin');
                    setAdminPass('admin');
                    setIsLoginModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs"
                >
                  Log In As Admin
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-12 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand/About: 5 Columns */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Train className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold uppercase tracking-tight text-sm">
                Railway Parcel Express
              </h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 pr-4 leading-relaxed font-normal text-[11px]">
              Independent safe transit service executing high-priority national cargo transport contracts. All logistics rules strictly comply with central safety policies.
            </p>
            <div className="space-y-1.5 font-normal text-[11px]">
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Helpline: +91 98765 43210 (Mon-Sat 9:00 AM - 6:00 PM)</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" /> support@railparcel.gov.in (Official cargo inquiries)</p>
            </div>
          </div>

          {/* Quick links: 3 Columns */}
          <div className="md:col-span-3 space-y-3 font-normal">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
              Platform Links
            </h4>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <a href="#" onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home Landing</a>
              <a href="#" onClick={() => setActiveTab('track')} className="hover:text-white transition-colors">Track Consignment</a>
              <a href="#" onClick={() => setActiveTab('book')} className="hover:text-white transition-colors">Book Parcel Space</a>
              <a href="#" onClick={() => setActiveTab('pricing')} className="hover:text-white transition-colors">Freight Calculator</a>
              <a href="#" onClick={() => setActiveTab('reviews')} className="hover:text-white transition-colors">Reviews & Testimonials</a>
            </div>
          </div>

          {/* Guidelines: 4 Columns */}
          <div className="md:col-span-4 space-y-3 font-normal">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
              Policies & Compliance
            </h4>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <a href="#" className="hover:text-white transition-colors">Terms of Carriage Agreement</a>
              <a href="#" className="hover:text-white transition-colors">Secure Shield Insurance Policy</a>
              <a href="#" className="hover:text-white transition-colors">Refund & Cancellation Rules</a>
              <a href="#" className="hover:text-white transition-colors">Careers & Logistics Recruitment</a>
              <a href="#" className="hover:text-white transition-colors">Help Center / Station Offices</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-6 mt-8 flex flex-col sm:flex-row justify-between text-[11px] text-slate-600 dark:text-slate-500 gap-4">
          <p>© 2026 Railway Parcel Express. All rights reserved. Government Authorized Logistics partner.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Shield</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Safety Bylaws</a>
          </div>
        </div>
      </footer>

      {/* Floating Live Chat Support Box */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-all cursor-pointer relative"
          >
            <MessageSquare className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </button>
        ) : (
          <div className="w-80 h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs animate-fade-in transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <h4 className="font-bold">RailBot Logistics Support</h4>
                  <p className="text-[9px] text-blue-200">Online | AI Ground Agent</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-orange-400 font-bold px-1 text-sm"
              >
                ×
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950 font-normal">
              {chatLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col max-w-[80%] ${log.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className={`p-2.5 rounded-2xl ${
                    log.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-300 rounded-bl-none'
                  }`}>
                    {log.text}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-0.5 font-mono">{log.time}</span>
                </div>
              ))}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendChatMessage} className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
              <input 
                type="text" 
                placeholder="Type 'track RPX...' or ask a question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Login Authentication Dialog Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-xs">
            
            {/* Header tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0 font-bold bg-slate-50 dark:bg-slate-950/60">
              <button
                onClick={() => {
                  setLoginRole('customer');
                  setLoginError('');
                }}
                className={`flex-1 py-3 text-center ${
                  loginRole === 'customer' 
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-slate-900' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Customer Portal
              </button>
              <button
                onClick={() => {
                  setLoginRole('admin');
                  setLoginError('');
                }}
                className={`flex-1 py-3 text-center ${
                  loginRole === 'admin' 
                    ? 'border-b-2 border-amber-600 text-amber-600 bg-white dark:bg-slate-900' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Dispatcher Portal
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start pb-2">
                <div>
                  <h3 className="text-sm font-bold">
                    {loginRole === 'admin' ? 'Central Hub Credentials' : 'Secure Login With SMS'}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {loginRole === 'admin' ? 'Verify system operator clearance levels' : 'Zero password required. Use OTP verification.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsLoginModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold px-1"
                >
                  ×
                </button>
              </div>

              {loginError && (
                <div className="flex items-center gap-1.5 p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[11px] rounded-lg border border-red-100 dark:border-red-900/10">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form Render based on role selection */}
              {loginRole === 'customer' ? (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  
                  {!otpSentBanner ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-500">Your Mobile Number (+91)</label>
                        <input 
                          type="tel"
                          placeholder="e.g., 9876543210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1"
                      >
                        Request Transit OTP <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg border text-[10px] leading-relaxed">
                        ✓ SMS bypass triggered: Enter verification code <span className="font-bold">"1234"</span> to authorize login safely.
                      </div>
                      
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-500">Enter Verification Code</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          placeholder="Type '1234'"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOtpSentBanner(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg"
                        >
                          Change Number
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
                        >
                          Verify & Log In
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-3.5">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg border text-[10px] leading-relaxed">
                    ✓ Use Operator Clearance: Username: <span className="font-bold">"admin"</span> | Password: <span className="font-bold">"admin"</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500">Operator Username</label>
                    <input 
                      type="text" 
                      placeholder="Type 'admin'"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500">Security Password</label>
                    <input 
                      type="password" 
                      placeholder="Type 'admin'"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Authorize Operator Clearance
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Toast Notification */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-orange-500 rounded-2xl shadow-2xl p-4.5 animate-slide-in text-xs space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg animate-bounce shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {activeToast.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Triggered at {activeToast.timestamp}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {activeToast.message}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                const found = queryParcel(activeToast.trackingId);
                if (found) {
                  setActiveParcel(found);
                  setActiveTab('track');
                  setActiveToast(null);
                }
              }}
              className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-center"
            >
              Track Status
            </button>
            <button
              onClick={() => setActiveToast(null)}
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all text-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
