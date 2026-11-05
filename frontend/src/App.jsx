import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SeatMapModal from './components/SeatMapModal';
import CheckInModal from './components/CheckInModal';
import AdminDashboard from './components/AdminDashboard';
import MyBookings from './components/MyBookings';
import Wishlist from './components/Wishlist';
import CreateEventModal from './components/CreateEventModal';
import ProfileDashboard from './components/ProfileDashboard';
import TermsModal from './components/TermsModal';
import PrivacyModal from './components/PrivacyModal';
import SystemStatusModal from './components/SystemStatusModal';
import DatabaseConsoleModal from './components/DatabaseConsoleModal';
import CookiesModal from './components/CookiesModal';
import ApiDocsModal from './components/ApiDocsModal';

import { Heart, Bell, AlertCircle, Check } from 'lucide-react';
import { apiFetch, getStoredUser, clearAuthSession } from './services/api';
import { formatPrice, subscribeCurrencyChange } from './services/currency';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['home', 'explore', 'admin', 'my-bookings', 'wishlist', 'profile', 'login', 'register'];
    if (hash && validTabs.includes(hash)) return hash;
    const saved = localStorage.getItem('active_nav_tab');
    if (saved && validTabs.includes(saved)) return saved;
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    const validTabs = ['home', 'explore', 'admin', 'my-bookings', 'wishlist', 'profile', 'login', 'register'];
    const target = validTabs.includes(tab) ? tab : 'home';
    setActiveTabState(target);
    localStorage.setItem('active_nav_tab', target);
    window.location.hash = target;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'explore', 'admin', 'my-bookings', 'wishlist', 'profile', 'login', 'register'];
      if (hash && validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [, setCurrencyState] = useState(Date.now());

  useEffect(() => {
    return subscribeCurrencyChange(() => setCurrencyState(Date.now()));
  }, []);

  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
  const [isDatabaseConsoleOpen, setIsDatabaseConsoleOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);
  const [allMasterEvents, setAllMasterEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    city: '',
    keyword: '',
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: '',
    sort: ''
  });

  const filtersRef = useRef(filters);
  const allMasterEventsRef = useRef([]);
  const catalogRef = useRef(null);

  const scrollToResults = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);

    fetchCatalogData();

    const interval = setInterval(() => {
      fetchCatalogData(true);
    }, 5000);

    window.addEventListener('auth-expired', handleLogout);
    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-expired', handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchCatalogData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [allEv, popEv] = await Promise.all([
        apiFetch('/events?size=50').catch(() => null),
        apiFetch('/events/popular?limit=4').catch(() => null)
      ]);

      let freshList = [];
      if (allEv && Array.isArray(allEv.content) && allEv.content.length > 0) {
        freshList = allEv.content;
      } else {
        freshList = mockEvents;
      }

      setAllMasterEvents(freshList);
      allMasterEventsRef.current = freshList;

      const currentFilters = filtersRef.current;
      if (hasActiveFilters(currentFilters) || currentFilters.sort) {
        applyLiveFilter(currentFilters, freshList);
      } else {
        setEvents(freshList);
      }

      if (popEv && Array.isArray(popEv) && popEv.length > 0) setPopularEvents(popEv);
      else setPopularEvents(mockEvents.slice(0, 3));

    } catch {
      setAllMasterEvents(mockEvents);
      allMasterEventsRef.current = mockEvents;
      setEvents(mockEvents);
      setPopularEvents(mockEvents.slice(0, 3));
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const hasActiveFilters = (criteria) => Object.values(criteria).some((value) => value !== '');

  const sortEvents = (list, sort = filters.sort) => {
    if (!sort) return list;
    const [field, direction] = sort.split(',');
    const multiplier = direction === 'desc' ? -1 : 1;
    return [...list].sort((left, right) => {
      const leftValue = left[field];
      const rightValue = right[field];
      if (leftValue == null && rightValue == null) return 0;
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;
      const comparison = field === 'ticketPrice'
        ? Number(leftValue) - Number(rightValue)
        : String(leftValue).localeCompare(String(rightValue));
      return comparison * multiplier;
    });
  };

  const applyLiveFilter = (criteria = filters, sourceList = null) => {
    const masterSource = sourceList || (allMasterEventsRef.current.length > 0 ? allMasterEventsRef.current : (allMasterEvents.length > 0 ? allMasterEvents : mockEvents));
    let list = [...masterSource];

    if (criteria.category) {
      list = list.filter((e) => e.category === criteria.category);
    }
    if (criteria.city && criteria.city.trim()) {
      const ctLower = criteria.city.trim().toLowerCase();
      list = list.filter((e) => e.venueAddress && e.venueAddress.toLowerCase().includes(ctLower));
    }

    if (criteria.keyword && criteria.keyword.trim()) {
      const tokens = criteria.keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter((e) => {
        const searchableText = [
          e.name,
          e.description,
          e.category,
          e.venueName,
          e.venueAddress,
          e.currency
        ].filter(Boolean).join(' ').toLowerCase();

        return tokens.some((token) => searchableText.includes(token));
      });
    }

    if (criteria.dateFrom) list = list.filter((e) => e.eventDate >= criteria.dateFrom);
    if (criteria.dateTo) list = list.filter((e) => e.eventDate <= criteria.dateTo);
    if (criteria.minPrice !== '') list = list.filter((e) => Number(e.ticketPrice) >= Number(criteria.minPrice));
    if (criteria.maxPrice !== '') list = list.filter((e) => Number(e.ticketPrice) <= Number(criteria.maxPrice));

    setEvents(sortEvents(list, criteria.sort));
  };

  const handleSearchAndFilter = async (criteria = filters) => {
    setLoading(true);
    try {
      let query = '/events/search?';
      if (criteria.category) query += `category=${encodeURIComponent(criteria.category)}&`;
      if (criteria.city) query += `city=${encodeURIComponent(criteria.city)}&`;
      if (criteria.keyword) query += `keyword=${encodeURIComponent(criteria.keyword)}&`;
      if (criteria.dateFrom) query += `dateFrom=${encodeURIComponent(criteria.dateFrom)}&`;
      if (criteria.dateTo) query += `dateTo=${encodeURIComponent(criteria.dateTo)}&`;
      if (criteria.minPrice !== '') query += `minPrice=${encodeURIComponent(criteria.minPrice)}&`;
      if (criteria.maxPrice !== '') query += `maxPrice=${encodeURIComponent(criteria.maxPrice)}&`;
      if (criteria.sort) query += `sort=${encodeURIComponent(criteria.sort)}&`;

      const res = await apiFetch(query);
      if (res && Array.isArray(res.content)) {
        setEvents(sortEvents(res.content, criteria.sort));
      } else {
        applyLiveFilter(criteria);
      }
      if (hasActiveFilters(criteria)) {
        scrollToResults();
      }
    } catch {
      applyLiveFilter(criteria);
      scrollToResults();
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    const clearedFilters = { category: '', dateFrom: '', dateTo: '', city: '', keyword: '', minPrice: '', maxPrice: '', sort: '' };
    filtersRef.current = clearedFilters;
    setFilters(clearedFilters);
    setEvents(allMasterEventsRef.current.length > 0 ? allMasterEventsRef.current : mockEvents);
    fetchCatalogData();
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setActiveTab('home');
    showToast('Signed out of session', 'info');
  };

  const handleToggleWishlist = async (eventId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      handleNavigate('login');
      return;
    }
    try {
      await apiFetch(`/wishlist/${eventId}`, { method: 'POST' });
      showToast('Event saved to your wishlist', 'success');
    } catch {
      showToast('Event is already in your wishlist', 'info');
    }
  };

  const handleJoinWaitlist = async (eventId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      handleNavigate('login');
      return;
    }
    try {
      await apiFetch(`/waitlist/${eventId}`, { method: 'POST' });
      showToast('Enrolled in waitlist. You will receive an email if a seat opens.', 'success');
    } catch (err) {
      showToast(err.message || 'Already enrolled on waitlist for this event', 'info');
    }
  };

  const openBookingModal = (event) => {
    const targetEvent = event || popularEvents[0] || events[0];
    if (!targetEvent) {
      showToast('No event selected', 'info');
      return;
    }
    if (!currentUser) {
      handleNavigate('login');
      showToast('Please sign in to select seats and book tickets', 'info');
      return;
    }
    setSelectedEvent(targetEvent);
    setIsSeatMapOpen(true);
  };

  const handleDeleteEvent = async (eventId, eventName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove event "${eventName || 'this event'}"?`)) return;

    setEvents((prev) => prev.filter((item) => item.id !== eventId));
    setPopularEvents((prev) => prev.filter((item) => item.id !== eventId));

    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      showToast('Event removed successfully', 'success');
      fetchCatalogData(true);
    } catch (err) {
      showToast(err.message || 'Failed to remove event', 'error');
      fetchCatalogData(true);
    }
  };

  const handleNavigate = (tab, params = {}) => {
    if (currentUser && currentUser.role === 'ORGANIZER' && (tab === 'my-bookings' || tab === 'wishlist')) {
      showToast('Organizers do not have customer booking pages.', 'info');
      tab = 'home';
    }
    const finalTab = (tab === 'events' || tab === 'explore') ? 'home' : tab;
    setActiveTabState(finalTab);
    localStorage.setItem('active_nav_tab', finalTab);
    window.location.hash = finalTab;

    if (params.keyword !== undefined) {
      const nextFilters = { ...filtersRef.current, keyword: params.keyword };
      setFilters(nextFilters);
      handleSearchAndFilter(nextFilters);
    }
    if (tab === 'checkin') setIsCheckInOpen(true);
    if (tab === 'create-event') setIsCreateEventOpen(true);

    if (tab === 'events' || tab === 'explore' || tab === 'all-events') {
      setTimeout(() => {
        scrollToResults();
      }, 100);
    }
  };

  if (activeTab === 'login') {
    return (
      <div>
        <LoginPage
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setActiveTab('home');
          }}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.type === 'success' && <Check size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Bell size={16} />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'register') {
    return (
      <div>
        <RegisterPage
          onNavigate={handleNavigate}
          showToast={showToast}
        />
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.type === 'success' && <Check size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Bell size={16} />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar 
        currentUser={currentUser}
        onNavigate={handleNavigate}
        activeTab={activeTab}
        onOpenAuthModal={() => handleNavigate('login')}
        onLogout={handleLogout}
        searchKeyword={filters.keyword}
        onSearchChange={(kw) => {
          const nextFilters = { ...filtersRef.current, keyword: kw };
          setFilters(nextFilters);
          applyLiveFilter(nextFilters);
        }}
      />

      {/* Top Protocol Status Ribbon */}
      <div className="w-full bg-asphalt-surface border-b border-asphalt-border py-2 px-4">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between text-xs font-ticker gap-2">
          <div className="flex items-center gap-2 text-grit-dim">
            <span className="bg-neon-magenta text-grit-white font-bold px-1.5 py-0.2 -rotate-2">LIVE PLATFORM</span>
            <span className="text-grit-white font-mono-zine">REAL-TIME STOMP SEAT CONCURRENCY // DISTRIBUTED EVENT TICKETING PLATFORM</span>
          </div>
          <div className="flex items-center gap-3 text-grit-dim">
            <span className="text-acid-yellow">⚡ 10-MIN SEAT LOCK GUARANTEE</span>
            <span>|</span>
            <span className="text-grit-white">99.98% CLUSTER UPTIME</span>
          </div>
        </div>
      </div>

      {activeTab === 'admin' ? (
        <AdminDashboard showToast={showToast} />
      ) : activeTab === 'profile' ? (
        <ProfileDashboard 
          currentUser={currentUser} 
          onNavigate={handleNavigate} 
          showToast={showToast}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onLogout={handleLogout}
        />
      ) : activeTab === 'my-bookings' ? (
        <MyBookings currentUser={currentUser} showToast={showToast} />
      ) : activeTab === 'wishlist' ? (
        <Wishlist currentUser={currentUser} onSelectEvent={openBookingModal} showToast={showToast} />
      ) : (
        <main className="w-full relative overflow-hidden pb-16">
          <div className="max-w-[1360px] mx-auto px-4 md:px-6 pt-8">
            
            {/* 2. BRUTALIST HERO SECTION */}
            <section className="relative mb-12 border-4 border-grit-white bg-asphalt-surface p-6 md:p-10 shadow-[8px_8px_0px_#eefc54]">
              {/* Slanted Badges */}
              <div className="absolute -top-5 -right-4 bg-neon-magenta text-grit-white font-display text-xl sm:text-2xl px-4 py-1.5 rotate-3 border-2 border-asphalt-black shadow-[4px_4px_0px_#0e0e11] z-20">
                ★ 100% VERIFIED TICKETS & PASSES ★
              </div>
              <div className="absolute -bottom-4 -left-3 bg-electric-cobalt text-acid-yellow font-ticker text-xs font-black px-3 py-1 -rotate-3 border-2 border-grit-white z-20">
                ZERO SECONDARY SCALPING // STOMP LOCKS
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 bg-asphalt-black border-2 border-acid-yellow px-3 py-1 stamp-slant-1">
                    <span className="w-2.5 h-2.5 bg-acid-yellow animate-pulse" />
                    <span className="font-ticker text-xs font-bold uppercase text-acid-yellow tracking-widest">
                      EVENT TICKETING & SEAT RESERVATION PLATFORM
                    </span>
                  </div>

                  <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tight text-grit-white leading-[0.9]">
                    LIVE EVENT <span className="text-acid-yellow underline decoration-neon-magenta decoration-4">TICKETING</span><br/>
                    & SEAT RESERVATIONS.
                  </h1>

                  <p className="font-mono-zine text-sm sm:text-base text-grit-dim max-w-2xl leading-relaxed">
                    RESERVE VERIFIED SEATS IN REAL TIME. INSTANT DIGITAL PASSES, DYNAMIC CURRENCY CONVERSION, TAMPER-PROOF QR CODE VALIDATION, AND ZERO DOUBLE BOOKINGS ACROSS CONCERTS, CONFERENCES, THEATER, AND SPORTS.
                  </p>

                  {/* Telemetry Badges / Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="bg-asphalt-black p-2 border-2 border-asphalt-border">
                      <span className="text-[10px] text-grit-dim block font-ticker uppercase">REST API ENGINE</span>
                      <span className="font-display text-xl text-acid-yellow">SPRING BOOT 3.4</span>
                    </div>
                    <div className="bg-asphalt-black p-2 border-2 border-asphalt-border">
                      <span className="text-[10px] text-grit-dim block font-ticker uppercase">SEAT CONCURRENCY</span>
                      <span className="font-display text-xl text-neon-magenta">10-MIN MUTEX</span>
                    </div>
                    <div className="bg-asphalt-black p-2 border-2 border-asphalt-border">
                      <span className="text-[10px] text-grit-dim block font-ticker uppercase">DATABASE CLUSTER</span>
                      <span className="font-display text-xl text-electric-cobalt">POSTGRESQL TLS</span>
                    </div>
                    <div className="bg-asphalt-black p-2 border-2 border-asphalt-border">
                      <span className="text-[10px] text-grit-dim block font-ticker uppercase">ADMISSION PASS</span>
                      <span className="font-display text-xl text-grit-white">QR + PDF PASS</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Digital Ticket Pass Graphic */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs bg-asphalt-black border-4 border-grit-white p-4 shadow-[6px_6px_0px_#ff1f6d] rotate-1 group hover:rotate-0 transition-transform">
                    {/* Pass Header */}
                    <div className="bg-acid-yellow text-asphalt-black p-1.5 text-center font-display text-xl tracking-wider border-2 border-asphalt-black mb-3">
                      DIGITAL ADMISSION PASS
                    </div>
                    {/* Pass Reels graphic */}
                    <div className="bg-asphalt-card border-2 border-asphalt-border rounded p-3 mb-3 flex items-center justify-around">
                      <div className="w-12 h-12 rounded-full border-4 border-grit-white bg-asphalt-black flex items-center justify-center animate-spin" style={{ animationDuration: '9s' }}>
                        <div className="w-3 h-3 bg-neon-magenta rounded-full" />
                      </div>
                      <div className="h-6 w-24 bg-asphalt-surface border border-asphalt-border flex items-center justify-center text-[10px] font-ticker text-acid-yellow font-bold">
                        ROW A: SEAT 05
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-grit-white bg-asphalt-black flex items-center justify-center animate-spin" style={{ animationDuration: '9s' }}>
                        <div className="w-3 h-3 bg-neon-magenta rounded-full" />
                      </div>
                    </div>
                    {/* Pass Info */}
                    <div className="text-[11px] font-ticker space-y-1 text-grit-dim">
                      <div className="flex justify-between">
                        <span>PASS_ID:</span>
                        <span className="text-grit-white font-bold">#EHB-PASS-2026-90</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ADMISSION:</span>
                        <span className="text-neon-magenta font-bold">VIP STAGE ACCESS</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VALIDATION:</span>
                        <span className="text-acid-yellow font-bold">CRYPTOGRAPHIC QR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. EVENT SEARCH & DISPATCH CAPSULE */}
            <section className="mb-14">
              <div className="bg-acid-yellow p-3 sm:p-4 border-4 border-asphalt-black shadow-[6px_6px_0px_#ffffff]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-asphalt-black font-ticker text-xs font-bold text-asphalt-black">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">search</span>
                    SEARCH EVENTS & VENUES // LIVE INVENTORY DISPATCH
                  </span>
                  <span className="bg-asphalt-black text-acid-yellow px-2 py-0.5">FILTER_ENGINE_V4</span>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSearchAndFilter(); }} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-asphalt-black">
                  {/* Keyword */}
                  <div className="bg-grit-white border-2 border-asphalt-black p-2 flex flex-col justify-between">
                    <label className="font-ticker text-[10px] uppercase font-bold text-asphalt-black/80">EVENT / ARTIST / KEYWORD</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cyber Music, Tech Summit, Symphony..." 
                      value={filters.keyword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilters({ ...filters, keyword: val });
                        applyLiveFilter({ ...filters, keyword: val });
                      }}
                      className="bg-transparent font-impact text-lg text-asphalt-black placeholder:text-asphalt-black/50 focus:outline-none w-full border-none p-0" 
                    />
                  </div>

                  {/* Category */}
                  <div className="bg-grit-white border-2 border-asphalt-black p-2 flex flex-col justify-between">
                    <label className="font-ticker text-[10px] uppercase font-bold text-asphalt-black/80">EVENT CATEGORY</label>
                    <select 
                      value={filters.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const nextFilters = { ...filters, category: cat };
                        setFilters(nextFilters);
                        handleSearchAndFilter(nextFilters);
                      }}
                      className="bg-transparent font-impact text-lg text-asphalt-black focus:outline-none w-full cursor-pointer appearance-none border-none p-0"
                    >
                      <option value="">ALL CATEGORIES (ALL EVENTS)</option>
                      <option value="MUSIC">MUSIC CONCERTS & FESTIVALS</option>
                      <option value="TECH">TECH & AI CONFERENCES</option>
                      <option value="THEATER">THEATER & PERFORMING ARTS</option>
                      <option value="SPORTS">SPORTS & TOURNAMENTS</option>
                      <option value="WORKSHOP">HANDS-ON WORKSHOPS</option>
                    </select>
                  </div>

                  {/* City / Location */}
                  <div className="bg-grit-white border-2 border-asphalt-black p-2 flex flex-col justify-between">
                    <label className="font-ticker text-[10px] uppercase font-bold text-asphalt-black/80">CITY / VENUE LOCATION</label>
                    <input 
                      type="text" 
                      placeholder="e.g. San Francisco, New York, London..." 
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="bg-transparent font-impact text-lg text-asphalt-black placeholder:text-asphalt-black/50 focus:outline-none w-full border-none p-0" 
                    />
                  </div>

                  {/* Submit Trigger */}
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-neon-magenta hover:bg-neon-magenta-dark text-grit-white border-2 border-asphalt-black p-2 flex items-center justify-center gap-2 font-display text-2xl tracking-wider uppercase transition-colors shadow-[3px_3px_0px_#0e0e11] cursor-pointer"
                    >
                      <span>SEARCH EVENTS</span>
                      <span className="material-symbols-outlined font-bold">search</span>
                    </button>
                    {hasActiveFilters(filters) && (
                      <button 
                        type="button"
                        onClick={handleClearSearch}
                        className="bg-asphalt-black text-acid-yellow border-2 border-asphalt-black px-3 font-display text-xl uppercase cursor-pointer"
                        title="Clear filters"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </section>

            {/* 4. GIG FLYER CARDS: TILTED BADGES, STICKERS, DENSE BARCODES, OVERLAPPING TEAR STUBS */}
            <section className="mb-16" id="lineup-section" ref={catalogRef}>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between pb-4 mb-6 border-b-4 border-grit-white gap-4">
                <div>
                  <div className="font-ticker text-xs font-bold text-neon-magenta uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-neon-magenta animate-pulse" />
                    LIVE EVENT CATALOG
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-grit-white">
                    UPCOMING EVENTS & TICKETS
                  </h2>
                </div>
                <div className="flex items-center gap-2 font-ticker text-xs">
                  <span className="bg-acid-yellow text-asphalt-black font-bold px-2 py-1 -rotate-2">INVENTORY LIVE</span>
                  <span className="bg-electric-cobalt text-grit-white font-bold px-2 py-1 rotate-1">{events.length} EVENTS AVAILABLE</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton-event-card p-4 space-y-3">
                      <div className="skeleton-box h-48 w-full" />
                      <div className="skeleton-box h-6 w-3/4" />
                      <div className="skeleton-box h-4 w-1/2" />
                      <div className="skeleton-box h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="bg-asphalt-card border-3 border-grit-white p-12 text-center shadow-[6px_6px_0px_#ff1f6d]">
                  <h3 className="font-display text-3xl text-acid-yellow mb-2">NO EVENTS DISCOVERED</h3>
                  <p className="font-mono-zine text-sm text-grit-dim mb-4">No live events match your search and filter criteria.</p>
                  <button onClick={handleClearSearch} className="btn btn-primary">RESET SEARCH</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {events.map((event, idx) => (
                    <EventCard 
                      key={event.id}
                      event={event}
                      index={idx}
                      currentUser={currentUser}
                      onBook={() => openBookingModal(event)}
                      onWishlist={(e) => handleToggleWishlist(event.id, e)}
                      onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
                      onDelete={(e) => handleDeleteEvent(event.id, event.name, e)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 5. INTERACTIVE CONCURRENCY CONSOLE */}
            <section className="mb-16 border-4 border-grit-white bg-asphalt-surface p-6 md:p-8 shadow-[8px_8px_0px_#ff1f6d]" id="sound-engine">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Rig Telemetry Manifesto */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-block bg-neon-magenta text-grit-white font-display text-sm tracking-widest px-2 py-0.5 -rotate-2">
                    CONCURRENCY_ENGINE // STOMP WEBSOCKET
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-grit-white leading-none">
                    INTERACTIVE SEAT MAP & LOCK SYSTEM
                  </h2>
                  <p className="font-mono-zine text-xs sm:text-sm text-grit-dim leading-relaxed">
                    ZERO DOUBLE BOOKINGS. WHEN YOU SELECT A SEAT TILE, OUR BACKEND IMMEDIATELY SENDS A SUB-15MS STOMP WEBSOCKET BURST AND LOCKS THE SEAT FOR 10 MINUTES TO PREVENT CONFLICTS WHILE YOU COMPLETE CHECKOUT.
                  </p>
                  <div className="space-y-2 font-ticker text-xs">
                    <div className="bg-asphalt-black border-2 border-asphalt-border p-2.5 flex items-center justify-between">
                      <span className="text-grit-dim">SOCKET PROTOCOL:</span>
                      <span className="text-acid-yellow font-bold">RFC-7118 / STOMP v1.2</span>
                    </div>
                    <div className="bg-asphalt-black border-2 border-asphalt-border p-2.5 flex items-center justify-between">
                      <span className="text-grit-dim">SEAT MUTEX TIMEOUT:</span>
                      <span className="text-grit-white font-bold">10-MINUTE HOLD WINDOW</span>
                    </div>
                    <div className="bg-asphalt-black border-2 border-asphalt-border p-2.5 flex items-center justify-between">
                      <span className="text-grit-dim">CONCURRENCY STAMP:</span>
                      <span className="text-neon-magenta font-bold">@Version ISOLATED LOCK</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2 font-ticker text-xs text-acid-yellow">
                    <span className="w-2 h-2 rounded-full bg-acid-yellow animate-ping" />
                    LIVE INVENTORY SYNC: REAL-TIME WEBSOCKET ACTIVE
                  </div>
                </div>

                {/* Interactive Pit / Floor Grid */}
                <div className="lg:col-span-7 bg-asphalt-black p-4 sm:p-6 border-3 border-grit-white shadow-[6px_6px_0px_#eefc54]">
                  <HeroProductDemo onOpenBooking={() => openBookingModal(popularEvents[0] || events[0])} />
                </div>
              </div>
            </section>

            {/* 6. PLATFORM COMMITMENTS */}
            <section className="mb-16">
              <div className="mb-6">
                <div className="font-ticker text-xs font-bold text-acid-yellow uppercase tracking-widest">
                  PLATFORM COMMITMENTS // TRUST & RELIABILITY
                </div>
                <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-grit-white">
                  OUR TICKETING GUARANTEES
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Rule 1 */}
                <div className="bg-asphalt-surface border-3 border-grit-white p-5 relative shadow-[4px_4px_0px_#eefc54] -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-10 h-10 bg-acid-yellow text-asphalt-black flex items-center justify-center font-display text-2xl font-black mb-3 border-2 border-asphalt-black">
                    01
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-grit-white mb-1">100% VERIFIED PASSES</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Official digital passes equipped with tamper-proof cryptographic QR codes. Zero fake or duplicate tickets.
                  </p>
                  <div className="mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-neon-magenta">
                    GUARANTEE: 100% VALID GATE ENTRY
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="bg-asphalt-surface border-3 border-grit-white p-5 relative shadow-[4px_4px_0px_#ff1f6d] rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-10 h-10 bg-neon-magenta text-grit-white flex items-center justify-center font-display text-2xl font-black mb-3 border-2 border-asphalt-black">
                    02
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-grit-white mb-1">REAL-TIME SEAT HOLD</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Once selected, your seat is held exclusively for 10 minutes so no other buyer can claim it during checkout.
                  </p>
                  <div className="mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-acid-yellow">
                    CONCURRENCY: 10-MIN HOLD WINDOW
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="bg-asphalt-surface border-3 border-grit-white p-5 relative shadow-[4px_4px_0px_#1d4ed8] -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-10 h-10 bg-electric-cobalt text-grit-white flex items-center justify-center font-display text-2xl font-black mb-3 border-2 border-asphalt-black">
                    03
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-grit-white mb-1">INSTANT DIGITAL PASSES</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Digital passes generated immediately upon payment with printable PDF download and ICS calendar sync.
                  </p>
                  <div className="mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-grit-white">
                    DELIVERY: REAL-TIME CONFIRMATION
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="bg-asphalt-surface border-3 border-grit-white p-5 relative shadow-[4px_4px_0px_#ffffff] rotate-2 hover:rotate-0 transition-transform">
                  <div className="w-10 h-10 bg-grit-white text-asphalt-black flex items-center justify-center font-display text-2xl font-black mb-3 border-2 border-asphalt-black">
                    04
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-grit-white mb-1">RAPID GATE SCANNER</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Organizers scan attendee tickets in milliseconds using the built-in optical camera scanner or manual cipher code.
                  </p>
                  <div className="mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-neon-magenta">
                    ACCESS: HIGH-SPEED GATE ADMISSION
                  </div>
                </div>
              </div>
            </section>

            {/* 7. ORGANIZER PORTAL CALLOUT */}
            <section className="bg-asphalt-black border-4 border-acid-yellow p-6 md:p-8 relative shadow-[8px_8px_0px_#ffffff] mb-12" id="gatekeeper">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-acid-yellow text-asphalt-black flex items-center justify-center font-display text-4xl -rotate-6 border-2 border-asphalt-black shadow-[3px_3px_0px_#ff1f6d]">
                    ⚡
                  </div>
                  <div>
                    <div className="font-ticker text-xs font-bold text-neon-magenta uppercase tracking-wider mb-1">
                      ORGANIZER & PROMOTER PORTAL
                    </div>
                    <h3 className="font-display text-3xl uppercase tracking-wide text-grit-white">
                      HOSTING A CONCERT, CONFERENCE, OR MATCH?
                    </h3>
                    <p className="font-mono-zine text-xs text-grit-dim">
                      Publish your event, define tiered seating maps, set ticket tariffs, and access live gate check-in scanners.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button 
                    type="button"
                    onClick={() => setIsCheckInOpen(true)}
                    className="w-full md:w-auto px-6 py-3 bg-acid-yellow hover:bg-acid-yellow-hover text-asphalt-black font-display text-2xl tracking-wider uppercase border-2 border-asphalt-black shadow-[4px_4px_0px_#ff1f6d] font-bold cursor-pointer"
                  >
                    GATE SCANNER
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsApiDocsOpen(true)}
                    className="w-full md:w-auto px-6 py-3 bg-asphalt-card hover:bg-asphalt-surface text-grit-white font-display text-2xl tracking-wider uppercase border-2 border-grit-white shadow-[4px_4px_0px_#eefc54] font-bold cursor-pointer"
                  >
                    API DOCS
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* 8. FOOTER */}
          <footer className="w-full bg-asphalt-black border-t-4 border-grit-white mt-12">
            <div className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="bg-acid-yellow text-asphalt-black px-2.5 py-0.5 font-display text-2xl tracking-wider -rotate-2 border-2 border-grit-white inline-block mb-3">
                    EVENTHUB
                  </div>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    MODERN LIVE EVENT TICKETING PLATFORM • REAL-TIME SEAT CONCURRENCY • SECURE QR CODE ADMISSION • TRANSPARENT MULTI-CURRENCY BOOKINGS.
                  </p>
                </div>
                <div>
                  <div className="font-display text-xl uppercase tracking-wider text-acid-yellow mb-3">
                    PLATFORM NAVIGATION
                  </div>
                  <ul className="space-y-1.5 font-ticker text-xs text-grit-dim">
                    <li onClick={() => handleNavigate('events')} className="hover:text-grit-white transition-colors cursor-pointer">• EXPLORE EVENTS CATALOG</li>
                    <li onClick={() => handleNavigate('create-event')} className="hover:text-grit-white transition-colors cursor-pointer">• CREATE & PUBLISH EVENT</li>
                    <li onClick={() => handleNavigate('checkin')} className="hover:text-grit-white transition-colors cursor-pointer">• GATE QR SCANNER</li>
                    <li onClick={() => setIsApiDocsOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• REST & STOMP API DOCS</li>
                  </ul>
                </div>
                <div>
                  <div className="font-display text-xl uppercase tracking-wider text-neon-magenta mb-3">
                    LEGAL & POLICIES
                  </div>
                  <ul className="space-y-1.5 font-ticker text-xs text-grit-dim">
                    <li onClick={() => setIsTermsOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• TERMS OF SERVICE</li>
                    <li onClick={() => setIsPrivacyOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• PRIVACY POLICY</li>
                    <li onClick={() => setIsCookiesOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• COOKIE PREFERENCES</li>
                    <li onClick={() => setIsSystemStatusOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• SYSTEM STATUS & HEALTH</li>
                  </ul>
                </div>
                <div>
                  <div className="font-display text-xl uppercase tracking-wider text-electric-cobalt mb-3">
                    PLATFORM TELEMETRY
                  </div>
                  <div className="bg-asphalt-surface p-3 border-2 border-asphalt-border space-y-1.5 font-ticker text-xs">
                    <div className="flex justify-between">
                      <span className="text-grit-dim">REST ENGINE:</span>
                      <span className="text-acid-yellow font-bold">ONLINE // 200 OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grit-dim">DATABASE CLUSTER:</span>
                      <span className="text-neon-magenta font-bold">POSTGRESQL ACTIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grit-dim">WEBSOCKET BROKER:</span>
                      <span className="text-grit-white font-bold">STOMP v1.2 READY</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t-2 border-asphalt-border flex flex-col sm:flex-row items-center justify-between gap-4 font-ticker text-xs text-grit-dim">
                <div>
                  © 2026 EVENTHUB TICKETING PLATFORM. ALL RIGHTS RESERVED.
                </div>
                <div className="flex items-center gap-4">
                  <a href="#apidocs" onClick={(e) => { e.preventDefault(); setIsApiDocsOpen(true); }} className="text-acid-yellow hover:underline">API_DOCUMENTATION</a>
                  <span>•</span>
                  <a href="#terms" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="text-neon-magenta hover:underline">TERMS_OF_SERVICE</a>
                  <span>•</span>
                  <a href="#privacy" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }} className="text-grit-white hover:underline">PRIVACY_POLICY</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      )}

      {/* Modals */}
      <SeatMapModal 
        isOpen={isSeatMapOpen} 
        onClose={() => setIsSeatMapOpen(false)} 
        event={selectedEvent}
        currentUser={currentUser}
        showToast={showToast}
        onBookingSuccess={() => {
          setActiveTab('my-bookings');
          fetchCatalogData();
        }}
      />

      <CheckInModal 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        showToast={showToast}
      />

      <CreateEventModal 
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        showToast={showToast}
        onEventCreated={(newEvent) => {
          if (newEvent) {
            setEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)]);
            setPopularEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)]);
          }
          fetchCatalogData(true);
        }}
      />

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <SystemStatusModal isOpen={isSystemStatusOpen} onClose={() => setIsSystemStatusOpen(false)} />
      <DatabaseConsoleModal isOpen={isDatabaseConsoleOpen} onClose={() => setIsDatabaseConsoleOpen(false)} />
      <CookiesModal isOpen={isCookiesOpen} onClose={() => setIsCookiesOpen(false)} showToast={showToast} />
      <ApiDocsModal isOpen={isApiDocsOpen} onClose={() => setIsApiDocsOpen(false)} />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Bell size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Interactive Seat Matrix Product Demo
function HeroProductDemo({ onOpenBooking }) {
  const [selectedTile, setSelectedTile] = useState('F1-05');
  const [tariff, setTariff] = useState(30);
  const [lockedSuccess, setLockedSuccess] = useState(false);

  const tilesRow1 = [
    { id: 'F1-01', label: '01', price: 30, available: true },
    { id: 'F1-02', label: '02', price: 30, available: true },
    { id: 'F1-03', label: '✕', price: 30, available: false },
    { id: 'F1-04', label: '✕', price: 30, available: false },
    { id: 'F1-05', label: '05', price: 30, available: true },
    { id: 'F1-06', label: '06', price: 30, available: true },
    { id: 'F1-07', label: '07', price: 30, available: true },
    { id: 'F1-08', label: '✕', price: 30, available: false },
  ];

  const tilesRow2 = [
    { id: 'M2-01', label: '01', price: 30, available: true },
    { id: 'M2-02', label: '02', price: 30, available: true },
    { id: 'M2-03', label: '03', price: 30, available: true },
    { id: 'M2-04', label: '04', price: 30, available: true },
    { id: 'M2-05', label: '05', price: 30, available: true },
    { id: 'M2-06', label: '06', price: 30, available: true },
    { id: 'M2-07', label: '✕', price: 30, available: false },
    { id: 'M2-08', label: '✕', price: 30, available: false },
  ];

  const tilesRow3 = [
    { id: 'B3-01', label: '✕', price: 30, available: false },
    { id: 'B3-02', label: '02', price: 30, available: true },
    { id: 'B3-03', label: '03', price: 30, available: true },
    { id: 'B3-04', label: '04', price: 30, available: true },
    { id: 'B3-05', label: '05', price: 30, available: true },
    { id: 'B3-06', label: '06', price: 30, available: true },
    { id: 'B3-07', label: '07', price: 30, available: true },
    { id: 'B3-08', label: '08', price: 30, available: true },
  ];

  const handleSelect = (tile) => {
    if (!tile.available) return;
    setSelectedTile(tile.id);
    setTariff(tile.price);
  };

  const handleLock = () => {
    setLockedSuccess(true);
    setTimeout(() => {
      setLockedSuccess(false);
      onOpenBooking();
    }, 600);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-asphalt-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-acid-yellow text-lg">event_seat</span>
          <span className="font-display text-2xl uppercase tracking-wider text-grit-white">SEAT CONCURRENCY MATRIX // STAGE FLOOR</span>
        </div>
        <span className="font-ticker text-[10px] bg-neon-magenta text-grit-white px-2 py-0.5 font-bold uppercase">
          WS://STOMP SEAT STREAM LIVE
        </span>
      </div>

      <div className="w-full py-2 hazard-tape text-center border-2 border-asphalt-black mb-4 select-none">
        <span className="font-impact text-sm tracking-widest text-asphalt-black uppercase bg-acid-yellow px-2 py-0.5 font-black">
          [ STAGE / PERFORMANCE SCREEN ]
        </span>
      </div>

      <div className="space-y-2 mb-4 select-none">
        {/* Row 1 */}
        <div className="flex items-center gap-2">
          <span className="font-ticker text-xs font-bold text-neon-magenta w-6">ROW A</span>
          <div className="flex-1 grid grid-cols-8 gap-1.5 sm:gap-2">
            {tilesRow1.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={!t.available}
                onClick={() => handleSelect(t)}
                className={
                  !t.available
                    ? 'py-2 bg-asphalt-surface text-grit-dim opacity-30 cursor-not-allowed font-ticker text-xs border border-asphalt-border'
                    : selectedTile === t.id
                    ? 'pit-tile py-2 bg-acid-yellow text-asphalt-black font-ticker text-xs font-black border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] transition-all cursor-pointer'
                    : 'pit-tile py-2 bg-asphalt-card hover:bg-asphalt-border text-grit-white font-ticker text-xs font-bold border border-grit-white/20 transition-all cursor-pointer'
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2">
          <span className="font-ticker text-xs font-bold text-acid-yellow w-6">ROW B</span>
          <div className="flex-1 grid grid-cols-8 gap-1.5 sm:gap-2">
            {tilesRow2.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={!t.available}
                onClick={() => handleSelect(t)}
                className={
                  !t.available
                    ? 'py-2 bg-asphalt-surface text-grit-dim opacity-30 cursor-not-allowed font-ticker text-xs border border-asphalt-border'
                    : selectedTile === t.id
                    ? 'pit-tile py-2 bg-acid-yellow text-asphalt-black font-ticker text-xs font-black border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] transition-all cursor-pointer'
                    : 'pit-tile py-2 bg-asphalt-card hover:bg-asphalt-border text-grit-white font-ticker text-xs font-bold border border-grit-white/20 transition-all cursor-pointer'
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex items-center gap-2">
          <span className="font-ticker text-xs font-bold text-grit-dim w-6">ROW C</span>
          <div className="flex-1 grid grid-cols-8 gap-1.5 sm:gap-2">
            {tilesRow3.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={!t.available}
                onClick={() => handleSelect(t)}
                className={
                  !t.available
                    ? 'py-2 bg-asphalt-surface text-grit-dim opacity-30 cursor-not-allowed font-ticker text-xs border border-asphalt-border'
                    : selectedTile === t.id
                    ? 'pit-tile py-2 bg-acid-yellow text-asphalt-black font-ticker text-xs font-black border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] transition-all cursor-pointer'
                    : 'pit-tile py-2 bg-asphalt-card hover:bg-asphalt-border text-grit-white font-ticker text-xs font-bold border border-grit-white/20 transition-all cursor-pointer'
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs font-ticker pt-2 border-t border-asphalt-border text-grit-dim gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-asphalt-card border border-grit-white/40" /> AVAILABLE</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-acid-yellow border border-asphalt-black" /> SELECTED</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-asphalt-surface border border-asphalt-border opacity-40" /> OCCUPIED</span>
        </div>
        <span className="text-neon-magenta font-bold">1 SEAT SELECTED (10-MIN HOLD WINDOW)</span>
      </div>

      {/* Total Calculation & Commit Button */}
      <div className="mt-4 pt-3 bg-asphalt-card p-3 border-2 border-grit-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-ticker text-grit-dim uppercase">TICKET SUBTOTAL</span>
          <span className="font-display text-3xl text-acid-yellow">${tariff}.00 USD</span>
        </div>
        <button 
          type="button"
          onClick={handleLock}
          className="w-full sm:w-auto px-6 py-2.5 bg-neon-magenta hover:bg-neon-magenta-dark text-grit-white font-display text-2xl tracking-wider uppercase border-2 border-asphalt-black shadow-[3px_3px_0px_#eefc54] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <span>{lockedSuccess ? 'SEAT RESERVED // OPENING CHECKOUT' : 'SELECT SEAT & PROCEED TO CHECKOUT'}</span>
          <span className="material-symbols-outlined text-lg">{lockedSuccess ? 'check_circle' : 'lock'}</span>
        </button>
      </div>
    </div>
  );
}

// Brutalist Event Pass Flyer Card
function EventCard({ event, index = 0, currentUser, onBook, onWishlist, onWaitlist, onDelete }) {
  const isSoldOut = event.availableSeats === 0;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER');

  const badgeTitles = ['FEATURED EVENT', 'SELLING FAST', 'VIP AVAILABLE', 'TOP RATED', 'LIMITED PASSES', 'POPULAR SHOW'];
  const badgeTitle = badgeTitles[index % badgeTitles.length];

  const badgeStyles = [
    'bg-neon-magenta text-grit-white rotate-6',
    'bg-acid-yellow text-asphalt-black -rotate-3',
    'bg-electric-cobalt text-grit-white rotate-4',
    'bg-neon-magenta text-grit-white -rotate-6'
  ];
  const badgeStyle = badgeStyles[index % badgeStyles.length];

  const shadowStyles = [
    'shadow-[6px_6px_0px_#eefc54]',
    'shadow-[6px_6px_0px_#ff1f6d]',
    'shadow-[6px_6px_0px_#1d4ed8]',
    'shadow-[6px_6px_0px_#eefc54]'
  ];
  const shadowStyle = shadowStyles[index % shadowStyles.length];

  const getImageForEvent = (event) => {
    if (event.bannerImageUrl) return event.bannerImageUrl;
    if (event.category === 'MUSIC') return '/images/concert.png';
    if (event.category === 'TECH') return '/images/tech.png';
    if (event.category === 'THEATER') return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80';
    if (event.category === 'SPORTS') return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
    return '/images/concert.png';
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return '18.OCT // 19:00';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      return `${day} ${month} • 19:00`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-asphalt-card border-3 border-grit-white relative group hover:-translate-y-1 transition-all ${shadowStyle} flex flex-col justify-between`}>
      {/* Event Sticker Overlay */}
      <div className={`absolute -top-3 -right-2 ${badgeStyle} font-display text-sm tracking-wider px-2.5 py-0.5 border border-asphalt-black z-30 shadow-md`}>
        {badgeTitle}
      </div>

      {/* Upper Artwork */}
      <div className="relative h-60 w-full overflow-hidden bg-asphalt-black border-b-3 border-grit-white">
        <img 
          src={getImageForEvent(event)} 
          alt={event.name} 
          className="w-full h-full object-cover grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-asphalt-black/30 mix-blend-multiply" />

        {/* Date Tag */}
        <div className="absolute top-2 left-2 bg-acid-yellow text-asphalt-black font-ticker text-[10px] font-black px-1.5 py-0.5 -rotate-3 border border-asphalt-black">
          DATE: {formatEventDate(event.eventDate)}
        </div>

        <div className="absolute bottom-2 left-2 bg-asphalt-black/90 text-grit-white font-ticker text-[10px] px-2 py-0.5 border border-grit-white/50">
          VENUE: {event.venueName || 'MAIN ARENA'}
        </div>

        {/* Quick Actions (Wishlist & Delete) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-40">
          {canDelete && (
            <button 
              type="button"
              onClick={onDelete}
              className="bg-danger-red text-grit-white p-1 border border-asphalt-black text-xs font-bold cursor-pointer"
              title="Remove Event"
            >
              ✕
            </button>
          )}
          <button 
            type="button"
            onClick={onWishlist}
            className="bg-asphalt-black/80 hover:bg-neon-magenta text-grit-white p-1 border border-grit-white text-xs cursor-pointer"
            title="Save to wishlist"
          >
            <Heart size={13} />
          </button>
        </div>
      </div>

      {/* Hazard Tear Notch */}
      <div className={`h-4 ${index % 2 === 0 ? 'hazard-tape' : 'hazard-tape-magenta'} relative flex items-center justify-between border-y-2 border-asphalt-black select-none`}>
        <div className="w-3 h-4 bg-asphalt-black -ml-1 border-r-2 border-grit-white" />
        <div className="font-ticker text-[9px] font-black text-asphalt-black tracking-widest uppercase">
          OFFICIAL ADMISSION PASS /// EVENTHUB
        </div>
        <div className="w-3 h-4 bg-asphalt-black -mr-1 border-l-2 border-grit-white" />
      </div>

      {/* Flyer Lower Stub Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-asphalt-card">
        <div>
          <div className="text-[10px] font-ticker text-neon-magenta uppercase tracking-wider mb-1 font-bold">
            SECTOR: {event.category || 'LIVE EVENT'} // TIER 01
          </div>
          <h3 className="font-display text-2xl uppercase tracking-wide text-grit-white group-hover:text-acid-yellow transition-colors leading-tight mb-1">
            {event.name}
          </h3>
          <p className="font-mono-zine text-xs text-grit-dim mb-3">
            {event.venueName || 'Main Arena'} • {event.city || 'Convention Center'}
          </p>
        </div>

        <div>
          <div className="bg-asphalt-black p-2 border border-asphalt-border mb-3 flex items-center justify-between">
            <div>
              <span className="block text-[9px] font-ticker text-grit-dim">TICKET PRICE</span>
              <span className="font-display text-2xl text-acid-yellow">
                {formatPrice(event.ticketPrice, event.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-ticker text-grit-dim">AVAILABLE SEATS</span>
              <span className="font-ticker text-xs font-bold text-neon-magenta">
                {isSoldOut ? 'SOLD OUT' : `${event.availableSeats} SEATS LEFT`}
              </span>
            </div>
          </div>

          {isSoldOut ? (
            <button 
              type="button"
              onClick={onWaitlist}
              className="w-full py-2 bg-asphalt-surface text-grit-dim font-display text-xl uppercase tracking-wider font-black border-2 border-asphalt-border transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>JOIN WAITLIST</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={onBook}
              className="w-full py-2 bg-acid-yellow hover:bg-acid-yellow-hover text-asphalt-black font-display text-xl uppercase tracking-wider font-black border-2 border-asphalt-black shadow-[3px_3px_0px_#ffffff] transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>SELECT SEATS</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          )}

          {/* Barcode Strip */}
          <div className="mt-3 pt-2 border-t border-asphalt-border/60 flex flex-col items-center">
            <svg className="w-full h-4 text-grit-dim fill-current opacity-70" preserveAspectRatio="none" viewBox="0 0 100 20">
              <rect height="20" width="2" x="0" y="0"></rect><rect height="20" width="1" x="4" y="0"></rect><rect height="20" width="3" x="7" y="0"></rect><rect height="20" width="2" x="12" y="0"></rect><rect height="20" width="4" x="16" y="0"></rect><rect height="20" width="1" x="22" y="0"></rect><rect height="20" width="2" x="25" y="0"></rect><rect height="20" width="3" x="29" y="0"></rect><rect height="20" width="1" x="34" y="0"></rect><rect height="20" width="4" x="37" y="0"></rect><rect height="20" width="2" x="43" y="0"></rect><rect height="20" width="1" x="47" y="0"></rect><rect height="20" width="3" x="50" y="0"></rect><rect height="20" width="2" x="55" y="0"></rect><rect height="20" width="4" x="59" y="0"></rect><rect height="20" width="1" x="65" y="0"></rect><rect height="20" width="3" x="68" y="0"></rect><rect height="20" width="2" x="73" y="0"></rect><rect height="20" width="4" x="77" y="0"></rect><rect height="20" width="1" x="83" y="0"></rect><rect height="20" width="2" x="86" y="0"></rect><rect height="20" width="4" x="90" y="0"></rect><rect height="20" width="1" x="96" y="0"></rect>
            </svg>
            <span className="text-[9px] font-ticker text-grit-dim tracking-widest mt-0.5">E-TICKET CIPHER // EVENTHUB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback Mock Events
