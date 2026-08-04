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
import IntroSplashScreen from './components/IntroSplashScreen';
import TermsModal from './components/TermsModal';
import PrivacyModal from './components/PrivacyModal';
import SystemStatusModal from './components/SystemStatusModal';
import DatabaseConsoleModal from './components/DatabaseConsoleModal';
import CookiesModal from './components/CookiesModal';
import ApiDocsModal from './components/ApiDocsModal';

import { 
  Sparkles, Calendar, MapPin, Ticket, Heart, Search, 
  Flame, ArrowRight, Star, Bell, AlertCircle, Check, Zap, Users, Compass, Trash2
} from 'lucide-react';
import { apiFetch, getStoredUser, clearAuthSession } from './services/api';
import { formatPrice, subscribeCurrencyChange } from './services/currency';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('eventhub_intro_seen'));
  
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

  // Scroll Reveal IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.05 }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.js-reveal');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab]);


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
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    city: '',
    keyword: '',
    minPrice: '',
    maxPrice: ''
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

    // Auto-refresh catalog every 4s for real-time synchronization
    const interval = setInterval(() => {
      fetchCatalogData(true);
    }, 4000);

    window.addEventListener('auth-expired', handleLogout);
    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-expired', handleLogout);
    };
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
      const [allEv, popEv, trendEv] = await Promise.all([
        apiFetch('/events?size=50').catch(() => null),
        apiFetch('/events/popular?limit=4').catch(() => null),
        apiFetch('/events/trending?limit=4').catch(() => null)
      ]);

      let freshList = [];
      if (allEv && Array.isArray(allEv.content) && allEv.content.length > 0) {
        freshList = allEv.content;
      } else {
        freshList = mockEvents;
      }

      setAllMasterEvents(freshList);
      allMasterEventsRef.current = freshList;

      // Re-apply active search filters on master event catalog using live filtersRef
      const currentFilters = filtersRef.current;
      if (currentFilters.keyword || currentFilters.category || currentFilters.city) {
        applyLiveFilter(currentFilters.keyword, currentFilters.category, currentFilters.city, freshList);
      } else {
        setEvents(freshList);
      }

      if (popEv && Array.isArray(popEv) && popEv.length > 0) setPopularEvents(popEv);
      else setPopularEvents(mockEvents.slice(0, 3));

      if (trendEv && Array.isArray(trendEv) && trendEv.length > 0) setTrendingEvents(trendEv);
      else setTrendingEvents(mockEvents.slice(1, 4));

    } catch (err) {
      setAllMasterEvents(mockEvents);
      allMasterEventsRef.current = mockEvents;
      setEvents(mockEvents);
      setPopularEvents(mockEvents.slice(0, 3));
      setTrendingEvents(mockEvents.slice(1, 4));
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const applyLiveFilter = (kw = filters.keyword, cat = filters.category, ct = filters.city, sourceList = null) => {
    const masterSource = sourceList || (allMasterEventsRef.current.length > 0 ? allMasterEventsRef.current : (allMasterEvents.length > 0 ? allMasterEvents : mockEvents));
    let list = [...masterSource];

    if (cat) {
      list = list.filter((e) => e.category === cat);
    }
    if (ct && ct.trim()) {
      const ctLower = ct.trim().toLowerCase();
      list = list.filter((e) => e.venueAddress && e.venueAddress.toLowerCase().includes(ctLower));
    }

    if (kw && kw.trim()) {
      const tokens = kw.trim().toLowerCase().split(/\s+/).filter(Boolean);
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

    setEvents(list);
  };

  const handleSearchAndFilter = async (searchKeywordOverride) => {
    setLoading(true);
    const activeKeyword = searchKeywordOverride !== undefined ? searchKeywordOverride : filters.keyword;
    try {
      let query = '/events/search?';
      if (filters.category) query += `category=${encodeURIComponent(filters.category)}&`;
      if (filters.city) query += `city=${encodeURIComponent(filters.city)}&`;
      if (activeKeyword) query += `keyword=${encodeURIComponent(activeKeyword)}&`;

      const res = await apiFetch(query);
      if (res && Array.isArray(res.content)) {
        setEvents(res.content);
      } else {
        applyLiveFilter(activeKeyword, filters.category, filters.city);
      }
      if (activeKeyword || filters.category || filters.city) {
        scrollToResults();
      }
    } catch (err) {
      applyLiveFilter(activeKeyword, filters.category, filters.city);
      scrollToResults();
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setFilters({ category: '', dateFrom: '', dateTo: '', city: '', keyword: '', minPrice: '', maxPrice: '' });
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
    } catch (err) {
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
      showToast('Joined waitlist — you will receive an email if a seat opens.', 'success');
    } catch (err) {
      showToast(err.message || 'Already on waitlist for this event', 'info');
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
      showToast('Please sign in to select seats & book tickets', 'info');
      return;
    }
    setSelectedEvent(targetEvent);
    setIsSeatMapOpen(true);
  };

  const handleDeleteEvent = async (eventId, eventName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove event "${eventName || 'this event'}"?`)) return;

    // Optimistic UI state removal
    setEvents((prev) => prev.filter((item) => item.id !== eventId));
    setPopularEvents((prev) => prev.filter((item) => item.id !== eventId));
    setTrendingEvents((prev) => prev.filter((item) => item.id !== eventId));

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
      showToast('Organizers do not have access to customer ticket features.', 'info');
      tab = 'home';
    }
    const finalTab = (tab === 'events' || tab === 'explore') ? 'home' : tab;
    setActiveTabState(finalTab);
    localStorage.setItem('active_nav_tab', finalTab);
    window.location.hash = finalTab;

    if (params.keyword !== undefined) {
      setFilters((prev) => ({ ...prev, keyword: params.keyword }));
      handleSearchAndFilter(params.keyword);
    }
    if (tab === 'checkin') setIsCheckInOpen(true);
    if (tab === 'create-event') setIsCreateEventOpen(true);

    if (tab === 'events' || tab === 'explore' || tab === 'all-events') {
      setTimeout(() => {
        scrollToResults();
      }, 100);
    }
  };

  // Full-page auth routes render without Navbar
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
              {toast.type === 'success' && <Check size={16} color="#FFF" />}
              {toast.type === 'error' && <AlertCircle size={16} color="#FFF" />}
              {toast.type === 'info' && <Bell size={16} color="#FFF" />}
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
              {toast.type === 'success' && <Check size={16} color="#FFF" />}
              {toast.type === 'error' && <AlertCircle size={16} color="#FFF" />}
              {toast.type === 'info' && <Bell size={16} color="#FFF" />}
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
          setFilters((prev) => ({ ...prev, keyword: kw }));
          applyLiveFilter(kw, filters.category, filters.city);
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
        <main>
          <div style={{ padding: '0 24px 80px 24px', maxWidth: '1320px', margin: '0 auto' }}>
            
            {/* EventHub Split Hero Section (Inspired by layout structure) */}
            <div className="hero-split-grid">
              
              {/* Left Column Text & CTAs */}
              <div>
                <div className="hero-pill-badge">
                  <Zap size={14} /> REAL-TIME SEAT SELECTION & INSTANT QR PASSES
                </div>

                <h1 className="hero-main-title">
                  Discover & Book <br />
                  Extraordinary Events. <br />
                  <span className="hero-title-accent">Every Stage. Worldwide.</span>
                </h1>

                <p className="hero-description">
                  EventHub is the ultimate live event platform — featuring <strong>interactive seat maps, dynamic ticket tiers, instant discount coupons, and real-time seat lock synchronizations</strong> for concerts, summits, and theater.
                </p>

                <div className="hero-cta-group">
                  <button 
                    onClick={() => handleNavigate('events')}
                    className="btn-sb-primary"
                  >
                    Explore Events <ArrowRight size={18} />
                  </button>

                  {!currentUser ? (
                    <button 
                      onClick={() => handleNavigate('login')}
                      className="btn-sb-outline"
                    >
                      Sign In
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleNavigate('my-bookings')}
                      className="btn-sb-outline"
                    >
                      My Ticket Passes
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column Showcase Image Card Frame */}
              <div className="hero-image-frame">
                <img 
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80" 
                  alt="Live Concert Stage & Crowd" 
                />
              </div>

            </div>

            {/* Search Controls Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearchAndFilter(); }} className="search-bar-skillbridge">
              <div style={{ flex: '2 1 240px', position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search events, artists, venues, city..." 
                  value={filters.keyword} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters({ ...filters, keyword: val });
                    applyLiveFilter(val, filters.category, filters.city);
                  }}
                  className="form-input-sb"
                  style={{ paddingLeft: '44px' }}
                />
              </div>

              <div style={{ flex: '1 1 160px' }}>
                <select 
                  value={filters.category} 
                  onChange={(e) => {
                    const cat = e.target.value;
                    setFilters({ ...filters, category: cat });
                    handleSearchAndFilter();
                  }} 
                  className="form-select-sb"
                  style={{ width: '100%' }}
                >
                  <option value="">All Categories</option>
                  <option value="MUSIC">Music & Concerts</option>
                  <option value="TECH">Tech & AI Summits</option>
                  <option value="THEATER">Theater & Shows</option>
                  <option value="SPORTS">Sports & eSports</option>
                  <option value="WORKSHOP">Workshops</option>
                  <option value="OTHER">Other Events</option>
                </select>
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <input 
                  type="text" 
                  placeholder="City" 
                  value={filters.city} 
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="form-input-sb"
                />
              </div>

              <button type="submit" className="btn-sb-primary" style={{ padding: '12px 24px' }}>
                Search <ArrowRight size={16} />
              </button>

              {(filters.keyword || filters.category || filters.city) && (
                <button type="button" onClick={handleClearSearch} className="btn-sb-outline" style={{ padding: '12px 18px', color: '#FF4D6D' }}>
                  Clear
                </button>
              )}
            </form>

              {/* Category Pill Filters */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '28px' }}>
                {[
                  { id: '', label: 'All Events' },
                  { id: 'MUSIC', label: '🎵 Music & Concerts' },
                  { id: 'TECH', label: '💻 Tech & AI' },
                  { id: 'THEATER', label: '🎭 Theater & Arts' },
                  { id: 'SPORTS', label: '⚽ Sports & eSports' }
                ].map((cat) => {
                  const isActive = filters.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFilters({ ...filters, category: cat.id });
                        handleSearchAndFilter();
                      }}
                      style={{
                        borderRadius: 'var(--radius-full)',
                        padding: '8px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        background: isActive ? 'var(--primary)' : 'var(--bg-surface)',
                        color: isActive ? '#FFFFFF' : 'var(--text-main)',
                        border: '1px solid ' + (isActive ? 'var(--primary)' : 'var(--border-subtle)'),
                        boxShadow: isActive ? '0 4px 14px var(--primary-glow)' : 'var(--shadow-card)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <div><strong style={{ color: 'var(--text-main)', fontSize: '1.25rem', display: 'block' }}>50+</strong> Live Events</div>
                <div><strong style={{ color: 'var(--text-main)', fontSize: '1.25rem', display: 'block' }}>100%</strong> Real-Time Sync</div>
                <div><strong style={{ color: 'var(--text-main)', fontSize: '1.25rem', display: 'block' }}>0s</strong> Concurrency Lock</div>
              </div>

            {/* Featured Spotlight Banner (when no search active) */}
            {!(filters.keyword || filters.category || filters.city) && (
              <div className="glass-panel" style={{ 
                margin: '20px 0 48px 0', 
                borderRadius: 'var(--radius-xl)', 
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                border: '1px solid rgba(240, 85, 55, 0.3)',
                boxShadow: 'var(--shadow-card), 0 0 30px var(--eb-orange-tint)'
              }}>
                <div style={{ position: 'relative', minHeight: '280px' }}>
                  <img 
                    src={popularEvents[0]?.bannerImageUrl || '/images/concert.png'} 
                    alt="Featured Event" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} 
                  />
                  <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                    <span className="badge badge-orange" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                      🔥 FEATURED SPOTLIGHT
                    </span>
                  </div>
                </div>

                <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--eb-orange)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      SAT, SEP 15 • 7:00 PM
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px', color: 'var(--text-main)' }}>
                      {popularEvents[0]?.name || 'Neon Horizon Cyber Music Festival 2026'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.6 }}>
                      {popularEvents[0]?.description || 'Experience 3 days of immersive electronic music, holographic stages, and world-class laser shows with global headline artists.'}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="var(--primary)" /> Metro Arena Center
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={16} color="#FFB800" fill="#FFB800" /> 4.9 (1.2k attending)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Tickets From</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {formatPrice(popularEvents[0]?.ticketPrice || 85.00, popularEvents[0]?.currency)}
                      </span>
                    </div>
                    <button 
                      onClick={() => openBookingModal(popularEvents[0] || mockEvents[0])} 
                      className="btn btn-primary btn-lg"
                    >
                      Get Tickets <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Events */}
            {!(filters.keyword || filters.category || filters.city) && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <Flame size={22} color="var(--eb-orange)" /> Trending Near You
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Top events with highest attendee interest this week</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 380px))', gap: '20px', justifyContent: 'flex-start' }}>
                  {popularEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      currentUser={currentUser}
                      onBook={() => openBookingModal(event)}
                      onWishlist={(e) => handleToggleWishlist(event.id, e)}
                      onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
                      onDelete={(e) => handleDeleteEvent(event.id, event.name, e)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Full Catalog / Search Results */}
            <div ref={catalogRef} style={{ marginTop: (filters.keyword || filters.category || filters.city) ? '30px' : '56px', scrollMarginTop: '100px' }}>
              
              {/* Header logic for normal vs active search */}
              {!(filters.keyword || filters.category || filters.city) ? (
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Explore All Events</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select an event to view venue seat maps and book tickets</p>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={18} color="var(--eb-orange)" /> Search Results ({events.length})
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Showing events matching {filters.keyword ? `"${filters.keyword}"` : ''} {filters.category ? `[${filters.category}]` : ''} {filters.city ? `in ${filters.city}` : ''}
                    </p>
                  </div>
                  <button onClick={handleClearSearch} className="btn btn-outline btn-sm" style={{ color: '#FF4D6D' }}>
                    Clear Search
                  </button>
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading live events...</div>
              ) : events.length === 0 ? (
                /* Inline Empty State Card */
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Search size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No events found matching your search</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                    No events matched "{filters.keyword || filters.category || filters.city}". Try searching for another keyword or location.
                  </p>
                  <button onClick={handleClearSearch} className="btn btn-primary">
                    View All Events
                  </button>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 380px))', 
                  gap: '20px',
                  justifyContent: 'flex-start'
                }}>
                  {events.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      currentUser={currentUser}
                      onBook={() => openBookingModal(event)}
                      onWishlist={(e) => handleToggleWishlist(event.id, e)}
                      onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
                      onDelete={(e) => handleDeleteEvent(event.id, event.name, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SkillBridge Footer */}
          <footer style={{ background: 'var(--bg-main)', borderTop: '1px solid var(--border-subtle)', padding: '60px 24px 40px 24px', marginTop: '60px' }}>
            <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--sb-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={20} color="#FFF" />
                  </div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    Event<span style={{ color: 'var(--sb-orange)' }}>Hub</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Built with purpose. Powered by revolution. Connecting attendees with verified live events and transparent seat allocation.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', marginBottom: '16px' }}>Platform</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <li><a href="#events" onClick={(e) => { e.preventDefault(); handleNavigate('events'); }}>Browse Events</a></li>
                  <li><a href="#create" onClick={(e) => { e.preventDefault(); handleNavigate('create-event'); }}>Host Event</a></li>
                  <li><a href="#checkin" onClick={(e) => { e.preventDefault(); handleNavigate('checkin'); }}>Gate QR Scanner</a></li>
                  <li><a href="#apidocs" onClick={(e) => { e.preventDefault(); setIsApiDocsOpen(true); }}>API Documentation</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', marginBottom: '16px' }}>Resources</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <li><a href="#terms" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }}>Terms & Conditions</a></li>
                  <li><a href="#privacy" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}>Privacy Policy</a></li>
                  <li><a href="#status" onClick={(e) => { e.preventDefault(); setIsSystemStatusOpen(true); }}>System Status</a></li>
                  <li><a href="#database" onClick={(e) => { e.preventDefault(); setIsDatabaseConsoleOpen(true); }}>Database Console</a></li>
                </ul>
              </div>
            </div>

            <div style={{ maxWidth: '1320px', margin: '40px auto 0 auto', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>© 2026 EventHub Inc. All rights reserved.</span>
              <div style={{ display: 'flex', gap: '20px' }}>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}>Privacy</a>
                <a href="#terms" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }}>Terms</a>
                <a href="#cookies" onClick={(e) => { e.preventDefault(); setIsCookiesOpen(true); }}>Cookies</a>
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

      {/* Toast Overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <Check size={16} color="#FFF" />}
            {toast.type === 'error' && <AlertCircle size={16} color="#FFF" />}
            {toast.type === 'info' && <Bell size={16} color="#FFF" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 1-Time Multilingual Namaste Intro Splash */}
      {showIntro && (
        <IntroSplashScreen 
          onComplete={() => {
            setShowIntro(false);
            sessionStorage.setItem('eventhub_intro_seen', 'true');
          }} 
        />
      )}
    </div>
  );
}

// Eventbrite Signature Event Card
function EventCard({ event, currentUser, onBook, onWishlist, onWaitlist, onDelete }) {
  const isSoldOut = event.availableSeats === 0;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER');

  const getImageForEvent = (event) => {
    if (event.bannerImageUrl) return event.bannerImageUrl;
    if (event.category === 'MUSIC') return '/images/concert.png';
    if (event.category === 'TECH') return '/images/tech.png';
    if (event.category === 'THEATER') return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80';
    if (event.category === 'SPORTS') return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80';
    return '/images/concert.png';
  };

  const formatEventDateHeader = (dateStr) => {
    if (!dateStr) return 'SAT, SEP 20 • 7:00 PM';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() + ' • 7:00 PM';
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel glass-panel-interactive" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Banner */}
      <div className="card-banner-wrapper">
        <img 
          src={getImageForEvent(event)} 
          alt={event.name} 
          className="card-banner-img"
        />
        <div className="card-banner-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-orange">
              {event.category || 'EVENT'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {canDelete && (
                <button 
                  onClick={onDelete} 
                  style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255, 77, 109, 0.2)', border: '1px solid rgba(255, 77, 109, 0.3)', backdropFilter: 'blur(8px)' }} 
                  title="Remove Event"
                >
                  <Trash2 size={14} color="#FF4D6D" />
                </button>
              )}
              <button 
                onClick={onWishlist} 
                style={{ padding: '8px', borderRadius: '50%', background: 'rgba(28, 26, 39, 0.8)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }} 
                title="Save to Wishlist"
              >
                <Heart size={14} color="#FFFFFF" />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#FFB800', fontWeight: '700' }}>
            <Star size={13} color="#FFB800" fill="#FFB800" /> 4.9 <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(120+ reviews)</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Eventbrite Signature Orange Date Header */}
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--eb-orange)', letterSpacing: '0.05em', marginBottom: '6px' }}>
            {formatEventDateHeader(event.eventDate)}
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.35, fontWeight: 700, color: 'var(--text-main)' }}>{event.name}</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {event.description || 'An unforgettable live event featuring top performances and interactive sessions.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            <MapPin size={15} color="var(--text-muted)" /> {event.venueName || 'Main Arena Center'}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ticket Price</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{formatPrice(event.ticketPrice, event.currency)}</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Availability</span>
              {isSoldOut ? (
                <span className="badge badge-rose">SOLD OUT</span>
              ) : (
                <span className="badge badge-emerald">{event.availableSeats} Left</span>
              )}
            </div>
          </div>

          {isSoldOut ? (
            <button onClick={onWaitlist} className="btn btn-secondary" style={{ width: '100%', height: '44px' }}>
              <Bell size={15} /> Join Waitlist
            </button>
          ) : (
            <button onClick={onBook} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
              <Ticket size={15} /> Select Seats
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
    description: 'Experience 3 days of immersive electronic music, holographic stages, and world-class laser shows.',
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
    description: 'Keynotes from leading AI researchers, robotics live demonstrations, and executive networking sessions.',
    category: 'TECH',
    ticketPrice: 299.00,
    availableSeats: 45,
    eventDate: '2026-10-02',
    venueName: 'Silicon Valley Convention Center',
    bannerImageUrl: '/images/tech.png'
  },
  {
    id: 3,
    name: 'Phantom of the Opera — Broadway Revival',
    description: 'The iconic award-winning musical returns with an all-new cast and breathtaking orchestral arrangements.',
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
    description: 'Top simulator racing drivers compete for the $500,000 prize pool live on stage in front of thousands.',
    category: 'SPORTS',
    ticketPrice: 45.00,
    availableSeats: 300,
    eventDate: '2026-12-05',
    venueName: 'Apex eSports Dome',
    bannerImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
  }
];
