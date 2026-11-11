import React, { useState, useEffect } from 'react';
import { 
  Ticket, PlusCircle, User, LogOut, ShieldCheck, QrCode, 
  Sun, Moon, Menu, X, Sparkles, Heart
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      body.classList.remove('light');
      body.classList.add('dark');
    }

    try {
      localStorage.setItem('sb-theme', theme);
    } catch {}
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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return (first + last) || 'U';
  };

  const handleNavClick = (tab, params = {}) => {
    setMobileMenuOpen(false);
    onNavigate(tab, params);
  };

  return (
    <>
      {/* ─── 0. HIGH VOLTAGE HAZARD WARNING HEADER MARQUEE ─── */}
      <div className="h-7 w-full hazard-tape overflow-hidden flex items-center border-b-2 border-asphalt-black select-none">
        <div className="animate-marquee items-center gap-6 text-asphalt-black font-ticker font-extrabold text-[12px] tracking-widest uppercase py-0.5">
          <span>★ EVENTHUB OFFICIAL BOX OFFICE ★ LIVE CONCERTS, BLOCKBUSTER CINEMA & THEATER</span>
          <span>•</span>
          <span>INSTANT CRYPTOGRAPHIC QR CODE TICKETS // MULTI-CURRENCY SETTLEMENTS // ZERO DUPLICATE BOOKINGS</span>
          <span>•</span>
          <span>CONCERTS, TECH CONFERENCES, THEATER PRODUCTIONS & INDUSTRIAL WORKSHOPS</span>
          <span>•</span>
          <span>DIRECT ORGANIZER GATE SCANNER VALIDATION // 99.98% DISTRIBUTED UPTIME</span>
          <span>•</span>
          <span>★ EVENTHUB OFFICIAL BOX OFFICE ★ LIVE CONCERTS, BLOCKBUSTER CINEMA & THEATER</span>
          <span>•</span>
          <span>INSTANT CRYPTOGRAPHIC QR CODE TICKETS // MULTI-CURRENCY SETTLEMENTS // ZERO DUPLICATE BOOKINGS</span>
          <span>•</span>
          <span>CONCERTS, TECH CONFERENCES, THEATER PRODUCTIONS & INDUSTRIAL WORKSHOPS</span>
          <span>•</span>
          <span>DIRECT ORGANIZER GATE SCANNER VALIDATION // 99.98% DISTRIBUTED UPTIME</span>
        </div>
      </div>

      {/* ─── 1. BRUTALIST DIY CLUB FLYER NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 bg-asphalt-black/95 backdrop-blur-md border-b-2 border-asphalt-border px-2 sm:px-4 py-2 sm:py-3">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Brand Stamp Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="bg-acid-yellow text-asphalt-black px-1.5 sm:px-2.5 py-0.5 font-display text-lg sm:text-2xl tracking-wider -rotate-2 border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] sm:shadow-[3px_3px_0px_#ff1f6d] group-hover:rotate-0 transition-transform">
                EVENTHUB
              </div>
              <div className="hidden sm:flex flex-col font-ticker leading-none">
                <span className="text-xs font-bold text-grit-white tracking-widest uppercase">LIVE EVENTS & CINEMA</span>
                <span className="text-[10px] text-neon-magenta tracking-tight">REAL-TIME SEAT RESERVATION & PASSES</span>
              </div>
            </div>
            <span className="hidden lg:inline-block font-ticker text-[10px] bg-electric-cobalt text-grit-white px-2 py-0.5 uppercase font-bold border border-grit-white/40 stamp-slant-2">
              VERIFIED TICKETS
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2 font-display text-lg tracking-wider">
            <button 
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1 font-bold border-2 transition-all -rotate-1 ${activeTab === 'home' ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[2px_2px_0px_#ffffff]' : 'bg-asphalt-surface text-grit-white hover:text-acid-yellow border-asphalt-border hover:border-acid-yellow'}`}
            >
              EXPLORE EVENTS
            </button>

            <button 
              onClick={() => handleNavClick('events')}
              className={`px-3 py-1 border transition-all rotate-1 ${activeTab === 'events' ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold shadow-[2px_2px_0px_#ffffff]' : 'bg-asphalt-surface text-grit-white hover:text-acid-yellow border-asphalt-border hover:border-acid-yellow'}`}
            >
              ALL CATALOG
            </button>

            {/* CUSTOMER ROLE LINKS */}
            {currentUser && currentUser.role === 'CUSTOMER' && (
              <>
                <button 
                  onClick={() => handleNavClick('wishlist')}
                  className={`px-3 py-1 border transition-all -rotate-1 ${activeTab === 'wishlist' ? 'bg-neon-magenta text-grit-white border-asphalt-black font-bold' : 'bg-asphalt-surface text-grit-white hover:text-neon-magenta border-asphalt-border hover:border-neon-magenta'}`}
                >
                  WISHLIST
                </button>

                <button 
                  onClick={() => handleNavClick('my-bookings')}
                  className={`px-3 py-1 border transition-all rotate-1 ${activeTab === 'my-bookings' ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold' : 'bg-asphalt-surface text-grit-white hover:text-acid-yellow border-asphalt-border hover:border-acid-yellow'}`}
                >
                  MY TICKETS
                </button>
              </>
            )}

            {/* ORGANIZER ROLE LINKS */}
            {currentUser && currentUser.role === 'ORGANIZER' && (
              <>
                <button 
                  onClick={() => handleNavClick('create-event')}
                  className={`px-3 py-1 border transition-all -rotate-1 ${activeTab === 'create-event' ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold' : 'bg-asphalt-surface text-grit-white hover:text-acid-yellow border-asphalt-border hover:border-acid-yellow'}`}
                >
                  CREATE EVENT
                </button>

                <button 
                  onClick={() => handleNavClick('checkin')}
                  className={`px-3 py-1 border transition-all rotate-1 ${activeTab === 'checkin' ? 'bg-neon-magenta text-grit-white border-asphalt-black font-bold' : 'bg-asphalt-surface text-grit-white hover:text-neon-magenta border-asphalt-border hover:border-neon-magenta'}`}
                >
                  GATE SCANNER
                </button>
              </>
            )}

            {/* ADMIN ROLE LINK */}
            {currentUser && currentUser.role === 'ADMIN' && (
              <button 
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1 border transition-all ${activeTab === 'admin' ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold' : 'bg-asphalt-surface text-grit-white hover:text-acid-yellow border-asphalt-border hover:border-acid-yellow'}`}
              >
                ADMIN DASHBOARD
              </button>
            )}
          </nav>

          {/* Header Actions & Live Counter */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative flex items-center">
              <select 
                value={currency} 
                onChange={(e) => setActiveCurrency(e.target.value)}
                className="bg-asphalt-card text-acid-yellow font-ticker text-[10px] sm:text-xs font-bold border-2 border-acid-yellow px-1 sm:px-2 py-0.5 sm:py-1 focus:outline-none appearance-none cursor-pointer pr-4 sm:pr-6 shadow-[2px_2px_0px_#ff1f6d]"
              >
                {getAvailableCurrencies().map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-acid-yellow pointer-events-none absolute right-0.5 sm:right-1 text-xs font-bold">arrow_drop_down</span>
            </div>

            {/* Live Inventory Counter */}
            <div className="hidden sm:flex items-center gap-1.5 bg-asphalt-card border border-asphalt-border px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-neon-magenta animate-ping" />
              <span className="font-ticker text-[11px] text-grit-dim">AVAILABLE SEATS:</span>
              <span className="font-ticker text-[11px] font-bold text-acid-yellow">#992 / 1200</span>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              type="button" 
              className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] sm:min-w-[32px] min-h-[32px] sm:min-h-[32px] bg-asphalt-card border border-asphalt-border text-grit-dim hover:text-acid-yellow flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer overflow-hidden touch-manipulation"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              <span className={`inline-flex items-center justify-center transition-transform duration-300 ${theme === 'dark' ? 'rotate-0' : 'rotate-180'}`}>
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </span>
            </button>

            {/* User Account / Profile Dropdown */}
            {currentUser ? (
              <div id="user-profile-menu-container" className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] bg-acid-yellow text-asphalt-black font-ticker font-extrabold text-xs sm:text-sm border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] flex items-center justify-center cursor-pointer touch-manipulation"
                  title={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials(currentUser)
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-asphalt-surface border-3 border-grit-white shadow-[6px_6px_0px_#ff1f6d] p-3 z-50">
                    <div className="pb-2 mb-2 border-b border-asphalt-border">
                      <span className="block font-ticker text-xs font-bold text-acid-yellow uppercase">
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                      <span className="block font-ticker text-[10px] text-grit-dim">
                        {currentUser.email} • {currentUser.role}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 font-ticker text-xs">
                      <button
                        type="button"
                        onClick={() => { handleNavClick('profile'); setProfileDropdownOpen(false); }}
                        className="flex items-center gap-2 p-2 min-h-[36px] hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left cursor-pointer"
                      >
                        <User size={13} /> Account Profile
                      </button>

                      {currentUser.role === 'CUSTOMER' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('my-bookings'); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-2 p-2 min-h-[36px] hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left cursor-pointer"
                        >
                          <Ticket size={13} /> My Tickets
                        </button>
                      )}

                      {currentUser.role === 'ORGANIZER' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('create-event'); setProfileDropdownOpen(false); }}
                            className="flex items-center gap-2 p-2 min-h-[36px] hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left cursor-pointer"
                          >
                            <PlusCircle size={13} /> Create New Event
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('checkin'); setProfileDropdownOpen(false); }}
                            className="flex items-center gap-2 p-2 min-h-[36px] hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left cursor-pointer"
                          >
                            <QrCode size={13} /> Gate Scanner
                          </button>
                        </>
                      )}

                      {currentUser.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('admin'); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-2 p-2 min-h-[36px] hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left cursor-pointer"
                        >
                          <ShieldCheck size={13} /> Admin Panel
                        </button>
                      )}

                      <div className="h-px bg-asphalt-border my-1" />

                      <button
                        type="button"
                        onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                        className="flex items-center gap-2 p-2 min-h-[36px] hover:bg-asphalt-card text-danger-red text-left font-bold cursor-pointer"
                      >
                        <LogOut size={13} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => handleNavClick('login')} 
                  className="bg-asphalt-card hover:bg-asphalt-surface text-grit-white px-3 py-1.5 min-h-[38px] flex items-center justify-center font-display text-base tracking-wider uppercase border border-asphalt-border hover:border-acid-yellow cursor-pointer touch-manipulation"
                >
                  SIGN IN
                </button>
                <button 
                  onClick={() => handleNavClick('register')} 
                  className="bg-neon-magenta hover:bg-neon-magenta-dark text-grit-white px-3 sm:px-4 py-1.5 min-h-[38px] flex items-center justify-center font-display text-base tracking-wider uppercase border-2 border-grit-white shadow-[3px_3px_0px_#eefc54] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer touch-manipulation"
                >
                  REGISTER
                </button>
              </div>
            )}

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-8 h-8 sm:w-10 sm:h-10 min-w-[32px] sm:min-w-[40px] min-h-[32px] sm:min-h-[40px] bg-asphalt-card hover:bg-asphalt-surface border-2 border-grit-white text-grit-white hover:text-acid-yellow flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#ff1f6d] active:scale-95 transition-all touch-manipulation"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X size={20} className="text-neon-magenta" /> : <Menu size={20} />}
            </button>

          </div>

        </div>
      </header>

      {/* ─── 2. MOBILE NAVIGATION DRAWER OVERLAY ─── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-asphalt-black/85 backdrop-blur-md md:hidden flex flex-col justify-between pt-16 pb-6 px-4 overflow-y-auto touch-scroll safe-pb animate-modal-fade select-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Warning Strip */}
            <div className="hazard-tape h-2 w-full border border-asphalt-black" />

            {/* User Profile Card (Mobile) */}
            {currentUser ? (
              <div className="bg-asphalt-surface border-2 border-grit-white p-3.5 shadow-[4px_4px_0px_#eefc54]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-asphalt-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-acid-yellow text-asphalt-black font-ticker font-extrabold text-sm border-2 border-grit-white flex items-center justify-center">
                      {getUserInitials(currentUser)}
                    </div>
                    <div>
                      <span className="block font-ticker text-xs font-bold text-acid-yellow uppercase leading-none">
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                      <span className="block font-ticker text-[10px] text-grit-dim uppercase mt-0.5">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNavClick('profile'); }}
                    className="bg-asphalt-card border border-asphalt-border hover:border-acid-yellow text-grit-white font-mono-zine text-[10px] uppercase px-2 py-1 flex items-center gap-1"
                  >
                    <User size={12} /> PROFILE
                  </button>
                </div>
                <div className="font-ticker text-[10px] text-grit-dim truncate">
                  {currentUser.email}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 bg-acid-yellow text-asphalt-black font-display text-lg uppercase tracking-wider font-bold border-2 border-asphalt-black shadow-[3px_3px_0px_#ffffff] text-center"
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('register')}
                  className="w-full py-2.5 bg-neon-magenta text-grit-white font-display text-lg uppercase tracking-wider font-bold border-2 border-grit-white shadow-[3px_3px_0px_#eefc54] text-center"
                >
                  REGISTER
                </button>
              </div>
            )}

            {/* Navigation Tabs (Mobile Stacking) */}
            <nav className="flex flex-col gap-2 font-display text-xl tracking-wider">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                  activeTab === 'home'
                    ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ff1f6d] font-bold'
                    : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow'
                }`}
              >
                <span>EXPLORE EVENTS</span>
                <Sparkles size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('events')}
                className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                  activeTab === 'events'
                    ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ff1f6d] font-bold'
                    : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow'
                }`}
              >
                <span>ALL CATALOG</span>
                <Ticket size={16} />
              </button>

              {/* Customer Links */}
              {currentUser && currentUser.role === 'CUSTOMER' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('wishlist')}
                    className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                      activeTab === 'wishlist'
                        ? 'bg-neon-magenta text-grit-white border-asphalt-black shadow-[3px_3px_0px_#ffffff] font-bold'
                        : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-neon-magenta hover:text-neon-magenta'
                    }`}
                  >
                    <span>MY WISHLIST</span>
                    <Heart size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('my-bookings')}
                    className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                      activeTab === 'my-bookings'
                        ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff] font-bold'
                        : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow'
                    }`}
                  >
                    <span>MY TICKETS & PASSES</span>
                    <Ticket size={16} />
                  </button>
                </>
              )}

              {/* Organizer Links */}
              {currentUser && currentUser.role === 'ORGANIZER' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('create-event')}
                    className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                      activeTab === 'create-event'
                        ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff] font-bold'
                        : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow'
                    }`}
                  >
                    <span>CREATE NEW EVENT</span>
                    <PlusCircle size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('checkin')}
                    className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                      activeTab === 'checkin'
                        ? 'bg-neon-magenta text-grit-white border-asphalt-black shadow-[3px_3px_0px_#ffffff] font-bold'
                        : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-neon-magenta hover:text-neon-magenta'
                    }`}
                  >
                    <span>GATE SCANNER</span>
                    <QrCode size={16} />
                  </button>
                </>
              )}

              {/* Admin Link */}
              {currentUser && currentUser.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className={`w-full text-left px-4 py-2.5 border-2 transition-all flex items-center justify-between ${
                    activeTab === 'admin'
                      ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff] font-bold'
                      : 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow'
                  }`}
                >
                  <span>ADMIN DASHBOARD</span>
                  <ShieldCheck size={16} />
                </button>
              )}
            </nav>

            {/* Quick Currency & Theme Control */}
            <div className="bg-asphalt-card border border-asphalt-border p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-ticker">
              <div className="flex items-center gap-2">
                <span className="text-grit-dim uppercase">CURRENCY:</span>
                <select
                  value={currency}
                  onChange={(e) => setActiveCurrency(e.target.value)}
                  className="bg-asphalt-surface text-acid-yellow font-bold border border-acid-yellow px-2 py-1 outline-none cursor-pointer"
                >
                  {getAvailableCurrencies().map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 bg-asphalt-surface border border-asphalt-border px-2.5 py-1 text-grit-white hover:text-acid-yellow"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
              </button>
            </div>

            {/* Sign Out (Mobile) */}
            {currentUser && (
              <button
                type="button"
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-asphalt-card hover:bg-danger-red/20 border-2 border-danger-red text-danger-red font-impact text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={16} /> SIGN OUT OF SESSION
              </button>
            )}

            {/* Guarantee Tag */}
            <div className="text-center font-ticker text-[10px] text-grit-dim tracking-wider uppercase pt-2">
              ★ 100% VERIFIED PASSES • 10-MIN HOLD GUARANTEE ★
            </div>

          </div>
        </div>
      )}
    </>
  );
}
