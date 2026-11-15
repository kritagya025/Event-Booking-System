import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import EventHubArcadeRunner from './components/EventHubArcadeRunner';

import EventCardSkeleton from './components/EventCardSkeleton';
import { 
  DiscoBallSticker, 
  TicketSticker, 
  PopcornBucketSticker, 
  CircusTentSticker,
  CinemaSeatSticker,
  SecurityShieldSticker,
  PaymentCardSticker,
  HourglassWaitlistSticker,
  ThermometerVibeSticker,
  CityLocationSticker
} from './components/CustomStickers';
import { 
  Heart, Bell, AlertCircle, Check, 
  Search, RotateCcw, Film, Layers, Ticket, Sparkles,
  Music, Theater, Laptop, Trophy, Calendar, Clock, MapPin
} from 'lucide-react';
import { apiFetch, getStoredUser, clearAuthSession } from './services/api';
import { formatPrice, subscribeCurrencyChange } from './services/currency';

// Toggle to show/hide the real-time ticket counter feature in the UI (kept false until user instructs to show)
const SHOW_REALTIME_TICKET_COUNTER = false;

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
  const [createEventInitialName, setCreateEventInitialName] = useState('');

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
  const [totalTicketsBooked, setTotalTicketsBooked] = useState(null);

  const [vibeMode, setVibeMode] = useState({
    title: '140BPM Feral Warehouse Rave! (Maximum Euphoria)',
    color: '#FF4081',
    id: 'feral'
  });
  const [selectedCategoryTag, setSelectedCategoryTag] = useState('all');

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
    { id: '', key: 'ALL', label: 'ALL PARTIES', icon: Layers },
    { id: 'MUSIC', key: 'MUSIC', label: 'NIGHTLIFE & CONCERTS', icon: Music },
    { id: 'CINEMA', key: 'CINEMA', label: 'CINEMA & LOFTS', icon: Film },
    { id: 'THEATER', key: 'THEATER', label: 'SUPPER CLUBS', icon: Theater },
    { id: 'TECH', key: 'TECH', label: 'TECH & SYNTH', icon: Laptop },
    { id: 'SPORTS', key: 'SPORTS', label: 'SUNSET SKATES', icon: Trophy },
  ], []);

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
      if (backendOnlineRef.current) {
        fetchCatalogData(true);
      }
    }, 10000);

    window.addEventListener('auth-expired', handleLogout);
    const onTicketBooked = () => fetchCatalogData(true);
    window.addEventListener('ticket-booked', onTicketBooked);
    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-expired', handleLogout);
      window.removeEventListener('ticket-booked', onTicketBooked);
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
      const [allEv, popEv, ticketsStat] = await Promise.all([
        apiFetch('/events?size=50').catch(() => null),
        apiFetch('/events/popular?limit=4').catch(() => null),
        apiFetch('/events/tickets-booked-count').catch(() => null)
      ]);

      if (ticketsStat && typeof ticketsStat.totalTicketsBooked === 'number') {
        setTotalTicketsBooked(ticketsStat.totalTicketsBooked);
      } else {
        const localBookings = JSON.parse(localStorage.getItem('my_local_bookings') || '[]');
        const localCount = localBookings.reduce((sum, b) => sum + (b.quantity || (b.seats?.length || 1)), 0);
        setTotalTicketsBooked((prev) => (prev !== null ? prev : localCount));
      }

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
      const localBookings = JSON.parse(localStorage.getItem('my_local_bookings') || '[]');
      const localCount = localBookings.reduce((sum, b) => sum + (b.quantity || (b.seats?.length || 1)), 0);
      setTotalTicketsBooked((prev) => (prev !== null ? prev : localCount));
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
    setSelectedCategoryTag('all');
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
      showToast('Event added to your wishlist', 'success');
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
      showToast('Enrolled in waitlist! We will notify you when a seat frees up.', 'success');
    } catch (err) {
      showToast(err.message || 'Already enrolled on waitlist for this event', 'info');
    }
  };

  const openBookingModal = (event, preferredShowtime = null) => {
    const targetEvent = event || popularEvents[0] || events[0] || mockEvents[0];
    if (!targetEvent) {
      showToast('No event selected', 'info');
      return;
    }
    if (!currentUser) {
      handleNavigate('login');
      showToast('Please sign in to select seats and book passes', 'info');
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
    if (params.category !== undefined) {
      const nextFilters = { ...filtersRef.current, category: params.category };
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

  // Interactive Crowd Vibe Handler
  const handleSetVibe = (name, desc, color) => {
    setVibeMode({ id: name, title: desc, color });
    showToast(`Crowd vibe changed to: ${desc}`, 'info');
  };

  // Interactive Quick Event Creation (No Emojis)
  const handleCreatePartyQuick = (e) => {
    e.preventDefault();
    const input = document.getElementById('party-name-input');
    const val = input ? input.value.trim() : '';
    if (!val) return;
    setCreateEventInitialName(val);
    setIsCreateEventOpen(true);
    showToast(`Prepping event: "${val}"! Launching box office...`, 'success');
    input.value = '';
  };

  // Category Tag Filter for Explore section
  const handleTagFilter = (catTag) => {
    setSelectedCategoryTag(catTag);
    let categoryValue = '';
    if (catTag === 'cinema') categoryValue = 'CINEMA';
    else if (catTag === 'music') categoryValue = 'MUSIC';
    else if (catTag === 'tech') categoryValue = 'TECH';
    else if (catTag === 'theater') categoryValue = 'THEATER';
    else if (catTag === 'sports') categoryValue = 'SPORTS';

    const nextFilters = { ...filters, category: categoryValue };
    setFilters(nextFilters);
    applyLiveFilter(nextFilters);
  };

  if (activeTab === 'login') {
    return (
      <div className="bg-buttercream min-h-screen text-toy-black">
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
      <div className="bg-buttercream min-h-screen text-toy-black">
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
    <div className="bg-buttercream text-toy-black antialiased relative selection:bg-bubble-pink selection:text-white min-h-screen overflow-x-hidden font-body">
      
      {/* ─── NAVIGATION HEADER ─── */}
      <Navbar 
        currentUser={currentUser}
        onNavigate={handleNavigate}
        activeTab={activeTab}
        onLogout={handleLogout}
        searchKeyword={filters.keyword}
        onSearchChange={(kw) => {
          const nextFilters = { ...filtersRef.current, keyword: kw };
          setFilters(nextFilters);
          applyLiveFilter(nextFilters);
        }}
      />

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
        <main className="w-full relative z-10 pt-6 pb-20">
          
          {/* ══════════════════════════════════════════════════════════════
              HERO SECTION: Candy-Dopamine Neo-Memphis Playground
              ══════════════════════════════════════════════════════════════ */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-12">
            
            {/* Real-time Ticket Counter Dopamine Badge (Hidden from user until instructed to show) */}
            {SHOW_REALTIME_TICKET_COUNTER && (
              <div className="flex justify-center mb-6">
                <div 
                  className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-sun-yellow border-[2.5px] border-toy-black shadow-toy select-none transition-all hover:scale-105"
                  title="Real-time ticket counter synced live with EventHub Box Office"
                >
                  {/* Live pulsing emerald beacon */}
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 border border-toy-black"></span>
                  </span>
                  
                  <Ticket className="w-4 h-4 text-toy-black shrink-0" />
                  
                  <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-toy-black">
                    {totalTicketsBooked !== null
                      ? `${Number(totalTicketsBooked).toLocaleString()} ${totalTicketsBooked === 1 ? 'TICKET' : 'TICKETS'} BOOKED THROUGH OUR WEBSITE`
                      : 'SYNCING LIVE TICKETS...'}
                  </span>
                  
                  <span className="bg-bubble-pink text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-toy-black uppercase tracking-wider">
                    REAL-TIME
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Hero Text & Quick Action */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-toy-black mb-5">
                  YOUR LIVE EVENT <br className="hidden sm:inline"/>
                  <span className="inline-block relative">
                    <span className="relative z-10 text-white drop-shadow-[4px_4px_0px_#1E1B2E] px-2 py-0.5 bg-candy-purple rounded-2xl border-[3px] border-toy-black rotate-[-2deg] inline-block mr-2">PASS JUST</span>
                  </span>
                  <span className="text-bubble-pink underline decoration-wavy decoration-sun-yellow decoration-[6px]">LEVELED UP!</span>
                </h1>

                <p className="font-body font-semibold text-lg sm:text-xl text-toy-black/80 max-w-xl mb-7 leading-relaxed bg-white/70 backdrop-blur-sm p-4 rounded-2xl border-2 border-toy-black/20 shadow-sm">
                  The joyful real-time live event & cinema ticketing playground! Reserve favorite seats on interactive auditorium maps, claim instant cryptographic QR passes, and enjoy seamless instant UPI & Rupee checkout.
                </p>

                {/* Interactive Ticket Search Box */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchAndFilter();
                    scrollToResults();
                  }}
                  className="w-full max-w-lg bg-white rounded-blob p-2.5 sm:p-3 border-[3px] border-toy-black shadow-toy-lg flex flex-col sm:flex-row items-center gap-2 mb-6 hover:shadow-pop-purple transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5 px-3 py-1 flex-1 w-full">
                    <Search className="w-5 h-5 text-toy-black/50 shrink-0 stroke-[2.5]" />
                    <input 
                      id="hero-phone-input"
                      type="text"
                      placeholder="Search concerts, IMAX premieres, tech summits..." 
                      value={filters.keyword}
                      onChange={(e) => {
                        const kw = e.target.value;
                        setFilters((prev) => ({ ...prev, keyword: kw }));
                        applyLiveFilter({ ...filters, keyword: kw });
                      }}
                      className="w-full font-body font-bold text-toy-black placeholder:text-toy-black/40 bg-transparent border-none focus:outline-none focus:ring-0 text-base"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-bubble-pink text-white font-display font-black text-base border-2 border-toy-black shadow-toy hover:bg-[#ff2a73] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center whitespace-nowrap cursor-pointer"
                  >
                    <span>Find Tickets</span>
                  </button>
                </form>

                {/* Micro Counters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border-2 border-toy-black text-xs font-display font-extrabold shadow-toy">
                    <span>50,000+ Verified Passes</span>
                  </div>
                  <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-sky-azure/30 border-2 border-toy-black text-xs font-display font-extrabold shadow-toy">
                    <span>10-Min Live Seat Hold</span>
                  </div>
                  <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-mint-pop/40 border-2 border-toy-black text-xs font-display font-extrabold shadow-toy">
                    <span>Zero Duplicate Bookings</span>
                  </div>
                </div>
              </div>

              {/* Hero Right Column: Squishy 3D Neo-Memphis Featured Event Card */}
              <div className="lg:col-span-5 relative w-full flex justify-center">
                {/* Backing pastel shadow block */}
                <div className="absolute inset-0 bg-sky-azure rounded-[36px] border-[3.5px] border-toy-black transform rotate-3 translate-x-2 translate-y-3 pointer-events-none"></div>
                
                {/* Main Card Container */}
                <div className="relative w-full max-w-md bg-white rounded-[32px] border-[3.5px] border-toy-black p-5 shadow-toy-xl flex flex-col gap-4">
                  
                  {/* Event Visual Container with Sticker Pins */}
                  <div className="relative w-full h-56 rounded-2xl border-[2.5px] border-toy-black overflow-hidden bg-candy-purple/10">
                    <img 
                      src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80" 
                      alt="Cyberpunk 2099 IMAX Premiere" 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Floating Pill Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-sun-yellow text-toy-black text-xs font-display font-black px-2.5 py-1 rounded-full border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] flex items-center gap-1.5">
                        <Film size={12} className="text-toy-black" />
                        <span>IMAX 3D PREMIERE</span>
                      </span>
                    </div>

                    {/* Bespoke Custom Popcorn Bucket Sticker */}
                    <div className="absolute -bottom-2.5 right-3 w-12 h-12 bg-white rounded-full border-2 border-toy-black shadow-toy flex items-center justify-center rotate-6 select-none p-1">
                      <PopcornBucketSticker size={30} />
                    </div>
                  </div>

                  {/* Card Headline & Details */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 bg-lilac-wash px-2.5 py-1 rounded-full border border-toy-black">
                        <MapPin size={12} className="text-candy-purple shrink-0" />
                        <span className="font-display font-extrabold text-xs text-toy-black truncate max-w-[160px]">
                          PVR INOX Laser IMAX Dome
                        </span>
                      </div>
                      <span className="font-display font-black text-xs text-candy-purple uppercase tracking-wider">Mumbai, MH</span>
                    </div>

                    <h2 className="font-display font-black text-xl leading-snug text-toy-black mt-1">
                      Cyberpunk 2099: Midnight IMAX 3D Premiere
                    </h2>

                    <div className="flex items-center gap-2 text-toy-black/70 font-body font-bold text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-toy-black/60 shrink-0" /> Friday, Oct 24
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-toy-black/60 shrink-0" /> 9:00 PM IST
                      </span>
                      <span>•</span>
                      <span className="text-bubble-pink font-extrabold">162 min</span>
                    </div>
                  </div>

                  {/* Interactive Showtime Selection Pills */}
                  <div className="bg-buttercream p-2.5 rounded-2xl border-2 border-toy-black">
                    <div className="flex items-center justify-between text-xs font-display font-black text-toy-black mb-2 px-1">
                      <span>SELECT SHOWTIME</span>
                      <span className="text-bubble-pink">90 Seats Available</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['11:30 AM', '02:45 PM', '06:15 PM', '09:45 PM'].map((st) => (
                        <button 
                          key={st}
                          type="button"
                          onClick={() => openBookingModal(popularEvents[0] || events[1] || events[0] || mockEvents[1], st)}
                          className="py-1.5 px-1 rounded-xl font-display font-bold text-xs border-2 border-toy-black bg-white hover:bg-sun-yellow hover:scale-105 active:scale-95 transition-all text-center cursor-pointer shadow-[2px_2px_0px_#1E1B2E]"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Action Button */}
                  <button 
                    type="button"
                    onClick={() => openBookingModal(popularEvents[0] || events[1] || events[0] || mockEvents[1])}
                    className="w-full py-3 rounded-full bg-sun-yellow hover:bg-[#ffe142] text-toy-black font-display font-black text-sm uppercase tracking-wider border-2 border-toy-black shadow-toy hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket size={16} />
                    <span>SELECT SEATS & BOOK TICKETS</span>
                  </button>

                </div>
              </div>

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              WAVY NEO-MEMPHIS SECTION DIVIDER 1
              ══════════════════════════════════════════════════════════════ */}
          <div className="w-full overflow-hidden leading-none -mb-1">
            <svg className="relative block w-full h-12 sm:h-16 text-white fill-current" preserveAspectRatio="none" viewBox="0 0 1200 120">
              <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"></path>
            </svg>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              QUICK CREATOR ARCADE BAR (ZERO EMOJIS, HIGH-LEVEL DESIGN)
              ══════════════════════════════════════════════════════════════ */}
          <section className="w-full bg-white py-10 border-y-[3.5px] border-toy-black relative" id="creator-box">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
              <div className="bg-buttercream rounded-[30px] border-[3px] border-toy-black p-6 sm:p-8 shadow-toy-lg flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
                
                {/* Decorative Background Shape */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-sun-yellow/40 border-2 border-toy-black -z-0 pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-bubble-pink text-white border-[2.5px] border-toy-black shadow-toy flex items-center justify-center shrink-0 rotate-[-4deg] p-1">
                    <CircusTentSticker size={44} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-display font-black uppercase text-candy-purple tracking-wider">
                      <span>Fast Box Office Launch</span>
                      <span className="bg-sun-yellow px-2 py-0.5 rounded-full border border-toy-black text-toy-black">60 SECONDS</span>
                    </div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-toy-black">
                      Launch Your Event Box Office in Seconds!
                    </h3>
                    <p className="font-body font-semibold text-sm text-toy-black/70">
                      Concert promoters, theater hosts, cinema curators — set up real-time seating and sell passes instantly.
                    </p>
                  </div>
                </div>

                {/* Quick Event Create Form (No Emojis) */}
                <form 
                  onSubmit={handleCreatePartyQuick}
                  className="w-full lg:w-auto flex-1 max-w-lg flex flex-col sm:flex-row items-stretch gap-2.5 relative z-10"
                >
                  <div className="relative flex-1 bg-white rounded-full border-2 border-toy-black px-5 py-3 flex items-center shadow-inner">
                    <input 
                      id="party-name-input"
                      type="text" 
                      placeholder="e.g. Electric Symphony World Tour 2026..." 
                      required 
                      className="w-full font-body font-bold text-toy-black placeholder:text-toy-black/40 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-7 py-3 rounded-full bg-sun-yellow hover:bg-[#ffe142] text-toy-black font-display font-black text-sm uppercase tracking-wide border-2 border-toy-black shadow-toy hover:-translate-y-0.5 active:translate-y-0.5 transition-all whitespace-nowrap flex items-center justify-center cursor-pointer"
                  >
                    <span>Create Event</span>
                  </button>
                </form>

              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              WAVY NEO-MEMPHIS SECTION DIVIDER 2
              ══════════════════════════════════════════════════════════════ */}
          <div className="w-full overflow-hidden leading-none -mt-1 mb-6 rotate-180">
            <svg className="relative block w-full h-10 sm:h-14 text-white fill-current" preserveAspectRatio="none" viewBox="0 0 1200 120">
              <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"></path>
            </svg>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TOYBOX FEATURE CLUSTER: 4 Bubbly Bento Candy Cards
              ══════════════════════════════════════════════════════════════ */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8" id="tools">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display font-black text-3xl sm:text-5xl text-toy-black tracking-tight">
                Everything You Need For Seamless Live Ticketing
              </h2>
              <p className="font-body font-semibold text-toy-black/75 mt-2 text-base sm:text-lg">
                Toss clunky legacy ticketing portals in the bin. Here are your toybox tools for unforgettable concerts, cinema, and live summits.
              </p>
            </div>

            {/* 4 Staggered Bubbly Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Tool 1: Interactive Seat Map */}
              <div className="bg-white rounded-[28px] border-[3px] border-toy-black p-6 shadow-toy flex flex-col hover:shadow-pop-pink hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-bubble-pink/20 border-2 border-toy-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#1E1B2E]">
                  <CinemaSeatSticker size={36} />
                </div>
                <h3 className="font-display font-black text-xl text-toy-black mt-1 mb-2">Live Canvas Seat Map</h3>
                <p className="font-body font-semibold text-sm text-toy-black/70 leading-relaxed">
                  Pick exact VIP front-row, orchestra center, or balcony seats in real-time with an automatic 10-minute cart lock.
                </p>
              </div>

              {/* Tool 2: Cryptographic QR Gate Pass */}
              <div className="bg-white rounded-[28px] border-[3px] border-toy-black p-6 shadow-toy flex flex-col hover:shadow-pop-purple hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-candy-purple/20 border-2 border-toy-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#1E1B2E]">
                  <SecurityShieldSticker size={36} />
                </div>
                <h3 className="font-display font-black text-xl text-toy-black mt-1 mb-2">Cryptographic QR Passes</h3>
                <p className="font-body font-semibold text-sm text-toy-black/70 leading-relaxed">
                  Tamper-proof digital tickets with instant organizer gate scanner validation. Apple Wallet ready with zero duplicate entries.
                </p>
              </div>

              {/* Tool 3: Instant UPI & Rupee Checkout */}
              <div className="bg-white rounded-[28px] border-[3px] border-toy-black p-6 shadow-toy flex flex-col hover:shadow-pop-mint hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-mint-pop/30 border-2 border-toy-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#1E1B2E]">
                  <PaymentCardSticker size={36} />
                </div>
                <h3 className="font-display font-black text-xl text-toy-black mt-1 mb-2">Instant UPI & Rupee Checkout</h3>
                <p className="font-body font-semibold text-sm text-toy-black/70 leading-relaxed">
                  Seamless domestic settlement in Indian Rupees (₹). Pay with UPI QR, Google Pay, PhonePe, Paytm, Net Banking, or RuPay with zero hidden fees.
                </p>
              </div>

              {/* Tool 4: Waitlist Auto-Promotion */}
              <div className="bg-white rounded-[28px] border-[3px] border-toy-black p-6 shadow-toy flex flex-col hover:shadow-pop-azure hover:-translate-y-1 transition-all duration-300" id="photo-booth">
                <div className="w-14 h-14 rounded-2xl bg-sky-azure/30 border-2 border-toy-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#1E1B2E]">
                  <HourglassWaitlistSticker size={36} />
                </div>
                <h3 className="font-display font-black text-xl text-toy-black mt-1 mb-2">Waitlist Auto-Promotion</h3>
                <p className="font-body font-semibold text-sm text-toy-black/70 leading-relaxed">
                  Sold-out shows? Join the automated waitlist queue. When an attendee cancels, waitlisted fans are automatically promoted into open seats!
                </p>
              </div>

            </div>

            {/* INTERACTIVE EVENT CROWD VIBE METER WIDGET */}
            <div className="mt-10 bg-white rounded-blob border-[3px] border-toy-black p-6 sm:p-8 shadow-toy-lg flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-sun-yellow border-2 border-toy-black shadow-toy flex items-center justify-center shrink-0">
                  <ThermometerVibeSticker size={38} />
                </div>
                <div>
                  <h4 className="font-display font-black text-xl sm:text-2xl text-toy-black">
                    Interactive Crowd Vibe Meter
                  </h4>
                  <p className="font-body font-semibold text-sm text-toy-black/70">
                    Dial the venue crowd energy from "Acoustic & Cozy" to "Intergalactic Arena Euphoria"!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button 
                  type="button"
                  onClick={() => handleSetVibe('chill', 'Low-Fi Acoustic & Unplugged', '#00D2FF')}
                  className={`vibe-btn px-4 py-2 rounded-full border-2 border-toy-black font-display font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    vibeMode.id === 'chill' ? 'bg-sky-azure text-toy-black shadow-toy' : 'bg-buttercream'
                  }`}
                >
                  Acoustic
                </button>

                <button 
                  type="button"
                  onClick={() => handleSetVibe('dinner', 'Broadway Musical & Intimate Jazz', '#FF7E67')}
                  className={`vibe-btn px-4 py-2 rounded-full border-2 border-toy-black font-display font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    vibeMode.id === 'dinner' ? 'bg-coral-peach text-white shadow-toy' : 'bg-buttercream'
                  }`}
                >
                  Jazz & Theater
                </button>

                <button 
                  type="button"
                  onClick={() => handleSetVibe('disco', 'Retro Synth & Electric Disco', '#8B5CF6')}
                  className={`vibe-btn px-4 py-2 rounded-full border-2 border-toy-black font-display font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    vibeMode.id === 'disco' ? 'bg-candy-purple text-white shadow-toy' : 'bg-buttercream'
                  }`}
                >
                  Indie & Synth
                </button>

                <button 
                  type="button"
                  onClick={() => handleSetVibe('feral', '140BPM Sold-Out Arena Rave!', '#FF4081')}
                  className={`vibe-btn px-4 py-2 rounded-full border-2 border-toy-black font-display font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    vibeMode.id === 'feral' ? 'bg-bubble-pink text-white shadow-toy' : 'bg-buttercream'
                  }`}
                >
                  Stadium Anthem!
                </button>
              </div>
            </div>

          </section>

          {/* ══════════════════════════════════════════════════════════════
              EXPLORE SECTION: Candy Filter Chips & Trending Event Cards
              ══════════════════════════════════════════════════════════════ */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12" id="explore" ref={catalogRef}>
            
            {/* Section Top Nav */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sun-yellow border-2 border-toy-black text-xs font-display font-black text-toy-black uppercase tracking-wider mb-2 shadow-sm">
                <span>Live Box Office Radar</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-toy-black tracking-tight">
                Trending Live Events & Screenings
              </h2>
            </div>

            {/* Real Search & Category Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-[28px] border-[3px] border-toy-black shadow-toy mb-8">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSearchAndFilter(); }} 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center"
              >
                {/* Keyword */}
                <div className="bg-buttercream border-2 border-toy-black rounded-full px-4 py-2 flex flex-col justify-between">
                  <label htmlFor="search-keyword" className="text-[10px] uppercase font-black text-toy-black/70">
                    EVENT / ARTIST / MOVIE
                  </label>
                  <input 
                    id="search-keyword"
                    type="text" 
                    placeholder="e.g. Cyberpunk, IMAX, Symphony..." 
                    value={filters.keyword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters({ ...filters, keyword: val });
                      applyLiveFilter({ ...filters, keyword: val });
                    }}
                    className="bg-transparent text-sm font-bold text-toy-black placeholder:text-toy-black/40 focus:outline-none w-full border-none p-0" 
                  />
                </div>

                {/* Category Dropdown */}
                <div className="bg-buttercream border-2 border-toy-black rounded-full px-4 py-2 flex flex-col justify-between relative">
                  <label htmlFor="search-category" className="text-[10px] uppercase font-black text-toy-black/70">
                    CATEGORY
                  </label>
                  <select 
                    id="search-category"
                    value={filters.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const nextFilters = { ...filters, category: cat };
                      setFilters(nextFilters);
                      handleSearchAndFilter(nextFilters);
                    }}
                    className="bg-transparent text-sm font-bold text-toy-black focus:outline-none w-full cursor-pointer appearance-none border-none p-0 pr-6"
                  >
                    <option value="" className="bg-white text-toy-black">ALL EVENTS & SHOWS</option>
                    <option value="CINEMA" className="bg-white text-toy-black">CINEMA & IMAX SCREENINGS</option>
                    <option value="MUSIC" className="bg-white text-toy-black">LIVE CONCERTS & FESTIVALS</option>
                    <option value="THEATER" className="bg-white text-toy-black">THEATER & BROADWAY</option>
                    <option value="TECH" className="bg-white text-toy-black">TECH SUMMITS & HACKATHONS</option>
                    <option value="SPORTS" className="bg-white text-toy-black">SPORTS & ARENA RACING</option>
                  </select>
                  <span className="material-symbols-outlined text-toy-black pointer-events-none absolute right-3 bottom-2 text-sm font-black">arrow_drop_down</span>
                </div>

                {/* City */}
                <div className="bg-buttercream border-2 border-toy-black rounded-full px-4 py-2 flex flex-col justify-between">
                  <label htmlFor="search-city" className="text-[10px] uppercase font-black text-toy-black/70">
                    CITY / VENUE
                  </label>
                  <input 
                    id="search-city"
                    type="text" 
                    placeholder="e.g. Mumbai, Bengaluru, Delhi NCR, Goa..." 
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="bg-transparent text-sm font-bold text-toy-black placeholder:text-toy-black/40 focus:outline-none w-full border-none p-0" 
                  />
                </div>

                {/* Action Buttons */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 h-[48px] bg-sun-yellow hover:bg-[#ffe142] text-toy-black border-2 border-toy-black shadow-toy rounded-full flex items-center justify-center gap-2 text-xs font-display font-black uppercase transition-all cursor-pointer"
                  >
                    <span>SEARCH EVENTS</span>
                    <Search size={15} />
                  </button>
                  {hasActiveFilters(filters) && (
                    <button 
                      type="button"
                      onClick={handleClearSearch}
                      className="w-[48px] h-[48px] bg-white hover:bg-buttercream text-toy-black border-2 border-toy-black rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-toy"
                      title="Clear filters"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>
              </form>

              {/* Category Pills Strip */}
              <div className="mt-3 pt-3 border-t-2 border-dashed border-toy-black/20 flex flex-wrap items-center gap-2 text-xs">
                {categories.map((cat) => {
                  const isActive = (filters.category || '') === cat.id;
                  const count = categoryCounts[cat.key] ?? 0;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        const nextFilters = { ...filters, category: cat.id };
                        setFilters(nextFilters);
                        handleSearchAndFilter(nextFilters);
                      }}
                      className={`px-3.5 py-1.5 rounded-full font-display font-bold text-xs border-2 border-toy-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isActive 
                          ? 'bg-candy-purple text-white shadow-toy' 
                          : 'bg-buttercream hover:bg-white text-toy-black'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full border border-toy-black font-black ${
                        isActive ? 'bg-sun-yellow text-toy-black' : 'bg-white text-toy-black'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Cards in Playful Neo-Memphis Style */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white border-[3px] border-toy-black rounded-[32px] p-10 text-center text-toy-black shadow-toy-lg">
                <div className="flex justify-center mb-3">
                  <TicketSticker size={52} />
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl mb-2">No Events Discovered Yet</h3>
                <p className="text-sm font-semibold text-toy-black/70 mb-6 max-w-sm mx-auto">
                  No live events matched your criteria. Try adjusting your keyword or city filter!
                </p>
                <button 
                  type="button"
                  onClick={handleClearSearch} 
                  className="px-6 py-2.5 rounded-full bg-sun-yellow text-toy-black border-2 border-toy-black shadow-toy font-display font-black text-xs uppercase hover:bg-[#ffe142] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="parties-container">
                {events.map((event, idx) => (
                  <NeoMemphisPartyCard 
                    key={event.id}
                    event={event}
                    index={idx}
                    currentUser={currentUser}
                    onBook={(preferredShowtime) => openBookingModal(event, preferredShowtime)}
                    onWishlist={(e) => handleToggleWishlist(event.id, e)}
                    onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
                    onDelete={(e) => handleDeleteEvent(event.id, event.name, e)}
                  />
                ))}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                NEO-MEMPHIS LIVE CITY RADAR & LOCATION HUB
                ══════════════════════════════════════════════════════════════ */}
            <div className="mt-10 bg-lilac-wash rounded-3xl border-[3px] border-toy-black p-6 sm:p-8 shadow-toy flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Left: Custom Design Asset & Context Heading */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white border-[3px] border-toy-black shadow-toy flex items-center justify-center shrink-0 p-2 hover:rotate-3 transition-transform">
                    <CityLocationSticker size={64} className="w-full h-full" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint-pop border-2 border-toy-black text-[10px] font-display font-black uppercase text-toy-black shadow-[2px_2px_0px_#1E1B2E]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-toy-black"></span>
                        PAN-INDIA RADAR ACTIVE
                      </span>
                      {filters.city && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sun-yellow border-2 border-toy-black text-[10px] font-display font-black uppercase text-toy-black shadow-[2px_2px_0px_#1E1B2E]">
                          FILTER: {filters.city}
                          <button
                            type="button"
                            onClick={() => {
                              const nextFilters = { ...filters, city: '' };
                              setFilters(nextFilters);
                              handleSearchAndFilter(nextFilters);
                              showToast('Cleared city filter — showing all cities!', 'info');
                            }}
                            className="ml-1 hover:text-bubble-pink cursor-pointer font-black"
                            title="Clear city"
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-black text-xl sm:text-2xl text-toy-black tracking-tight">
                      Looking for live shows in your city?
                    </h4>
                    <p className="font-body font-semibold text-xs sm:text-sm text-toy-black/75 mt-0.5 max-w-2xl">
                      From intimate indie concerts to IMAX midnight premieres across India (Mumbai, Bengaluru, Delhi NCR, Hyderabad, Goa & more). Tap your hub to filter instantly:
                    </p>
                  </div>
                </div>

                {/* Right: Browse All Cities Action */}
                <div className="shrink-0 self-start md:self-center">
                  <button 
                    type="button"
                    onClick={() => {
                      const nextFilters = { ...filters, city: '' };
                      setFilters(nextFilters);
                      handleSearchAndFilter(nextFilters);
                      showToast('Showing events across all Indian cities!', 'info');
                    }}
                    className={`px-5 py-2.5 rounded-full font-display font-black text-xs uppercase tracking-wider border-2 border-toy-black shadow-toy transition-all whitespace-nowrap cursor-pointer ${
                      !filters.city 
                        ? 'bg-toy-black text-white hover:bg-toy-black/80' 
                        : 'bg-white hover:bg-buttercream text-toy-black hover:-translate-y-0.5 active:translate-y-0.5'
                    }`}
                  >
                    View All Shows ➔
                  </button>
                </div>
              </div>

              {/* Quick City Hub Selector Pills */}
              <div className="pt-2 border-t-2 border-toy-black/15 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-display font-black uppercase text-toy-black/60 mr-1 tracking-wide">
                  SELECT CITY:
                </span>
                {[
                  { name: 'All India', value: '' },
                  { name: 'Mumbai', value: 'Mumbai' },
                  { name: 'Bengaluru', value: 'Bengaluru' },
                  { name: 'Delhi NCR', value: 'Delhi' },
                  { name: 'Hyderabad', value: 'Hyderabad' },
                  { name: 'Goa', value: 'Goa' },
                  { name: 'Pune', value: 'Pune' },
                ].map((cityItem) => {
                  const isSelected = (!filters.city && cityItem.value === '') || 
                    (filters.city && cityItem.value && filters.city.toLowerCase().includes(cityItem.value.toLowerCase()));

                  return (
                    <button
                      key={cityItem.name}
                      type="button"
                      onClick={() => {
                        const nextFilters = { ...filters, city: cityItem.value };
                        setFilters(nextFilters);
                        handleSearchAndFilter(nextFilters);
                        showToast(
                          cityItem.value ? `Exploring live events in ${cityItem.name}!` : 'Showing events across all Indian cities!', 
                          'info'
                        );
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black uppercase tracking-wide border-2 border-toy-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sun-yellow text-toy-black shadow-toy scale-105'
                          : 'bg-white text-toy-black hover:bg-buttercream hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#1E1B2E]'
                      }`}
                    >
                      {cityItem.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

          {/* ══════════════════════════════════════════════════════════════
              EVENTHUB ARCADE RUNNER: Mario-Inspired Box Office Game Box
              ══════════════════════════════════════════════════════════════ */}
          <EventHubArcadeRunner />

        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FLOATING BOTTOM ACTION CAPSULE
          ══════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full border-[3px] border-toy-black px-4 py-2.5 shadow-toy-lg flex items-center gap-3 sm:gap-6 max-w-md w-full justify-between hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-3 h-3 rounded-full bg-mint-pop border border-toy-black animate-ping shrink-0"></span>
            <span className="font-display font-black text-xs sm:text-sm text-toy-black truncate">Ready to reserve your seats?</span>
          </div>
          <button 
            type="button"
            onClick={() => {
              const el = document.getElementById('explore');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else handleNavigate('home');
            }}
            className="px-5 py-2 rounded-full bg-bubble-pink text-white font-display font-black text-xs uppercase tracking-wide border-2 border-toy-black shadow-toy hover:bg-[#ff2a73] active:translate-y-0.5 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Ticket size={14} />
            <span>Find Tickets</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NEO-MEMPHIS FOOTER
          ══════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-toy-black text-buttercream border-t-[3.5px] border-toy-black pt-12 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sun-yellow border-2 border-toy-black flex items-center justify-center shadow-toy">
              <TicketSticker size={25} />
            </div>
            <div>
              <span className="font-display font-black text-2xl tracking-tight text-white">EventHub</span>
              <p className="font-body font-medium text-xs text-buttercream/60">Real-time live event ticketing & seat reservation platform.</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 font-display font-bold text-xs uppercase tracking-wider text-buttercream/80">
            <a 
              href="#explore" 
              onClick={(e) => { e.preventDefault(); scrollToResults(); }}
              className="hover:text-sun-yellow transition-colors"
            >
              Explore Events
            </a>
            <a 
              href="#creator-box" 
              onClick={(e) => { 
                e.preventDefault(); 
                document.getElementById('creator-box')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-mint-pop transition-colors"
            >
              Box Office Launch
            </a>
            <a 
              href="#terms" 
              onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }}
              className="hover:text-candy-purple transition-colors"
            >
              Terms
            </a>
            <a 
              href="#privacy" 
              onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}
              className="hover:text-bubble-pink transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#status" 
              onClick={(e) => { e.preventDefault(); setIsSystemStatusOpen(true); }}
              className="hover:text-mint-pop transition-colors"
            >
              Status
            </a>
            <a 
              href="#docs" 
              onClick={(e) => { e.preventDefault(); setIsApiDocsOpen(true); }}
              className="hover:text-sky-azure transition-colors"
            >
              API Docs
            </a>
            <a 
              href="#cookies" 
              onClick={(e) => { e.preventDefault(); setIsCookiesOpen(true); }}
              className="hover:text-sun-yellow transition-colors"
            >
              Cookies
            </a>
          </div>

          {/* Copyright Pill */}
          <div className="text-xs font-body font-semibold text-buttercream/60 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
            © 2026 EventHub Inc. • Keep it joyful.
          </div>
        </div>
      </footer>

      {/* ─── MODALS ─── */}
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
        initialName={createEventInitialName}
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

      {/* ─── TOAST NOTIFICATIONS ─── */}
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

// ─────────────────────────────────────────────────────────────
// Neo-Memphis Event Card Component
// ─────────────────────────────────────────────────────────────
function NeoMemphisPartyCard({ 
  event, 
  index = 0, 
  currentUser, 
  onBook, 
  onWishlist, 
  onWaitlist, 
  onDelete 
}) {
  const isSoldOut = event.availableSeats === 0;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER');
  const isCinema = event.category === 'CINEMA' || event.category === 'MOVIE' || /imax|cinema|movie|film|screening/i.test(event.name || '');

  // Card shadow / button color rotation
  const colorThemes = [
    { popShadow: 'hover:shadow-pop-purple', rsvpBg: 'bg-candy-purple text-white hover:bg-bubble-pink', dateColor: 'text-candy-purple' },
    { popShadow: 'hover:shadow-pop-pink', rsvpBg: 'bg-bubble-pink text-white hover:bg-candy-purple', dateColor: 'text-bubble-pink' },
    { popShadow: 'hover:shadow-pop-azure', rsvpBg: 'bg-sky-azure text-toy-black hover:bg-sun-yellow', dateColor: 'text-sky-azure' },
    { popShadow: 'hover:shadow-pop-mint', rsvpBg: 'bg-mint-pop text-toy-black hover:bg-sun-yellow', dateColor: 'text-mint-pop' }
  ];
  const theme = colorThemes[index % colorThemes.length];

  const getImageForEvent = (ev) => {
    if (ev.bannerImageUrl) return ev.bannerImageUrl;
    if (ev.category === 'CINEMA' || isCinema) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80';
    if (ev.category === 'MUSIC') return '/images/concert.jpg';
    if (ev.category === 'TECH') return '/images/tech.jpg';
    if (ev.category === 'THEATER') return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80';
    if (ev.category === 'SPORTS') return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
    return '/images/concert.jpg';
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return 'Fri, Oct 24 • 8:00 PM';
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      return `${weekday}, ${month} ${day} • 8:00 PM`;
    } catch {
      return dateStr;
    }
  };

  const showtimes = event.showtimes || (isCinema ? ['11:30 AM', '02:45 PM', '06:15 PM', '09:45 PM'] : null);

  return (
    <div className={`party-card bg-white rounded-[26px] border-[3px] border-toy-black shadow-toy overflow-hidden flex flex-col justify-between ${theme.popShadow} hover:-translate-y-1 transition-all duration-300`}>
      <div>
        {/* Top Image Box */}
        <div className="relative w-full h-48 bg-toy-black border-b-[2.5px] border-toy-black overflow-hidden">
          <img 
            src={getImageForEvent(event)} 
            alt={event.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
            loading="lazy"
          />

          {/* Top Right Price Tag */}
          <div className="absolute top-2.5 right-2.5 bg-sun-yellow text-toy-black font-display font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]">
            {isSoldOut ? 'SOLD OUT' : formatPrice(event.ticketPrice, event.currency)}
          </div>

          {/* Top Left Wishlist / Admin Delete */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <button 
              type="button"
              onClick={onWishlist}
              className="w-7 h-7 rounded-full bg-white text-toy-black border-2 border-toy-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[1.5px_1.5px_0px_#1E1B2E] cursor-pointer"
              title="Save to Wishlist"
            >
              <Heart size={13} className="text-bubble-pink fill-bubble-pink/20" />
            </button>
            {canDelete && (
              <button 
                type="button"
                onClick={onDelete}
                className="w-7 h-7 rounded-full bg-coral-peach text-white border-2 border-toy-black flex items-center justify-center font-black text-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Remove Event"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bottom Left Category / Format Pill */}
          <div className="absolute bottom-2.5 left-2.5 bg-white text-toy-black font-display font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-toy-black shadow-sm flex items-center gap-1">
            <span>{event.movieFormat || event.category || 'EVENT'}</span>
          </div>

          {/* Bottom Right Available Seats */}
          <div className="absolute bottom-2.5 right-2.5 bg-toy-black text-white font-display font-black text-xs px-2.5 py-0.5 rounded-full border border-white/50 shadow-sm flex items-center gap-1">
            {!isSoldOut && <span className="w-2 h-2 rounded-full bg-mint-pop animate-pulse"></span>}
            <span>{isSoldOut ? 'SOLD OUT' : `${event.availableSeats ?? 90} LEFT`}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col gap-1.5">
          <span className={`text-xs font-display font-black ${theme.dateColor}`}>
            {formatEventDate(event.eventDate)}
          </span>
          <h3 className="font-display font-black text-lg text-toy-black leading-snug line-clamp-2">
            {event.name}
          </h3>
          <p className="font-body font-semibold text-xs text-toy-black/60 truncate">
            {event.venueAddress || event.venueName || 'Main Arena'}
          </p>

          {/* Quick Showtime Selector for Cinema */}
          {showtimes && (
            <div className="mt-2 pt-2 border-t border-dashed border-toy-black/20">
              <span className="block text-[10px] font-display font-black uppercase text-toy-black/60 mb-1">
                Showtimes:
              </span>
              <div className="flex flex-wrap gap-1">
                {showtimes.slice(0, 3).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onBook(st)}
                    className="px-2 py-0.5 rounded-md bg-buttercream border border-toy-black text-[10px] font-display font-bold hover:bg-sun-yellow transition-colors cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-dashed border-toy-black/20 pt-3 mt-1">
        <span className="text-xs font-display font-extrabold text-toy-black truncate max-w-[120px]">
          {event.venueName ? event.venueName.slice(0, 14) : 'EventHub Box Office'}
        </span>
        
        {isSoldOut ? (
          <button 
            type="button"
            onClick={onWaitlist}
            className="px-3 py-1.5 rounded-full bg-sun-yellow text-toy-black font-display font-black text-xs border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Waitlist
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => onBook()}
            className={`px-4 py-1.5 rounded-full font-display font-black text-xs border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] hover:scale-105 active:scale-95 transition-all cursor-pointer ${theme.rsvpBg}`}
          >
            {isCinema ? 'Book Seats' : 'Select Seats'}
          </button>
        )}
      </div>
    </div>
  );
}

// Fallback Mock Events (India Region)
const mockEvents = [
  {
    id: 1,
    name: 'Neon Horizon Cyber Music Festival 2026',
    description: 'Immersive electronic music event featuring holographic stages and world-class performances.',
    category: 'MUSIC',
    ticketPrice: 2499.00,
    currency: 'INR',
    availableSeats: 120,
    eventDate: '2026-09-15',
    venueName: 'Jio World Garden, BKC',
    venueAddress: 'Bandra Kurla Complex, Mumbai, Maharashtra',
    bannerImageUrl: '/images/concert.jpg'
  },
  {
    id: 2,
    name: 'Cyberpunk 2099: Neo-Tokyo // Midnight IMAX 3D Premiere',
    description: 'Worldwide midnight cinema premiere featuring live synthesized original score and laser 3D projection.',
    category: 'CINEMA',
    movieFormat: 'IMAX 3D',
    movieRuntime: '162 min',
    movieRating: 'U/A',
    ticketPrice: 550.00,
    currency: 'INR',
    availableSeats: 90,
    eventDate: '2026-10-15',
    venueName: 'PVR INOX Laser IMAX, Phoenix Palladium',
    venueAddress: 'Lower Parel, Mumbai, Maharashtra',
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
    movieRating: 'U/A',
    ticketPrice: 650.00,
    currency: 'INR',
    availableSeats: 90,
    eventDate: '2026-11-05',
    venueName: 'PVR INOX IMAX, Forum South City Mall',
    venueAddress: 'Koramangala, Bengaluru, Karnataka',
    bannerImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    showtimes: ['12:00 PM', '03:30 PM', '07:00 PM', '10:30 PM']
  },
  {
    id: 4,
    name: 'Global AI & Autonomous Tech Summit 2026',
    description: 'Keynotes from leading systems researchers, live robotics demonstrations, and engineering workshops.',
    category: 'TECH',
    ticketPrice: 4999.00,
    currency: 'INR',
    availableSeats: 45,
    eventDate: '2026-10-02',
    venueName: 'Bangalore International Exhibition Centre (BIEC)',
    venueAddress: 'Tumkur Road, Bengaluru, Karnataka',
    bannerImageUrl: '/images/tech.jpg'
  },
  {
    id: 5,
    name: 'Phantom of the Opera: Broadway Revival',
    description: 'Award-winning musical production with orchestral accompaniment and live staging.',
    category: 'THEATER',
    ticketPrice: 3500.00,
    currency: 'INR',
    availableSeats: 0,
    eventDate: '2026-11-20',
    venueName: 'Nita Mukesh Ambani Cultural Centre (NMACC)',
    venueAddress: 'BKC, Mumbai, Maharashtra',
    bannerImageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    name: 'Grand Prix eSports World Championship',
    description: 'Simulator racing championship featuring verified competitive telemetry and live finals.',
    category: 'SPORTS',
    ticketPrice: 1200.00,
    currency: 'INR',
    availableSeats: 300,
    eventDate: '2026-12-05',
    venueName: 'Hyderabad International Convention Centre (HICC)',
    venueAddress: 'Hitec City, Hyderabad, Telangana',
    bannerImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
  }
];
