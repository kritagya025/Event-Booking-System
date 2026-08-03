import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SeatMapModal from './components/SeatMapModal';
import CheckInModal from './components/CheckInModal';
import AdminDashboard from './components/AdminDashboard';
import MyBookings from './components/MyBookings';
import Wishlist from './components/Wishlist';
import CreateEventModal from './components/CreateEventModal';

import { 
  Sparkles, Calendar, MapPin, Ticket, Heart, Search, 
  Flame, ArrowRight, Star, Bell, AlertCircle, Check, Zap, Users, Compass
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

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);

    fetchCatalogData();

    window.addEventListener('auth-expired', handleLogout);
    return () => window.removeEventListener('auth-expired', handleLogout);
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const [allEv, popEv, trendEv] = await Promise.all([
        apiFetch('/events?size=20').catch(() => null),
        apiFetch('/events/popular?limit=4').catch(() => null),
        apiFetch('/events/trending?limit=4').catch(() => null)
      ]);

      if (allEv && allEv.content && allEv.content.length > 0) setEvents(allEv.content);
      else setEvents(mockEvents);

      if (popEv && popEv.length > 0) setPopularEvents(popEv);
      else setPopularEvents(mockEvents.slice(0, 3));

      if (trendEv && trendEv.length > 0) setTrendingEvents(trendEv);
      else setTrendingEvents(mockEvents.slice(1, 4));

    } catch (err) {
      setEvents(mockEvents);
      setPopularEvents(mockEvents.slice(0, 3));
      setTrendingEvents(mockEvents.slice(1, 4));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAndFilter = async () => {
    setLoading(true);
    try {
      let query = '/events/search?';
      if (filters.category) query += `category=${encodeURIComponent(filters.category)}&`;
      if (filters.city) query += `city=${encodeURIComponent(filters.city)}&`;
      if (filters.keyword) query += `keyword=${encodeURIComponent(filters.keyword)}&`;
      if (filters.minPrice) query += `minPrice=${filters.minPrice}&`;
      if (filters.maxPrice) query += `maxPrice=${filters.maxPrice}&`;

      const res = await apiFetch(query);
      if (res && res.content) setEvents(res.content);
    } catch (err) {
      showToast('Search completed', 'info');
    } finally {
      setLoading(false);
    }
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

  const handleNavigate = (tab, params = {}) => {
    if (currentUser && currentUser.role === 'ORGANIZER' && (tab === 'my-bookings' || tab === 'wishlist')) {
      showToast('Organizers do not have access to customer ticket features.', 'info');
      setActiveTab('home');
      return;
    }
    setActiveTab(tab);
    if (params.keyword) {
      setFilters(prev => ({ ...prev, keyword: params.keyword }));
      handleSearchAndFilter();
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
      />

      {activeTab === 'admin' ? (
        <AdminDashboard showToast={showToast} />
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

              <h1 style={{ fontSize: '4.2rem', marginBottom: '24px', lineHeight: 1.08, letterSpacing: '-0.05em', fontWeight: 900 }}>
                Reserve Your Seats For<br />
                <span style={{ color: '#FFFFFF' }}>World-Class Events</span>
              </h1>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.7, fontWeight: 400 }}>
                Interactive seat maps, instant promo coupons, waitlist auto-promotions, and PDF QR code ticketing — all in real-time.
              </p>

              {/* Search Controls */}
              <div style={{ 
                maxWidth: '860px', margin: '0 auto', display: 'flex', gap: '8px', 
                flexWrap: 'wrap', alignItems: 'center', padding: '8px',
                background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ flex: '2 1 240px', position: 'relative' }}>
                  <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search events, artists, venues..." 
                    value={filters.keyword} 
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '40px', height: '48px', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ flex: '1 1 160px' }}>
                  <select 
                    value={filters.category} 
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
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

                <button onClick={handleSearchAndFilter} className="btn btn-primary" style={{ height: '48px', padding: '0 24px' }}>
                  Search <ArrowRight size={16} />
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '48px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div><strong style={{ color: '#FFF', fontSize: '1.3rem', display: 'block' }}>50+</strong> Live Events</div>
                <div><strong style={{ color: '#FFF', fontSize: '1.3rem', display: 'block' }}>100%</strong> WebSocket Sync</div>
                <div><strong style={{ color: '#FFF', fontSize: '1.3rem', display: 'block' }}>0s</strong> Double-Booking</div>
              </div>
            </div>

            {/* Popular Events */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <Flame size={22} color="var(--text-secondary)" /> Popular & Trending
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Top events with highest attendee interest</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {popularEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onBook={() => openBookingModal(event)}
                    onWishlist={(e) => handleToggleWishlist(event.id, e)}
                    onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
                  />
                ))}
              </div>
            </div>

            {/* Full Catalog */}
            <div style={{ marginTop: '80px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>All Events</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select an event to open the live interactive seat map</p>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading events...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {events.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onBook={() => openBookingModal(event)}
                      onWishlist={(e) => handleToggleWishlist(event.id, e)}
                      onWaitlist={(e) => handleJoinWaitlist(event.id, e)}
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
        onEventCreated={() => fetchCatalogData()}
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
function EventCard({ event, onBook, onWishlist, onWaitlist }) {
  const isSoldOut = event.availableSeats === 0;

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
            <button 
              onClick={onWishlist} 
              style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} 
              title="Save to Wishlist"
            >
              <Heart size={14} color="#FFF" />
            </button>
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
