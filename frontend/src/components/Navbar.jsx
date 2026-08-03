import React, { useState, useEffect } from 'react';
import { Ticket, Heart, User, LogOut, ShieldCheck, QrCode, PlusCircle, Compass, Globe, Menu, X } from 'lucide-react';
import { getActiveCurrency, setActiveCurrency, getAvailableCurrencies, subscribeCurrencyChange } from '../services/currency';

export default function Navbar({ currentUser, onNavigate, activeTab, _onOpenAuthModal, onLogout, searchKeyword = '', onSearchChange }) {
  const [currency, setCurrency] = useState(getActiveCurrency());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

  const getUserInitials = (user) => {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return (first + last) || 'U';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchKeyword);
    }
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (tab, params = {}) => {
    onNavigate(tab, params);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 20px',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1320px', margin: '0 auto', gap: '12px' }}>
        
        {/* Brand */}
        <div 
          onClick={() => handleNavClick('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ticket size={20} color="#000" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
              EventHub
            </span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-subtle)', fontWeight: '600', letterSpacing: '0.1em', marginTop: '-3px' }}>
              TICKETING
            </span>
          </div>
        </div>


        {/* Desktop Nav Links */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => handleNavClick('events')}
            className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Compass size={14} /> Explore
          </button>

          {currentUser && currentUser.role === 'CUSTOMER' && (
            <>
              <button 
                onClick={() => handleNavClick('wishlist')}
                className={`btn ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                <Heart size={14} /> Wishlist
              </button>
            </>
          )}

          {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER') && (
            <>
              <button 
                onClick={() => handleNavClick('create-event')}
                className="btn btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                <PlusCircle size={14} /> Create
              </button>

              <button 
                onClick={() => handleNavClick('checkin')}
                className={`btn ${activeTab === 'checkin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                <QrCode size={14} /> Check-In
              </button>
            </>
          )}

          {currentUser && currentUser.role === 'ADMIN' && (
            <button 
              onClick={() => handleNavClick('admin')}
              className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <ShieldCheck size={14} /> Admin
            </button>
          )}

          {/* Regional Currency Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '2px 8px' }}>
            <Globe size={13} color="var(--text-muted)" />
            <select 
              value={currency} 
              onChange={(e) => setActiveCurrency(e.target.value)}
              style={{ 
                background: 'transparent', 
                color: 'var(--text-main)', 
                border: 'none', 
                fontSize: '0.8rem', 
                fontWeight: '600', 
                outline: 'none', 
                cursor: 'pointer' 
              }}
            >
              {getAvailableCurrencies().map((c) => (
                <option key={c.code} value={c.code} style={{ background: '#0A0A0A', color: '#FFF' }}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>

          {currentUser ? (
            <div id="user-profile-menu-container" style={{ position: 'relative', marginLeft: '8px' }}>
              {/* Circular Avatar Trigger */}
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: '2px solid rgba(255,255,255,0.25)',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s ease',
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

              {/* Dropdown Menu Popup */}
              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '230px',
                  background: '#121216',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '8px',
                  zIndex: 1000,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(20px)'
                }}>
                  {/* User Info Header */}
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '6px' }}>
                    <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: '800', color: '#FFF' }}>
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 6px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {currentUser.email}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                      {currentUser.role}
                    </span>
                  </div>

                  {/* Menu Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick('profile');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: activeTab === 'profile' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: '#FFF',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <User size={16} color="var(--primary)" /> Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick('my-bookings');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: activeTab === 'my-bookings' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: '#FFF',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Ticket size={16} color="#10b981" /> My Tickets
                    </button>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#ef4444',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} color="#ef4444" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <button 
                onClick={() => handleNavClick('login')} 
                className="btn btn-secondary"
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                Sign In
              </button>
              <button 
                onClick={() => handleNavClick('register')} 
                className="btn btn-primary"
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-only btn btn-secondary" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ padding: '8px' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-only" style={{
          marginTop: '14px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => handleNavClick('events')} className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}>
              <Compass size={14} /> Explore
            </button>

            {currentUser && (
              <button onClick={() => handleNavClick('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}>
                <User size={14} /> Profile
              </button>
            )}

            {currentUser && currentUser.role === 'CUSTOMER' && (
              <>
                <button onClick={() => handleNavClick('wishlist')} className={`btn ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Heart size={14} /> Wishlist
                </button>
                <button onClick={() => handleNavClick('my-bookings')} className={`btn ${activeTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Ticket size={14} /> My Tickets
                </button>
              </>
            )}

            {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER') && (
              <>
                <button onClick={() => handleNavClick('create-event')} className="btn btn-secondary">
                  <PlusCircle size={14} /> Create Event
                </button>
                <button onClick={() => handleNavClick('checkin')} className={`btn ${activeTab === 'checkin' ? 'btn-primary' : 'btn-secondary'}`}>
                  <QrCode size={14} /> Gate Check-In
                </button>
              </>
            )}

            {currentUser && currentUser.role === 'ADMIN' && (
              <button onClick={() => handleNavClick('admin')} className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}>
                <ShieldCheck size={14} /> Admin
              </button>
            )}
          </div>

          {/* Regional Currency Switcher Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} /> Regional Currency:
            </span>
            <select 
              value={currency} 
              onChange={(e) => setActiveCurrency(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '4px 12px', fontSize: '0.85rem' }}
            >
              {getAvailableCurrencies().map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>

          {currentUser ? (
            <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: '100%', color: '#ef4444', marginTop: '6px' }}>
              <LogOut size={14} /> Sign Out ({currentUser.firstName})
            </button>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => handleNavClick('login')} className="btn btn-secondary">Sign In</button>
              <button onClick={() => handleNavClick('register')} className="btn btn-primary">Register</button>
            </div>
          )}
        </div>
      )}

    </nav>
  );
}
