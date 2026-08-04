import React, { useState, useEffect } from 'react';
import { 
  Compass, Ticket, Heart, PlusCircle, Globe, User, LogOut, ShieldCheck, QrCode, Search, 
  Sun, Moon, Home, Layers
} from 'lucide-react';
import { getActiveCurrency, setActiveCurrency, getAvailableCurrencies, subscribeCurrencyChange } from '../services/currency';

export default function Navbar({ 
  currentUser, 
  onNavigate, 
  activeTab, 
  onLogout 
}) {
  const [currency, setCurrency] = useState(getActiveCurrency());
  const [theme, setTheme] = useState(localStorage.getItem('sb-theme') || 'dark');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('sb-theme', theme);
  }, [theme]);

  useEffect(() => {
    return subscribeCurrencyChange((newCurr) => setCurrency(newCurr));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#user-profile-menu-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return (first + last) || 'U';
  };

  const handleNavClick = (tab, params = {}) => {
    onNavigate(tab, params);
  };

  return (
    <>
      {/* ─── DESKTOP & MOBILE TOP HEADER BAR ─── */}
      <header className="sb-navbar-header">
        <div className="sb-navbar-container">
          
          {/* Brand Logo (Left) */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="sb-logo-brand"
          >
            <div className="sb-logo-icon">
              <Ticket size={22} color="#FFFFFF" />
            </div>
            <div className="sb-logo-text">
              <span className="dark-part">event</span>
              <span className="orange-part">hub</span>
            </div>
          </div>

          {/* Clean Role-Based Navigation Links (Desktop Center) */}
          <nav className="sb-nav-center-links">
            <button 
              onClick={() => handleNavClick('home')}
              className={`sb-nav-link ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>

            <button 
              onClick={() => handleNavClick('events')}
              className={`sb-nav-link ${activeTab === 'events' ? 'active' : ''}`}
            >
              Explore Events
            </button>

            {/* CUSTOMER ROLE LINKS */}
            {currentUser && currentUser.role === 'CUSTOMER' && (
              <>
                <button 
                  onClick={() => handleNavClick('wishlist')}
                  className={`sb-nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
                >
                  Wishlist
                </button>

                <button 
                  onClick={() => handleNavClick('my-bookings')}
                  className={`sb-nav-link ${activeTab === 'my-bookings' ? 'active' : ''}`}
                >
                  My Tickets
                </button>
              </>
            )}

            {/* ORGANIZER ROLE LINKS */}
            {currentUser && currentUser.role === 'ORGANIZER' && (
              <>
                <button 
                  onClick={() => handleNavClick('create-event')}
                  className={`sb-nav-link ${activeTab === 'create-event' ? 'active' : ''}`}
                >
                  Host Event
                </button>

                <button 
                  onClick={() => handleNavClick('checkin')}
                  className={`sb-nav-link ${activeTab === 'checkin' ? 'active' : ''}`}
                >
                  Gate Check-In
                </button>
              </>
            )}

            {/* ADMIN ROLE LINK */}
            {currentUser && currentUser.role === 'ADMIN' && (
              <button 
                onClick={() => handleNavClick('admin')}
                className={`sb-nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Controls: Currency, Theme Switcher & User Profile Menu */}
          <div className="sb-nav-right-controls">
            
            {/* Multi-Currency Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <Globe size={14} color="var(--primary)" />
              <select 
                value={currency} 
                onChange={(e) => setActiveCurrency(e.target.value)}
                style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '0.82rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
              >
                {getAvailableCurrencies().map((c) => (
                  <option key={c.code} value={c.code} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Light/Dark Mode Switcher */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Account / Profile Dropdown */}
            {currentUser ? (
              <div id="user-profile-menu-container" style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '2px solid var(--bg-surface)',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px var(--primary-glow)',
                    overflow: 'hidden',
                    padding: 0
                  }}
                  title={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getUserInitials(currentUser)
                  )}
                </button>

                {/* User Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '240px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    zIndex: 1100,
                    boxShadow: 'var(--shadow-elevated)',
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {currentUser.email}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.62rem', marginTop: '6px', display: 'inline-block' }}>
                        {currentUser.role}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => { handleNavClick('profile'); setProfileDropdownOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <User size={16} color="var(--primary)" /> Account Profile
                      </button>

                      {currentUser.role === 'CUSTOMER' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('my-bookings'); setProfileDropdownOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <Ticket size={16} color="#10B981" /> Purchased Tickets
                        </button>
                      )}

                      {currentUser.role === 'ORGANIZER' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('create-event'); setProfileDropdownOpen(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                          >
                            <PlusCircle size={16} color="#A855F7" /> Host New Event
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('checkin'); setProfileDropdownOpen(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                          >
                            <QrCode size={16} color="#F59E0B" /> Gate Scanner
                          </button>
                        </>
                      )}

                      {currentUser.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('admin'); setProfileDropdownOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <ShieldCheck size={16} color="#6366F1" /> Admin Panel
                        </button>
                      )}

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                      <button
                        type="button"
                        onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#EF4444', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <LogOut size={16} color="#EF4444" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => handleNavClick('login')} 
                  className="btn-sb-outline"
                  style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleNavClick('register')} 
                  className="btn-sb-primary"
                  style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                >
                  Register
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* ─── MOBILE FLOATING BOTTOM TAB BAR (MOBILE DEVICES ≤ 768px) ─── */}
      <nav className="mobile-bottom-tab-bar">
        
        {/* 1. Home */}
        <button 
          onClick={() => handleNavClick('home')}
          className={`mobile-tab-item ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        {/* 2. Explore */}
        <button 
          onClick={() => handleNavClick('events')}
          className={`mobile-tab-item ${activeTab === 'events' ? 'active' : ''}`}
        >
          <Compass size={20} />
          <span>Explore</span>
        </button>

        {/* 3. CENTER ELEVATED ACTION BUTTON (Role Aware) */}
        {currentUser?.role === 'ORGANIZER' ? (
          <button 
            onClick={() => handleNavClick('create-event')}
            className="mobile-tab-center-btn"
            title="Host Event"
          >
            <PlusCircle size={24} />
          </button>
        ) : currentUser?.role === 'ADMIN' ? (
          <button 
            onClick={() => handleNavClick('admin')}
            className="mobile-tab-center-btn"
            title="Admin Dashboard"
          >
            <ShieldCheck size={24} />
          </button>
        ) : (
          <button 
            onClick={() => {
              if (!currentUser) handleNavClick('login');
              else handleNavClick('wishlist');
            }}
            className="mobile-tab-center-btn"
            title="Wishlist"
          >
            <Heart size={24} />
          </button>
        )}

        {/* 4. Tickets / Scanner / Dashboard */}
        {currentUser?.role === 'ORGANIZER' ? (
          <button 
            onClick={() => handleNavClick('checkin')}
            className={`mobile-tab-item ${activeTab === 'checkin' ? 'active' : ''}`}
          >
            <QrCode size={20} />
            <span>Scan</span>
          </button>
        ) : currentUser?.role === 'ADMIN' ? (
          <button 
            onClick={() => handleNavClick('admin')}
            className={`mobile-tab-item ${activeTab === 'admin' ? 'active' : ''}`}
          >
            <ShieldCheck size={20} />
            <span>Admin</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              if (!currentUser) handleNavClick('login');
              else handleNavClick('my-bookings');
            }}
            className={`mobile-tab-item ${activeTab === 'my-bookings' ? 'active' : ''}`}
          >
            <Ticket size={20} />
            <span>Tickets</span>
          </button>
        )}

        {/* 5. Account Profile */}
        <button 
          onClick={() => {
            if (!currentUser) handleNavClick('login');
            else handleNavClick('profile');
          }}
          className={`mobile-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </button>

      </nav>
    </>
  );
}
