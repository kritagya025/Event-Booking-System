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

import { 
  Sparkles, Calendar, MapPin, Ticket, Heart, Search, 
  Flame, ArrowRight, Star, Bell, AlertCircle, Check, Zap, Users, Compass, Trash2
} from 'lucide-react';
import { apiFetch, getStoredUser, clearAuthSession } from './services/api';
import { formatPrice, subscribeCurrencyChange } from './services/currency';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [, setCurrencyState] = useState(Date.now());

  useEffect(() => {
    return subscribeCurrencyChange(() => setCurrencyState(Date.now()));
  }, []);


  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

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
    setSelectedEvent(event);
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
      setActiveTab('home');
      return;
    }
    setActiveTab(tab === 'events' ? 'home' : tab);
    if (params.keyword !== undefined) {
      setFilters((prev) => ({ ...prev, keyword: params.keyword }));
      handleSearchAndFilter(params.keyword);
    }
    if (tab === 'checkin') setIsCheckInOpen(true);
    if (tab === 'create-event') setIsCreateEventOpen(true);
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
            
            {/* Hero Section */}
            <div style={{ padding: '100px 0 80px 0', textAlign: 'center' }}>
              <span className="badge badge-purple pulse-badge" style={{ marginBottom: '24px', padding: '6px 16px', fontSize: '0.7rem' }}>
                <Sparkles size={14} /> REAL-TIME SEAT ALLOCATION
              </span>

              <h1 className="hero-title" style={{ fontSize: '4.2rem', marginBottom: '24px', lineHeight: 1.08, letterSpacing: '-0.05em', fontWeight: 900 }}>
                Reserve Your Seats For<br />
                <span style={{ color: '#FFFFFF' }}>World-Class Events</span>
              </h1>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.7, fontWeight: 400 }}>
                Interactive seat maps, instant promo coupons, waitlist auto-promotions, and PDF QR code ticketing — all in real-time.
              </p>

              {/* Search Controls Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSearchAndFilter(); }} style={{ 
                maxWidth: '860px', margin: '0 auto', display: 'flex', gap: '8px', 
                flexWrap: 'wrap', alignItems: 'center', padding: '8px',
                background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ flex: '2 1 240px', position: 'relative' }}>
                  <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search events, artists, venues, city..." 
                    value={filters.keyword} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters({ ...filters, keyword: val });
                      applyLiveFilter(val, filters.category, filters.city);
                    }}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '40px', height: '48px', fontSize: '0.95rem' }}
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
                    className="form-select"
                    style={{ width: '100%', height: '48px', fontSize: '0.9rem' }}
                  >
                    <option value="">All Categories</option>
                    <option value="MUSIC">Music</option>
                    <option value="TECH">Tech & AI</option>
                    <option value="THEATER">Theater</option>
                    <option value="SPORTS">Sports</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 140px' }}>
                  <input 
                    type="text" 
                    placeholder="City" 
                    value={filters.city} 
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', height: '48px' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 24px' }}>
                  Search <ArrowRight size={16} />
                </button>

                {(filters.keyword || filters.category || filters.city) && (
                  <button type="button" onClick={handleClearSearch} className="btn btn-secondary" style={{ height: '48px', padding: '0 16px', color: '#ef4444' }}>
                    Clear
                  </button>
                )}
              </form>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '48px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div><strong style={{ color: '#FFF', fontSize: '1.3rem', display: 'block' }}>50+</strong> Live Events</div>
                <div><strong style={{ color: '#FFF', fontSize: '1.3rem', display: 'block' }}>100%</strong> WebSocket Sync</div>
                <div><strong style={{ color: '#FFF', fontSize: '1.3rem', display: 'block' }}>0s</strong> Double-Booking</div>
              </div>
            </div>

            {/* Popular Events (only visible when NO search filter is active) */}
            {!(filters.keyword || filters.category || filters.city) && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <Flame size={22} color="var(--text-secondary)" /> Popular & Trending
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Top events with highest attendee interest</p>
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
            <div ref={catalogRef} style={{ marginTop: (filters.keyword || filters.category || filters.city) ? '30px' : '60px', scrollMarginTop: '100px' }}>
              
              {/* Header logic for normal vs active search */}
              {!(filters.keyword || filters.category || filters.city) ? (
                <div style={{ marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>All Events</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select an event to open the live interactive seat map</p>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={18} /> Search Results ({events.length})
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Showing events matching {filters.keyword ? `"${filters.keyword}"` : ''} {filters.category ? `[${filters.category}]` : ''} {filters.city ? `in ${filters.city}` : ''}
                    </p>
                  </div>
                  <button onClick={handleClearSearch} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                    Clear Search
                  </button>
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading events...</div>
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
        </main>
      )}

      {/* Footer */}
      <footer style={{ padding: '48px 24px', marginTop: '80px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '900', fontFamily: 'var(--font-display)' }}>
              Event<span style={{ color: '#FFFFFF' }}>Hub</span>
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              Event Booking System — Spring Boot 3.4.1 & React 18
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" style={{ color: '#FFF', fontWeight: '600' }}>
              Swagger API
            </a>
            <a href="http://localhost:8080/actuator/health" target="_blank" rel="noreferrer">Health</a>
            <a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer">H2 Console</a>
          </div>
        </div>
      </footer>

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
    </div>
  );
}

// Minimal Monochrome Event Card
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
            <span className="badge badge-purple">{event.category || 'EVENT'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {canDelete && (
                <button 
                  onClick={onDelete} 
                  style={{ padding: '8px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.4)' }} 
                  title="Remove Event"
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              )}
              <button 
                onClick={onWishlist} 
                style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} 
                title="Save to Wishlist"
              >
                <Heart size={14} color="#FFF" />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
            <Star size={12} color="#FFF" fill="#FFF" /> 4.9
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.3, fontWeight: 700 }}>{event.name}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description || 'An unforgettable live event featuring top performances and interactive sessions.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color="var(--text-subtle)" /> {event.eventDate || '2026-09-15'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} color="var(--text-subtle)" /> {event.venueName || 'Main Arena Center'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', display: 'block', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF' }}>{formatPrice(event.ticketPrice, event.currency)}</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', display: 'block', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Availability</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isSoldOut ? 'var(--text-muted)' : '#FFF' }}>
                {isSoldOut ? 'SOLD OUT' : `${event.availableSeats} Left`}
              </span>
            </div>
          </div>

          {isSoldOut ? (
            <button onClick={onWaitlist} className="btn btn-secondary" style={{ width: '100%', height: '42px' }}>
              <Bell size={14} /> Join Waitlist
            </button>
          ) : (
            <button onClick={onBook} className="btn btn-primary" style={{ width: '100%', height: '42px' }}>
              <Ticket size={14} /> Select Seats
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
