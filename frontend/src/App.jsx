import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import Background3D from './components/Background3D';

import EventCardSkeleton from './components/EventCardSkeleton';
import { 
  Heart, Bell, AlertCircle, Check, Zap, Radio, Calendar, MapPin, 
  ArrowRight, Search, RotateCcw, Film, Ticket, Layers, 
  SlidersHorizontal, Music, Theater, Laptop, Trophy, ShieldCheck 
} from 'lucide-react';
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
  const backendOnlineRef = useRef(true);

  const categoryCounts = useMemo(() => {
    const master = allMasterEvents.length > 0 
      ? allMasterEvents 
      : (allMasterEventsRef.current.length > 0 ? allMasterEventsRef.current : mockEvents);
    const counts = { ALL: master.length, CINEMA: 0, MUSIC: 0, THEATER: 0, TECH: 0, SPORTS: 0 };
    master.forEach((e) => {
      const isCinema = e.category === 'CINEMA' || e.category === 'MOVIE' || /imax|cinema|movie|film|screening|interstellar|blade runner|oppenheimer/i.test(e.name || '');
      if (isCinema) {
        counts.CINEMA = (counts.CINEMA || 0) + 1;
      } else if (counts[e.category] !== undefined) {
        counts[e.category] = (counts[e.category] || 0) + 1;
      }
    });
    return counts;
  }, [allMasterEvents]);

  const categories = useMemo(() => [
    { id: '', key: 'ALL', label: 'ALL SHOWS', icon: Layers },
    { id: 'CINEMA', key: 'CINEMA', label: 'CINEMA & IMAX', icon: Film },
    { id: 'MUSIC', key: 'MUSIC', label: 'CONCERTS', icon: Music },
    { id: 'THEATER', key: 'THEATER', label: 'THEATER & ARTS', icon: Theater },
    { id: 'TECH', key: 'TECH', label: 'TECH & AI', icon: Laptop },
    { id: 'SPORTS', key: 'SPORTS', label: 'SPORTS & ARENA', icon: Trophy },
  ], []);

  const trendingEvents = useMemo(() => {
    const pool = popularEvents.length > 0 ? popularEvents : (events.length > 0 ? events : mockEvents);
    return pool.slice(0, 4);
  }, [popularEvents, events]);

  const scrollToResults = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Adaptive Device Theme: Automatically follow system/device preferred color scheme
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    try {
      localStorage.removeItem('sb-theme');
    } catch {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark) => {
      const root = document.documentElement;
      const body = document.body;
      if (isDark) {
        root.classList.remove('light');
        root.classList.add('dark');
        body.classList.remove('light');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        body.classList.remove('dark');
        body.classList.add('light');
      }
    };

    // Apply current system preference
    applyTheme(mediaQuery.matches);

    // Reactively adapt when the OS/device theme switches
    const handleChange = (e) => applyTheme(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);

    fetchCatalogData();

    const interval = setInterval(() => {
      // Avoid spamming requests when backend is offline in static staging
      if (backendOnlineRef.current) {
        fetchCatalogData(true);
      }
    }, 10000);

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
        backendOnlineRef.current = true;
      } else {
        freshList = mockEvents;
        if (!allEv) backendOnlineRef.current = false;
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
      backendOnlineRef.current = false;
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
      if (criteria.category === 'CINEMA') {
        list = list.filter((e) => e.category === 'CINEMA' || e.category === 'MOVIE' || /imax|cinema|movie|film|screening|interstellar|blade runner|oppenheimer/i.test(e.name || ''));
      } else {
        list = list.filter((e) => e.category === criteria.category);
      }
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

  const openBookingModal = (event, preferredShowtime = null) => {
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
    setSelectedEvent(preferredShowtime ? { ...targetEvent, initialShowtime: preferredShowtime } : targetEvent);
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

  return (
    <div className="relative min-h-screen bg-asphalt-black text-grit-white selection:bg-acid-yellow selection:text-asphalt-black">
      {/* 3D Atmospheric Background Layer */}
      <Background3D />

      <div className="relative z-10 flex flex-col min-h-screen">
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
      <div className="hidden sm:block w-full bg-asphalt-surface border-b border-asphalt-border py-2 px-4">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between text-xs font-ticker gap-2">
          <div className="flex items-center gap-2 text-grit-dim">
            <span className="bg-neon-magenta text-grit-white font-bold px-1.5 py-0.2 -rotate-2">BOX OFFICE</span>
            <span className="text-grit-white font-mono-zine">OFFICIAL PASSES & TICKETS FOR LIVE CONCERTS, CINEMA & THEATER</span>
          </div>
          <div className="flex items-center gap-3 text-grit-dim">
            <span className="text-acid-yellow flex items-center gap-1.5 font-bold">
              <Zap size={11} className="fill-current text-acid-yellow" />
              10-MIN RESERVED HOLD GUARANTEE
            </span>
            <span>|</span>
            <span className="text-grit-white">100% VERIFIED PASSES</span>
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
          <div className="max-w-[1360px] mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-8">
            
            {/* 2. BRUTALIST HERO SECTION */}
            <section className="relative mb-8 sm:mb-12 border-2 sm:border-4 border-grit-white bg-asphalt-surface p-3.5 sm:p-6 md:p-10 shadow-[3px_3px_0px_#eefc54] sm:shadow-[8px_8px_0px_#eefc54] overflow-hidden">
              {/* Slanted Badges (Shown on sm+ to prevent mobile viewport clipping) */}
              <div className="hidden sm:inline-block absolute -top-3 sm:-top-5 right-2 sm:-right-4 bg-neon-magenta text-grit-white font-display text-sm sm:text-xl lg:text-2xl px-2.5 sm:px-4 py-1 sm:py-1.5 rotate-2 sm:rotate-3 border-2 border-asphalt-black shadow-[3px_3px_0px_#0e0e11] z-20">
                [ 100% VERIFIED TICKETS & PASSES ]
              </div>
              <div className="hidden sm:inline-block absolute -bottom-3 sm:-bottom-4 left-2 sm:-left-3 bg-electric-cobalt text-acid-yellow font-ticker text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 -rotate-2 sm:-rotate-3 border-2 border-grit-white z-20">
                ZERO SECONDARY SCALPING // 100% VERIFIED
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 bg-asphalt-black border-2 border-acid-yellow px-2 sm:px-3 py-1 stamp-slant-1">
                    <ShieldCheck size={13} className="text-acid-yellow" />
                    <span className="font-ticker text-[9px] sm:text-xs font-bold uppercase text-acid-yellow tracking-widest">
                      OFFICIAL LIVE EVENT & CINEMA BOX OFFICE
                    </span>
                  </div>

                  <h1 className="font-display text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-8xl uppercase tracking-tight text-grit-white leading-[0.95] sm:leading-[0.9]">
                    YOUR FRONT ROW TO <span className="text-acid-yellow underline decoration-neon-magenta decoration-2 sm:decoration-4">LIVE EVENTS</span> & PREMIERES.
                  </h1>

                  <p className="font-mono-zine text-xs sm:text-base text-grit-white/90 max-w-2xl leading-relaxed">
                    Pick your exact seats in real time with zero hidden fees. Instant digital QR passes for arena concerts, IMAX 3D screenings, Broadway theater, and world championships with a 10-minute cart hold guarantee.
                  </p>

                  {/* Value Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 sm:pt-2">
                    <div className="bg-asphalt-black p-2 sm:p-2.5 border-2 border-asphalt-border">
                      <span className="text-[8px] sm:text-[10px] text-grit-dim block font-ticker uppercase">TICKETS</span>
                      <span className="font-display text-base sm:text-xl text-acid-yellow">100% VERIFIED</span>
                    </div>
                    <div className="bg-asphalt-black p-2 sm:p-2.5 border-2 border-asphalt-border">
                      <span className="text-[8px] sm:text-[10px] text-grit-dim block font-ticker uppercase">CART HOLD</span>
                      <span className="font-display text-base sm:text-xl text-neon-magenta">10-MIN WINDOW</span>
                    </div>
                    <div className="bg-asphalt-black p-2 sm:p-2.5 border-2 border-asphalt-border">
                      <span className="text-[8px] sm:text-[10px] text-grit-dim block font-ticker uppercase">EXPERIENCE</span>
                      <span className="font-display text-base sm:text-xl text-electric-cobalt">IMAX 3D & ARENA</span>
                    </div>
                    <div className="bg-asphalt-black p-2 sm:p-2.5 border-2 border-asphalt-border">
                      <span className="text-[8px] sm:text-[10px] text-grit-dim block font-ticker uppercase">DELIVERY</span>
                      <span className="font-display text-base sm:text-xl text-grit-white">INSTANT QR PASS</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
                    <button
                      type="button"
                      onClick={scrollToResults}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-acid-yellow hover:bg-neon-magenta text-asphalt-black hover:text-grit-white font-impact text-sm sm:text-lg uppercase tracking-wider border-2 border-asphalt-black shadow-[3px_3px_0px_#ffffff] sm:shadow-[4px_4px_0px_#ffffff] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold touch-manipulation"
                    >
                      <span>EXPLORE UPCOMING EVENTS</span>
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextFilters = { ...filters, category: 'CINEMA' };
                        setFilters(nextFilters);
                        handleSearchAndFilter(nextFilters);
                      }}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-asphalt-black hover:bg-asphalt-surface text-grit-white font-impact text-sm sm:text-lg uppercase tracking-wider border-2 border-grit-white shadow-[3px_3px_0px_#eefc54] sm:shadow-[4px_4px_0px_#eefc54] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold touch-manipulation"
                    >
                      <Film size={16} className="text-acid-yellow" />
                      <span>CINEMA SCREENINGS</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Interactive Trending Spotlight Slideshow */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center w-full overflow-hidden">
                  <HeroTrendingSlideshow 
                    events={trendingEvents} 
                    onBook={(event) => openBookingModal(event)} 
                  />
                </div>
              </div>
            </section>

            {/* 3. EVENT SEARCH & DISPATCH CAPSULE */}
            <section className="mb-10 sm:mb-14">
              <div className="bg-acid-yellow p-3.5 sm:p-5 border-2 sm:border-4 border-asphalt-black shadow-[3px_3px_0px_#ffffff] sm:shadow-[6px_6px_0px_#ffffff]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-asphalt-black font-ticker text-xs font-bold text-asphalt-black">
                  <span className="flex items-center gap-2">
                    <Search size={16} />
                    DISCOVER EVENTS & VENUES // LIVE BOX OFFICE
                  </span>
                  <span className="bg-asphalt-black text-acid-yellow px-2 py-0.5">NOW SHOWING</span>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSearchAndFilter(); }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-asphalt-black">
                  {/* Keyword */}
                  <div className="bg-grit-white border-2 border-asphalt-black p-2.5 flex flex-col justify-between">
                    <label htmlFor="search-keyword" className="font-ticker text-[10px] uppercase font-bold text-asphalt-black/80">EVENT / ARTIST / MOVIE</label>
                    <input 
                      id="search-keyword"
                      type="text" 
                      placeholder="e.g. Cyberpunk, Neon Horizon, Opera..." 
                      value={filters.keyword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFilters({ ...filters, keyword: val });
                        applyLiveFilter({ ...filters, keyword: val });
                      }}
                      className="bg-transparent font-impact text-lg text-asphalt-black placeholder:text-asphalt-black/40 focus:outline-none w-full border-none p-0" 
                    />
                  </div>

                  {/* Category */}
                  <div className="bg-grit-white border-2 border-asphalt-black p-2.5 flex flex-col justify-between">
                    <label htmlFor="search-category" className="font-ticker text-[10px] uppercase font-bold text-asphalt-black/80">EVENT CATEGORY</label>
                    <select 
                      id="search-category"
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
                      <option value="CINEMA">CINEMA & MOVIE PREMIERES</option>
                      <option value="MUSIC">MUSIC CONCERTS & FESTIVALS</option>
                      <option value="TECH">TECH & CONFERENCES</option>
                      <option value="THEATER">THEATER & PERFORMING ARTS</option>
                      <option value="SPORTS">SPORTS & TOURNAMENTS</option>
                      <option value="WORKSHOP">WORKSHOPS & MASTERCLASSES</option>
                    </select>
                  </div>

                  {/* City / Location */}
                  <div className="bg-grit-white border-2 border-asphalt-black p-2.5 flex flex-col justify-between">
                    <label htmlFor="search-city" className="font-ticker text-[10px] uppercase font-bold text-asphalt-black/80">CITY / VENUE LOCATION</label>
                    <input 
                      id="search-city"
                      type="text" 
                      placeholder="e.g. Los Angeles, San Francisco..." 
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="bg-transparent font-impact text-lg text-asphalt-black placeholder:text-asphalt-black/40 focus:outline-none w-full border-none p-0" 
                    />
                  </div>

                  {/* Submit Trigger */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-neon-magenta hover:bg-neon-magenta-dark text-grit-white border-2 border-asphalt-black p-2.5 flex items-center justify-center gap-2 font-display text-xl sm:text-2xl tracking-wider uppercase transition-colors shadow-[3px_3px_0px_#0e0e11] cursor-pointer font-bold touch-manipulation"
                    >
                      <span>SEARCH SHOWS</span>
                      <Search size={18} />
                    </button>
                    {hasActiveFilters(filters) && (
                      <button 
                        type="button"
                        onClick={handleClearSearch}
                        className="bg-asphalt-black text-acid-yellow border-2 border-asphalt-black px-3 font-display text-xl uppercase cursor-pointer flex items-center justify-center"
                        title="Clear filters"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </section>

            {/* 4. EVENT LINEUP CATALOG */}
            <section className="mb-16" id="lineup-section" ref={catalogRef}>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between pb-4 mb-6 border-b-4 border-grit-white gap-4">
                <div>
                  <div className="font-ticker text-xs font-bold text-neon-magenta uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-neon-magenta animate-pulse" />
                    CURATED LIVE INVENTORY
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-grit-white">
                    UPCOMING EVENTS & SCREENINGS
                  </h2>
                </div>
                <div className="flex items-center gap-2 font-ticker text-xs">
                  <span className="bg-acid-yellow text-asphalt-black font-bold px-2 py-1 -rotate-2">BOX OFFICE LIVE</span>
                  <span className="bg-electric-cobalt text-grit-white font-bold px-2 py-1 rotate-1">{events.length} EVENTS AVAILABLE</span>
                </div>
              </div>

              {/* Enhanced Neo-Brutalist Category Filter Bar */}
              <div className="bg-asphalt-surface border-3 border-grit-white p-3 sm:p-4 mb-8 shadow-[6px_6px_0px_#eefc54]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-asphalt-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal size={15} className="text-acid-yellow" />
                    <span className="font-ticker text-xs font-bold uppercase tracking-wider text-grit-dim">
                      FILTER BY EXPERIENCE:
                    </span>
                    {filters.category ? (
                      <span className="bg-neon-magenta text-grit-white text-[10px] font-mono-zine px-2 py-0.5 font-bold uppercase">
                        ACTIVE: {categories.find(c => c.id === filters.category)?.label || filters.category}
                      </span>
                    ) : (
                      <span className="bg-asphalt-card text-acid-yellow border border-asphalt-border text-[10px] font-mono-zine px-2 py-0.5 uppercase">
                        ALL SHOWS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-ticker text-xs text-grit-dim">
                      SHOWING <span className="text-acid-yellow font-bold">{events.length}</span> {events.length === 1 ? 'EVENT' : 'EVENTS'}
                    </span>
                    {hasActiveFilters(filters) && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-xs font-ticker text-neon-magenta hover:text-grit-white flex items-center gap-1 font-bold underline cursor-pointer"
                        title="Clear all active filters"
                      >
                        <RotateCcw size={12} />
                        <span>RESET FILTERS</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Horizontal Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 touch-scroll scrollbar-none select-none">
                  {categories.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = filters.category === tab.id;
                    const count = categoryCounts[tab.key] ?? 0;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          const nextFilters = { ...filters, category: tab.id };
                          setFilters(nextFilters);
                          handleSearchAndFilter(nextFilters);
                        }}
                        className={`group flex items-center gap-2 px-3.5 py-2 whitespace-nowrap transition-all duration-150 cursor-pointer border-2 touch-manipulation ${
                          isActive
                            ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ff1f6d] -translate-y-0.5 font-bold'
                            : 'bg-asphalt-card text-grit-white hover:text-acid-yellow border-asphalt-border hover:border-grit-white shadow-[2px_2px_0px_rgba(255,255,255,0.1)]'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-asphalt-black' : 'text-acid-yellow'} />
                        <span className="font-display text-sm tracking-wider uppercase">{tab.label}</span>
                        <span
                          className={`text-[10px] font-mono-zine px-1.5 py-0.5 leading-none ${
                            isActive
                              ? 'bg-asphalt-black text-acid-yellow font-bold'
                              : 'bg-asphalt-surface text-grit-dim border border-asphalt-border group-hover:text-grit-white'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="bg-asphalt-card border-3 border-grit-white p-8 sm:p-12 text-center shadow-[6px_6px_0px_#ff1f6d]">
                  <h3 className="font-display text-3xl text-acid-yellow mb-2">NO EVENTS DISCOVERED</h3>
                  <p className="font-mono-zine text-sm text-grit-dim mb-4">No live events match your search and filter criteria.</p>
                  <button onClick={handleClearSearch} className="btn btn-primary">RESET SEARCH</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {events.map((event, idx) => (
                    <EventCard 
                      key={event.id}
                      event={event}
                      index={idx}
                      currentUser={currentUser}
                      onBook={(showtime) => openBookingModal(event, showtime)}
                      onWishlist={(e) => handleToggleWishlist(event.id, e)}
                      onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
                      onDelete={(e) => handleDeleteEvent(event.id, event.name, e)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 5. INTERACTIVE VENUE & SEATING EXPERIENCE */}
            <section className="mb-12 sm:mb-16 border-2 sm:border-4 border-grit-white bg-asphalt-surface p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_#ff1f6d] sm:shadow-[8px_8px_0px_#ff1f6d]" id="sound-engine">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                {/* Seating Experience Manifesto */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <div className="inline-block bg-neon-magenta text-grit-white font-display text-xs sm:text-sm tracking-widest px-2 py-0.5 -rotate-2">
                    RESERVED SEATING // AUDITORIUM & ARENA
                  </div>
                  <h2 className="font-display text-2xl xs:text-3xl sm:text-5xl uppercase tracking-tight text-grit-white leading-none">
                    CHOOSE YOUR EXACT SEATS IN REAL TIME
                  </h2>
                  <p className="font-mono-zine text-xs sm:text-sm text-grit-dim leading-relaxed">
                    Select your preferred viewpoint across auditoriums, IMAX halls, and arenas. Your chosen seats are locked exclusively for 10 minutes while you complete checkout (guaranteeing zero double-bookings or surprise sold-outs).
                  </p>
                  <div className="space-y-2 font-ticker text-xs">
                    <div className="bg-asphalt-black border-2 border-asphalt-border p-2 sm:p-2.5 flex items-center justify-between">
                      <span className="text-grit-dim">RESERVATION HOLD:</span>
                      <span className="text-acid-yellow font-bold">10-Minute Lock Window</span>
                    </div>
                    <div className="bg-asphalt-black border-2 border-asphalt-border p-2 sm:p-2.5 flex items-center justify-between">
                      <span className="text-grit-dim">SIGHTLINE PREVIEW:</span>
                      <span className="text-grit-white font-bold">Auditorium & Screen Sightlines</span>
                    </div>
                    <div className="bg-asphalt-black border-2 border-asphalt-border p-2 sm:p-2.5 flex items-center justify-between">
                      <span className="text-grit-dim">ADMISSION PASS:</span>
                      <span className="text-neon-magenta font-bold">Instant Tamper-Proof QR Pass</span>
                    </div>
                  </div>
                  <div className="pt-1 sm:pt-2 flex items-center gap-2 font-ticker text-[11px] sm:text-xs text-acid-yellow">
                    <span className="w-2 h-2 rounded-full bg-acid-yellow animate-ping shrink-0" />
                    <span>LIVE SEATING GRID: REAL-TIME AUDITORIUM SYNC ACTIVE</span>
                  </div>
                </div>

                {/* Interactive Pit / Floor Grid */}
                <div className="lg:col-span-7 bg-asphalt-black p-3.5 sm:p-6 border-2 sm:border-3 border-grit-white shadow-[4px_4px_0px_#eefc54] sm:shadow-[6px_6px_0px_#eefc54]">
                  <HeroProductDemo onOpenBooking={() => openBookingModal(popularEvents[0] || events[0])} />
                </div>
              </div>
            </section>

            {/* 6. PLATFORM COMMITMENTS */}
            <section className="mb-12 sm:mb-16">
              <div className="mb-4 sm:mb-6">
                <div className="font-ticker text-xs font-bold text-acid-yellow uppercase tracking-widest">
                  PLATFORM COMMITMENTS // TRUST & RELIABILITY
                </div>
                <h2 className="font-display text-2xl xs:text-3xl sm:text-5xl uppercase tracking-tight text-grit-white">
                  OUR TICKETING GUARANTEES
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Rule 1 */}
                <div className="bg-asphalt-surface border-2 sm:border-3 border-grit-white p-4 sm:p-5 relative shadow-[3px_3px_0px_#eefc54] sm:shadow-[4px_4px_0px_#eefc54] -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-acid-yellow text-asphalt-black flex items-center justify-center font-display text-xl sm:text-2xl font-black mb-2.5 sm:mb-3 border-2 border-asphalt-black">
                    01
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-grit-white mb-1">100% VERIFIED PASSES</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Official digital passes equipped with tamper-proof cryptographic QR codes. Zero fake or duplicate tickets.
                  </p>
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-neon-magenta">
                    GUARANTEE: 100% VALID GATE ENTRY
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="bg-asphalt-surface border-2 sm:border-3 border-grit-white p-4 sm:p-5 relative shadow-[3px_3px_0px_#ff1f6d] sm:shadow-[4px_4px_0px_#ff1f6d] rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neon-magenta text-grit-white flex items-center justify-center font-display text-xl sm:text-2xl font-black mb-2.5 sm:mb-3 border-2 border-asphalt-black">
                    02
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-grit-white mb-1">REAL-TIME SEAT HOLD</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Once selected, your seat is held exclusively for 10 minutes so no other buyer can claim it during checkout.
                  </p>
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-acid-yellow">
                    CONCURRENCY: 10-MIN HOLD WINDOW
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="bg-asphalt-surface border-2 sm:border-3 border-grit-white p-4 sm:p-5 relative shadow-[3px_3px_0px_#1d4ed8] sm:shadow-[4px_4px_0px_#1d4ed8] -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-electric-cobalt text-grit-white flex items-center justify-center font-display text-xl sm:text-2xl font-black mb-2.5 sm:mb-3 border-2 border-asphalt-black">
                    03
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-grit-white mb-1">INSTANT DIGITAL PASSES</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Digital passes generated immediately upon payment with printable PDF download and ICS calendar sync.
                  </p>
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-grit-white">
                    DELIVERY: REAL-TIME CONFIRMATION
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="bg-asphalt-surface border-2 sm:border-3 border-grit-white p-4 sm:p-5 relative shadow-[3px_3px_0px_#ffffff] sm:shadow-[4px_4px_0px_#ffffff] rotate-2 hover:rotate-0 transition-transform">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-grit-white text-asphalt-black flex items-center justify-center font-display text-xl sm:text-2xl font-black mb-2.5 sm:mb-3 border-2 border-asphalt-black">
                    04
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-grit-white mb-1">RAPID GATE SCANNER</h3>
                  <p className="font-mono-zine text-xs text-grit-dim leading-relaxed">
                    Organizers scan attendee tickets in milliseconds using the built-in optical camera scanner or manual cipher code.
                  </p>
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-asphalt-border font-ticker text-[10px] text-neon-magenta">
                    ACCESS: HIGH-SPEED GATE ADMISSION
                  </div>
                </div>
              </div>
            </section>

            {/* 7. ORGANIZER PORTAL CALLOUT */}
            <section className="bg-asphalt-black border-2 border-acid-yellow p-4 sm:p-6 md:p-8 relative shadow-[3px_3px_0px_rgba(255,255,255,0.7)] sm:shadow-[4px_4px_0px_rgba(255,255,255,0.7)] mb-10 sm:mb-12" id="gatekeeper">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-acid-yellow text-asphalt-black flex items-center justify-center -rotate-3 border-2 border-asphalt-black shadow-[2px_2px_0px_#ff1f6d] shrink-0">
                    <Radio size={24} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="font-ticker text-[10px] sm:text-xs font-bold text-neon-magenta uppercase tracking-wider mb-0.5 sm:mb-1">
                      ORGANIZER & PROMOTER PORTAL
                    </div>
                    <h3 className="font-display text-xl sm:text-3xl uppercase tracking-wide text-grit-white leading-tight">
                      HOSTING A CONCERT, CONFERENCE, OR MATCH?
                    </h3>
                    <p className="font-mono-zine text-xs text-grit-dim mt-0.5">
                      Publish your event, define tiered seating maps, set ticket tariffs, and access live gate check-in scanners.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                  <button 
                    type="button"
                    onClick={() => setIsCheckInOpen(true)}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-acid-yellow hover:bg-acid-yellow-hover text-asphalt-black font-display text-xl sm:text-2xl tracking-wider uppercase border-2 border-asphalt-black shadow-[3px_3px_0px_#ff1f6d] font-bold cursor-pointer touch-manipulation flex items-center justify-center"
                  >
                    GATE SCANNER
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleNavigate('create-event')}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-asphalt-card hover:bg-asphalt-surface text-grit-white font-display text-xl sm:text-2xl tracking-wider uppercase border-2 border-grit-white shadow-[3px_3px_0px_#eefc54] font-bold cursor-pointer touch-manipulation flex items-center justify-center"
                  >
                    PUBLISH EVENT
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
                    Modern live event & cinema ticketing platform. Real-time seat concurrency, instant cryptographic QR passes, and transparent multi-currency booking.
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
                    <li onClick={() => setIsApiDocsOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• HELP & SUPPORT DESK</li>
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
                    <li onClick={() => setIsSystemStatusOpen(true)} className="hover:text-grit-white transition-colors cursor-pointer">• BUYER PROTECTION & SAFETY</li>
                  </ul>
                </div>
                <div>
                  <div className="font-display text-xl uppercase tracking-wider text-electric-cobalt mb-3">
                    BOX OFFICE GUARANTEE
                  </div>
                  <div className="bg-asphalt-surface p-3 border-2 border-asphalt-border space-y-1.5 font-ticker text-xs">
                    <div className="flex justify-between">
                      <span className="text-grit-dim">VERIFIED TICKETS:</span>
                      <span className="text-acid-yellow font-bold">100% AUTHENTIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grit-dim">RESERVATION HOLD:</span>
                      <span className="text-neon-magenta font-bold">10-MIN WINDOW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grit-dim">CUSTOMER SUPPORT:</span>
                      <span className="text-grit-white font-bold">24/7 CONCIERGE</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t-2 border-asphalt-border flex flex-col sm:flex-row items-center justify-between gap-4 font-ticker text-xs text-grit-dim">
                <div>
                  © 2026 EVENTHUB TICKETING PLATFORM. ALL RIGHTS RESERVED.
                </div>
                <div className="flex items-center gap-4">
                  <a href="#help" onClick={(e) => { e.preventDefault(); setIsApiDocsOpen(true); }} className="text-acid-yellow hover:underline">HELP_CENTER</a>
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
          <span className="font-display text-lg sm:text-2xl uppercase tracking-wider text-grit-white">SEATING GRID // AUDITORIUM & STAGE</span>
        </div>
        <span className="font-ticker text-[10px] bg-neon-magenta text-grit-white px-2 py-0.5 font-bold uppercase shrink-0">
          LIVE PREVIEW
        </span>
      </div>

      <div className="w-full py-2 hazard-tape text-center border-2 border-asphalt-black mb-4 select-none">
        <span className="font-impact text-xs sm:text-sm tracking-widest text-asphalt-black uppercase bg-acid-yellow px-2 py-0.5 font-black">
          [ STAGE / PERFORMANCE SCREEN ]
        </span>
      </div>

      <div className="overflow-x-auto touch-scroll scrollbar-none mb-4 select-none">
        <div className="min-w-fit w-full space-y-1.5 sm:space-y-2">
          {/* Row 1 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-ticker text-[10px] sm:text-xs font-bold text-neon-magenta w-7 sm:w-8 shrink-0">ROW A</span>
            <div className="flex-1 grid grid-cols-8 gap-1 sm:gap-2">
              {tilesRow1.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!t.available}
                  onClick={() => handleSelect(t)}
                  className={
                    !t.available
                      ? 'py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-asphalt-surface text-grit-dim opacity-30 cursor-not-allowed font-ticker text-[10px] sm:text-xs border border-asphalt-border touch-manipulation'
                      : selectedTile === t.id
                      ? 'pit-tile py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-acid-yellow text-asphalt-black font-ticker text-[10px] sm:text-xs font-black border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] transition-all cursor-pointer touch-manipulation'
                      : 'pit-tile py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-asphalt-card hover:bg-asphalt-border text-grit-white font-ticker text-[10px] sm:text-xs font-bold border border-grit-white/20 transition-all cursor-pointer touch-manipulation'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-ticker text-[10px] sm:text-xs font-bold text-acid-yellow w-7 sm:w-8 shrink-0">ROW B</span>
            <div className="flex-1 grid grid-cols-8 gap-1 sm:gap-2">
              {tilesRow2.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!t.available}
                  onClick={() => handleSelect(t)}
                  className={
                    !t.available
                      ? 'py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-asphalt-surface text-grit-dim opacity-30 cursor-not-allowed font-ticker text-[10px] sm:text-xs border border-asphalt-border touch-manipulation'
                      : selectedTile === t.id
                      ? 'pit-tile py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-acid-yellow text-asphalt-black font-ticker text-[10px] sm:text-xs font-black border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] transition-all cursor-pointer touch-manipulation'
                      : 'pit-tile py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-asphalt-card hover:bg-asphalt-border text-grit-white font-ticker text-[10px] sm:text-xs font-bold border border-grit-white/20 transition-all cursor-pointer touch-manipulation'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-ticker text-[10px] sm:text-xs font-bold text-grit-dim w-7 sm:w-8 shrink-0">ROW C</span>
            <div className="flex-1 grid grid-cols-8 gap-1 sm:gap-2">
              {tilesRow3.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!t.available}
                  onClick={() => handleSelect(t)}
                  className={
                    !t.available
                      ? 'py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-asphalt-surface text-grit-dim opacity-30 cursor-not-allowed font-ticker text-[10px] sm:text-xs border border-asphalt-border touch-manipulation'
                      : selectedTile === t.id
                      ? 'pit-tile py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-acid-yellow text-asphalt-black font-ticker text-[10px] sm:text-xs font-black border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] transition-all cursor-pointer touch-manipulation'
                      : 'pit-tile py-1.5 sm:py-2 min-h-[36px] flex items-center justify-center bg-asphalt-card hover:bg-asphalt-border text-grit-white font-ticker text-[10px] sm:text-xs font-bold border border-grit-white/20 transition-all cursor-pointer touch-manipulation'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs font-ticker pt-2 border-t border-asphalt-border text-grit-dim gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[10px] sm:text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-asphalt-card border border-grit-white/40" /> AVAILABLE</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-acid-yellow border border-asphalt-black" /> SELECTED</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-asphalt-surface border border-asphalt-border opacity-40" /> OCCUPIED</span>
        </div>
        <span className="text-neon-magenta font-bold text-[10px] sm:text-xs">1 SEAT SELECTED (10-MIN HOLD)</span>
      </div>

      {/* Total Calculation & Commit Button */}
      <div className="mt-4 pt-3 bg-asphalt-card p-3 border-2 border-grit-white flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="block text-[10px] font-ticker text-grit-dim uppercase">TICKET SUBTOTAL</span>
          <span className="font-display text-2xl sm:text-3xl text-acid-yellow tabular-nums">${tariff}.00 USD</span>
        </div>
        <button 
          type="button"
          onClick={handleLock}
          className="w-full sm:w-auto px-5 sm:px-6 py-2.5 min-h-[44px] bg-neon-magenta hover:bg-neon-magenta-dark text-grit-white font-display text-lg sm:text-2xl tracking-wider uppercase border-2 border-asphalt-black shadow-[3px_3px_0px_#eefc54] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer touch-manipulation"
        >
          <span>{lockedSuccess ? 'SEAT RESERVED // OPENING CHECKOUT' : 'SELECT SEAT & PROCEED'}</span>
          <span className="material-symbols-outlined text-lg">{lockedSuccess ? 'check_circle' : 'lock'}</span>
        </button>
      </div>
    </div>
  );
}

// Interactive Stacked Card Deck for Hero Section (3-4 Cards Stacked, Slide on Click)
function HeroTrendingSlideshow({ events = [], onBook }) {
  const slides = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events.slice(0, 4);
  }, [events]);

  const total = slides.length;
  const [stack, setStack] = useState([0, 1, 2, 3].slice(0, total || 4));
  const [slidingOut, setSlidingOut] = useState(false);
  const [slideDir, setSlideDir] = useState('right');
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  // Keep stack synced with total slides count
  useEffect(() => {
    if (total > 0) {
      setStack([0, 1, 2, 3].slice(0, total));
    }
  }, [total]);

  // Slide top card away and bring next card forward
  const handleSlideNext = useCallback((dir = 'right') => {
    if (slidingOut || total <= 1) return;
    setSlideDir(dir);
    setSlidingOut(true);

    setTimeout(() => {
      setStack((prev) => [...prev.slice(1), prev[0]]);
      setSlidingOut(false);
    }, 320);
  }, [slidingOut, total]);

  // Auto-slide every 2.6 seconds (paused when hovered)
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      handleSlideNext('right');
    }, 2600);
    return () => clearInterval(interval);
  }, [total, isPaused, handleSlideNext]);

  if (total === 0) return null;

  // Touch handlers for mobile phones (instant swipe & tap)
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 35) {
      handleSlideNext('left');
    } else if (diff < -35) {
      handleSlideNext('right');
    } else {
      handleSlideNext('right');
    }
    setTouchStartX(null);
  };

  const getImage = (evt) => {
    if (evt.bannerImageUrl) return evt.bannerImageUrl;
    const isCin = evt.category === 'CINEMA' || evt.category === 'MOVIE' || /imax|cinema|movie|film|screening/i.test(evt.name || '');
    if (evt.category === 'CINEMA' || isCin) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80';
    if (evt.category === 'MUSIC') return '/images/concert.jpg';
    if (evt.category === 'TECH') return '/images/tech.jpg';
    if (evt.category === 'THEATER') return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80';
    if (evt.category === 'SPORTS') return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
    return '/images/concert.jpg';
  };

  const formatSlideDate = (dateStr) => {
    if (!dateStr) return 'Oct 15 • 7:30 PM';
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      return `${weekday}, ${month} ${day} • 7:30 PM`;
    } catch {
      return dateStr;
    }
  };

  // Stack styling definitions for 4 visual layers
  const getStackStyle = (pos) => {
    if (pos === 0) {
      if (slidingOut) {
        return {
          transform: slideDir === 'left' 
            ? 'translateX(-125%) translateY(-15px) rotate(-16deg)' 
            : 'translateX(125%) translateY(-15px) rotate(16deg)',
          opacity: 0,
          zIndex: 40,
          transition: 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        };
      }
      return {
        transform: 'translateY(0px) scale(1) rotate(0deg)',
        opacity: 1,
        zIndex: 30,
        transition: 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      };
    }
    if (pos === 1) {
      return {
        transform: 'translateY(-16px) scale(0.95) rotate(1.5deg)',
        opacity: 0.88,
        zIndex: 20,
        transition: 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      };
    }
    if (pos === 2) {
      return {
        transform: 'translateY(-30px) scale(0.90) rotate(-1.5deg)',
        opacity: 0.72,
        zIndex: 10,
        transition: 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      };
    }
    return {
      transform: 'translateY(-42px) scale(0.85) rotate(0.8deg)',
      opacity: 0.55,
      zIndex: 5,
      transition: 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
    };
  };

  return (
    <div 
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md h-[410px] sm:h-[500px] md:h-[520px] pt-8 sm:pt-12 select-none touch-pan-y overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3 to 4 Cards Stacked Above Each Other */}
      {stack.map((eventIndex, pos) => {
        const current = slides[eventIndex];
        if (!current) return null;
        const isTop = pos === 0;
        const isSoldOut = current.availableSeats === 0;
        const isCinema = current.category === 'CINEMA' || current.category === 'MOVIE' || /imax|cinema|movie|film|screening/i.test(current.name || '');

        return (
          <div
            key={current.id || eventIndex}
            onClick={() => isTop && handleSlideNext('right')}
            style={getStackStyle(pos)}
            className={`absolute inset-x-0 bottom-0 top-8 sm:top-12 bg-asphalt-black border-4 ${
              isTop 
                ? (isSoldOut ? 'sold-out-monochrome border-grit-dim shadow-[6px_6px_0px_#222226]' : 'border-grit-white shadow-[6px_6px_0px_#ff1f6d]')
                : 'border-asphalt-border shadow-[4px_4px_0px_rgba(0,0,0,0.6)]'
            } flex flex-col justify-between overflow-hidden group ${isSoldOut ? 'sold-out-monochrome' : ''}`}
            title={isTop ? "Click card to slide away and reveal next show!" : ""}
          >
            {/* Top Header Bar */}
            <div className={`p-2 px-3 border-b-2 border-asphalt-black flex items-center justify-between z-10 relative ${
              isSoldOut 
                ? 'bg-asphalt-surface text-grit-white border-b-2 border-grit-dim'
                : (isTop ? 'bg-acid-yellow text-asphalt-black' : pos === 1 ? 'bg-neon-magenta text-grit-white' : 'bg-electric-cobalt text-grit-white')
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-grit-dim' : (isTop ? 'bg-neon-magenta animate-pulse' : 'bg-acid-yellow')}`} />
                <span className="font-display text-xs sm:text-sm tracking-wider uppercase font-bold">
                  {isSoldOut ? 'ARCHIVED // SOLD OUT' : (isTop ? 'TRENDING CARD' : `CARD #${eventIndex + 1}`)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isTop && (
                  <span className="font-ticker text-[9px] uppercase font-bold text-asphalt-black flex items-center gap-1 bg-acid-yellow px-1.5 py-0.5 border border-asphalt-black">
                    CLICK TO SLIDE ↗
                  </span>
                )}
                <span className="font-mono-zine text-xs font-bold bg-asphalt-black text-acid-yellow px-1.5 py-0.5">
                  0{eventIndex + 1} / 0{total}
                </span>
              </div>
            </div>

            {/* Image Area */}
            <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-asphalt-card">
              <img 
                src={getImage(current)} 
                alt={current.name} 
                className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-125' : ''}`} 
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-asphalt-black via-black/25 to-transparent" />

              {/* Diagonal SOLD OUT Stamp */}
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="bg-asphalt-black/95 text-grit-white border-2 border-grit-white px-3 py-1 font-display text-2xl tracking-widest uppercase -rotate-12 shadow-[3px_3px_0px_#000000]">
                    SOLD OUT
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span className={`font-impact text-[10px] tracking-wider uppercase px-2 py-0.5 ${isSoldOut ? 'bg-asphalt-black text-grit-white border border-grit-white' : 'bg-neon-magenta text-grit-white'} border border-asphalt-black shadow-sm`}>
                  {isCinema ? 'CINEMA & IMAX' : (current.category || 'EVENT')}
                </span>
                <span className="font-mono-zine text-[10px] font-bold px-2 py-0.5 bg-asphalt-black text-acid-yellow border border-acid-yellow/40">
                  {current.availableSeats > 0 ? `${current.availableSeats} SEATS LEFT` : 'SOLD OUT'}
                </span>
              </div>

              {/* Date Stamp */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-asphalt-black/90 px-2 py-0.5 border border-grit-white/30 text-grit-white font-mono-zine text-xs">
                <Calendar size={12} className={isSoldOut ? 'text-grit-dim' : 'text-acid-yellow'} />
                <span>{formatSlideDate(current.eventDate)}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 sm:p-4 bg-asphalt-black flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display text-lg sm:text-xl uppercase text-grit-white tracking-wide leading-tight line-clamp-2 group-hover:text-acid-yellow transition-colors mb-1">
                  {current.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs font-mono-zine text-grit-dim mb-2">
                  <MapPin size={12} className={isSoldOut ? 'text-grit-dim' : 'text-acid-yellow shrink-0'} />
                  <span className="truncate">{current.venueName || 'Main Arena'} • {current.venueAddress || current.city || 'Los Angeles, CA'}</span>
                </div>
              </div>

              {/* Price & CTA */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-t border-asphalt-border pt-1.5 text-xs font-ticker">
                  <span className="text-grit-dim">ADMISSION FROM:</span>
                  <span className={`font-display text-xl sm:text-2xl font-bold tabular-nums ${isSoldOut ? 'text-grit-white line-through opacity-70' : 'text-acid-yellow'}`}>
                    {formatPrice(current.ticketPrice, current.currency)}
                  </span>
                </div>

                {isSoldOut ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook(current);
                    }}
                    className="w-full py-2 bg-asphalt-surface hover:bg-grit-white text-grit-white hover:text-asphalt-black font-impact text-sm uppercase tracking-wider border-2 border-grit-dim hover:border-grit-white shadow-[3px_3px_0px_#222] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold active:scale-[0.98]"
                  >
                    <span>SOLD OUT // JOIN WAITLIST</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook(current);
                    }}
                    className="w-full py-2 bg-neon-magenta hover:bg-acid-yellow text-grit-white hover:text-asphalt-black font-impact text-sm uppercase tracking-wider border-2 border-asphalt-black shadow-[3px_3px_0px_#eefc54] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold active:scale-[0.98]"
                  >
                    <Ticket size={14} />
                    <span>BOOK THIS SHOW NOW</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Stack Indicators */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-asphalt-black border-t border-asphalt-border">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 transition-all ${
                    i === eventIndex ? 'w-5 bg-acid-yellow' : 'w-1.5 bg-asphalt-border'
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Eye-Catching & Clean Brutalist Event Flyer Card
function EventCard({ event, _index = 0, currentUser, onBook, onWishlist, onWaitlist, onDelete }) {
  const isSoldOut = event.availableSeats === 0;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER');
  const isCinema = event.category === 'CINEMA' || event.category === 'MOVIE' || /imax|cinema|movie|film|screening|interstellar|blade runner|oppenheimer/i.test(event.name || '');

  const movieFormat = event.movieFormat || (event.description && event.description.match(/FORMAT:\s*([^/|\n]+)/)?.[1]?.trim()) || (isCinema ? 'IMAX 3D' : null);
  const movieRuntime = event.movieRuntime || (event.description && event.description.match(/RUNTIME:\s*([^/|\n]+)/)?.[1]?.trim()) || (isCinema ? '162 min' : null);
  const movieRating = event.movieRating || (event.description && event.description.match(/RATING:\s*([A-Z0-9-]+)/)?.[1]?.trim()) || (isCinema ? 'PG-13' : null);
  const cinemaShowtimes = event.showtimes || ['11:30 AM', '02:45 PM', '06:15 PM', '09:45 PM'];

  const categoryLabel = isCinema ? 'CINEMA' : (event.category || 'EVENT');
  const categoryColor = isCinema 
    ? 'bg-neon-magenta text-grit-white' 
    : event.category === 'MUSIC' 
    ? 'bg-acid-yellow text-asphalt-black' 
    : event.category === 'THEATER' 
    ? 'bg-electric-cobalt text-grit-white' 
    : event.category === 'SPORTS' 
    ? 'bg-amber-400 text-asphalt-black' 
    : 'bg-emerald-500 text-asphalt-black';

  const getImageForEvent = (event) => {
    if (event.bannerImageUrl) return event.bannerImageUrl;
    if (event.category === 'CINEMA' || isCinema) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
    if (event.category === 'MUSIC') return '/images/concert.jpg';
    if (event.category === 'TECH') return '/images/tech.jpg';
    if (event.category === 'THEATER') return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80';
    if (event.category === 'SPORTS') return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
    return '/images/concert.jpg';
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return 'Oct 15 • 7:30 PM';
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      return `${weekday}, ${month} ${day} • 7:30 PM`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-asphalt-card border-2 relative group flex flex-col justify-between overflow-hidden transition-all duration-150 ${
      isSoldOut
        ? 'sold-out-monochrome border-grit-dim/70 shadow-[4px_4px_0px_#222226] opacity-90 hover:opacity-100'
        : 'border-grit-white shadow-[4px_4px_0px_#E2F13C] hover:shadow-[6px_6px_0px_#ff1f6d] hover:-translate-y-0.5'
    }`}>
      
      {/* 1. Artwork & Image Overlay */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-asphalt-black">
        <img 
          src={getImageForEvent(event)} 
          alt={event.name} 
          className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-125' : ''}`}
          loading="lazy"
        />
        {/* Subtle bottom gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt-card via-black/20 to-transparent" />

        {/* Diagonal Neo-Brutalist SOLD OUT Watermark Stamp */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-asphalt-black/95 text-grit-white border-2 sm:border-3 border-grit-white px-4 py-1.5 font-display text-3xl sm:text-4xl tracking-widest uppercase -rotate-12 shadow-[4px_4px_0px_#000000] flex items-center gap-2">
              <span>SOLD OUT</span>
            </div>
          </div>
        )}

        {/* Top Badges Row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`${isSoldOut ? 'bg-asphalt-black text-grit-white border-grit-white' : categoryColor} font-impact text-xs uppercase px-2.5 py-0.5 tracking-wider border border-asphalt-black shadow-sm`}>
            {categoryLabel}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {canDelete && (
              <button 
                type="button"
                onClick={onDelete}
                className="bg-danger-red/90 hover:bg-danger-red text-grit-white p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center border border-asphalt-black text-xs font-bold cursor-pointer transition-colors touch-manipulation"
                title="Remove Event"
              >
                ✕
              </button>
            )}
            <button 
              type="button"
              onClick={onWishlist}
              className="bg-asphalt-black/80 hover:bg-neon-magenta text-grit-white p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center border border-grit-white/40 text-xs cursor-pointer transition-colors touch-manipulation"
              title="Save to wishlist"
            >
              <Heart size={14} />
            </button>
          </div>
        </div>

        {/* Date & Time pill on bottom of image */}
        <div className="absolute bottom-2.5 left-2.5 bg-asphalt-black text-grit-white font-mono-zine text-xs px-2.5 py-1 border border-asphalt-border flex items-center gap-1.5">
          <Calendar size={13} className={isSoldOut ? 'text-grit-dim' : 'text-acid-yellow'} />
          <span>{formatEventDate(event.eventDate)}</span>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Cinema metadata pills (Format, Runtime, Rating) */}
          {isCinema && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {movieFormat && (
                <span className="font-impact text-[10px] tracking-wider bg-acid-yellow/15 text-acid-yellow border border-acid-yellow/40 px-1.5 py-0.5 uppercase">
                  {movieFormat}
                </span>
              )}
              {movieRuntime && (
                <span className="font-mono-zine text-[10px] text-grit-dim border border-asphalt-border bg-asphalt-surface px-1.5 py-0.5">
                  {movieRuntime}
                </span>
              )}
              {movieRating && (
                <span className="font-impact text-[10px] bg-neon-magenta text-grit-white px-1.5 py-0.5">
                  {movieRating}
                </span>
              )}
            </div>
          )}

          {/* Event Title */}
          <h3 className="font-display text-2xl uppercase tracking-wide text-grit-white group-hover:text-acid-yellow transition-colors leading-tight mb-2 line-clamp-2 break-words">
            {event.name}
          </h3>

          {/* Venue & City */}
          <div className="flex items-center gap-1.5 text-xs font-mono-zine text-grit-dim mb-2">
            <MapPin size={13} className={isSoldOut ? 'text-grit-dim' : 'text-acid-yellow shrink-0'} />
            <span className="truncate">{event.venueName || 'Main Arena'} • {event.city || event.venueAddress || 'Los Angeles, CA'}</span>
          </div>

          {/* Event Description */}
          {event.description && (
            <p className="font-mono-zine text-xs text-grit-dim line-clamp-2 leading-relaxed mb-3 break-words">
              {event.description}
            </p>
          )}
        </div>

        <div>
          {/* Cinema Showtime Selector Pills */}
          {isCinema && (
            <div className="mb-3.5 pt-2.5 border-t border-asphalt-border">
              <span className="block font-ticker text-[10px] text-grit-dim uppercase tracking-wider mb-1.5">
                SHOWTIMES // {isSoldOut ? 'ALL SESSIONS SOLD OUT:' : 'SELECT TIME:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-1">
                {cinemaShowtimes.slice(0, 4).map((time) => (
                  <button
                    key={time}
                    type="button"
                    disabled={isSoldOut}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSoldOut) onBook(time);
                    }}
                    className={`font-mono-zine text-xs sm:text-[10px] py-1.5 min-h-[34px] flex items-center justify-center border transition-colors text-center font-bold touch-manipulation ${
                      isSoldOut
                        ? 'bg-asphalt-card text-grit-dim/50 border-asphalt-border line-through cursor-not-allowed'
                        : 'bg-asphalt-surface hover:bg-acid-yellow hover:text-asphalt-black text-grit-white border-asphalt-border cursor-pointer'
                    }`}
                    title={isSoldOut ? `Showtime ${time} is sold out` : `Book ${time} showtime`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price & Seat Availability Row */}
          <div className="bg-asphalt-surface p-2.5 border border-asphalt-border mb-3 flex items-center justify-between">
            <div>
              <span className="block text-[9px] font-ticker text-grit-dim uppercase">TICKET PRICE</span>
              <span className={`font-display text-2xl font-bold leading-none tabular-nums ${isSoldOut ? 'text-grit-white line-through opacity-70' : 'text-acid-yellow'}`}>
                {formatPrice(event.ticketPrice, event.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-ticker text-grit-dim uppercase">SEATS</span>
              <span className={`font-mono-zine text-xs font-bold tabular-nums ${isSoldOut ? 'text-grit-white bg-asphalt-black px-2 py-0.5 border border-grit-dim uppercase' : 'text-grit-white'}`}>
                {isSoldOut ? 'SOLD OUT' : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    {event.availableSeats} LEFT
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {isSoldOut ? (
            <button 
              type="button"
              onClick={onWaitlist}
              className="w-full py-2.5 min-h-[44px] bg-asphalt-surface hover:bg-grit-white text-grit-white hover:text-asphalt-black font-impact text-sm uppercase tracking-wider border-2 border-grit-dim hover:border-grit-white shadow-[3px_3px_0px_#222] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold touch-manipulation"
            >
              <span>JOIN WAITLIST // SOLD OUT</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => onBook()}
              className="w-full py-2.5 min-h-[44px] bg-acid-yellow hover:bg-neon-magenta text-asphalt-black hover:text-grit-white font-impact text-base uppercase tracking-wider border-2 border-asphalt-black shadow-[3px_3px_0px_#ffffff] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold touch-manipulation"
            >
              <span>{isCinema ? 'BOOK SEATS' : 'SELECT SEATS'}</span>
              <ArrowRight size={15} />
            </button>
          )}
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
    bannerImageUrl: '/images/concert.jpg'
  },
  {
    id: 2,
    name: 'Cyberpunk 2099: Neo-Tokyo // Midnight IMAX 3D Premiere',
    description: 'Worldwide midnight cinema premiere featuring live synthesized original score and laser 3D projection.',
    category: 'CINEMA',
    movieFormat: 'IMAX 3D',
    movieRuntime: '162 min',
    movieRating: 'R-RATED',
    ticketPrice: 24.50,
    availableSeats: 90,
    eventDate: '2026-10-15',
    venueName: 'Omniplex IMAX Laser Dome',
    venueAddress: 'Los Angeles, CA',
    bannerImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    showtimes: ['11:30 AM', '02:45 PM', '06:15 PM', '09:45 PM', '11:59 PM']
  },
  {
    id: 3,
    name: 'Interstellar: 70mm Special Retrospective Presentation',
    description: 'Christopher Nolan sci-fi masterpiece presented on authentic 70mm film stock with 12-channel audio.',
    category: 'CINEMA',
    movieFormat: '70MM IMAX',
    movieRuntime: '169 min',
    movieRating: 'PG-13',
    ticketPrice: 22.00,
    availableSeats: 90,
    eventDate: '2026-11-05',
    venueName: 'Omniplex IMAX Laser Dome',
    venueAddress: 'Los Angeles, CA',
    bannerImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    showtimes: ['12:00 PM', '03:30 PM', '07:00 PM', '10:30 PM']
  },
  {
    id: 4,
    name: 'Global AI & Autonomous Tech Summit 2026',
    description: 'Keynotes from leading systems researchers, live robotics demonstrations, and engineering workshops.',
    category: 'TECH',
    ticketPrice: 299.00,
    availableSeats: 45,
    eventDate: '2026-10-02',
    venueName: 'Silicon Valley Convention Center',
    bannerImageUrl: '/images/tech.jpg'
  },
  {
    id: 5,
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
    id: 6,
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