const mockEvents = [
  {
    id: 1,
    name: 'Neon Horizon Cyber Music Festival 2026',
    description: 'Immersive electronic music event featuring holographic stages and world-class performances.',
    category: 'MUSIC',
    ticketPrice: 85.00,
    availableSeats: 120,
    eventDate: '2026-09-15',
    venueName: 'Metro Arena Center',
    bannerImageUrl: '/images/concert.png'
  },
  {
    id: 2,
    name: 'Global AI & Autonomous Tech Summit 2026',
    description: 'Keynotes from leading systems researchers, live robotics demonstrations, and engineering workshops.',
    category: 'TECH',
    ticketPrice: 299.00,
    availableSeats: 45,
    eventDate: '2026-10-02',
    venueName: 'Silicon Valley Convention Center',
    bannerImageUrl: '/images/tech.png'
  },
  {
    id: 3,
    name: 'Phantom of the Opera: Broadway Revival',
    description: 'Award-winning musical production with orchestral accompaniment and live staging.',
    category: 'THEATER',
    ticketPrice: 120.00,
    availableSeats: 0,
    eventDate: '2026-11-20',
    venueName: 'Royal Opera House',
    bannerImageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Grand Prix eSports World Championship',
    description: 'Simulator racing championship featuring verified competitive telemetry and live finals.',
    category: 'SPORTS',
    ticketPrice: 45.00,
    availableSeats: 300,
    eventDate: '2026-12-05',
    venueName: 'Apex eSports Dome',
    bannerImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
  }
];
