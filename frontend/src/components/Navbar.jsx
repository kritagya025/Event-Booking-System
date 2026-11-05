import React, { useState, useEffect } from 'react';
import { 
  Ticket, PlusCircle, User, LogOut, ShieldCheck, QrCode, 
  Sun, Moon
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
  const [shockwave, setShockwave] = useState(null);
  const [themeToast, setThemeToast] = useState(null);

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
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = (e) => {
    const btnRect = e?.currentTarget?.getBoundingClientRect();
    const x = btnRect ? btnRect.left + btnRect.width / 2 : window.innerWidth - 40;
    const y = btnRect ? btnRect.top + btnRect.height / 2 : 40;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // 1. Trigger Laser Shockwave & CRT Beam overlay
    setShockwave({ x, y, radius: endRadius });
    setTimeout(() => setShockwave(null), 550);

    // 2. Trigger Zine HUD exposure notification badge
    setThemeToast(nextTheme === 'light' ? 'DAYLIGHT XEROX INK // PROTOCOL ACTIVE' : 'WAREHOUSE PROTOCOL // NIGHT PHOSPHOR');
    setTimeout(() => setThemeToast(null), 1400);

    // 3. Fallback if View Transitions API is not supported
    if (!document.startViewTransition) {
      document.documentElement.classList.add('theme-transitioning');
      setTheme(nextTheme);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 400);
      return;
    }

    // 4. Cutting-edge View Transitions: circular laser aperture wipe expanding from click position
    const transition = document.startViewTransition(() => {
      const root = document.documentElement;
      const body = document.body;
      if (nextTheme === 'light') {
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
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
        ],
        {
          duration: 520,
          easing: 'cubic-bezier(0.25, 1, 0.4, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
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
      {/* ─── Cutting-Edge Theme Laser Shockwave & CRT Scanner Beam ─── */}
      {shockwave && (
        <>
          <div 
            className="theme-laser-ring"
            style={{
              left: `${shockwave.x}px`,
              top: `${shockwave.y}px`,
              width: `${shockwave.radius * 2}px`,
              height: `${shockwave.radius * 2}px`,
            }}
          />
          <div className="theme-crt-beam" />
        </>
      )}

      {/* ─── Brutalist Cassette HUD Exposure Badge ─── */}
      {themeToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10002] bg-asphalt-black border-2 border-acid-yellow text-acid-yellow px-4 py-2 font-ticker text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_#ff1f6d] flex items-center gap-2.5 pointer-events-none animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-magenta animate-ping" />
          <span>⚡ {themeToast}</span>
        </div>
      )}

      {/* ─── 0. HIGH VOLTAGE HAZARD WARNING HEADER MARQUEE ─── */}
      <div className="h-7 w-full hazard-tape overflow-hidden flex items-center border-b-2 border-asphalt-black select-none">
        <div className="animate-marquee items-center gap-6 text-asphalt-black font-ticker font-extrabold text-[12px] tracking-widest uppercase py-0.5">
          <span>⚡ EVENTHUB // REAL-TIME STOMP SEAT CONCURRENCY ENGINE // 10-MINUTE SEAT LOCK PROTOCOL ⚡</span>
          <span>•</span>
          <span>INSTANT CRYPTOGRAPHIC QR CODE TICKETS // MULTI-CURRENCY SETTLEMENTS // ZERO DUPLICATE BOOKINGS</span>
          <span>•</span>
          <span>CONCERTS, TECH CONFERENCES, THEATER PRODUCTIONS & INDUSTRIAL WORKSHOPS</span>
          <span>•</span>
          <span>DIRECT ORGANIZER GATE SCANNER VALIDATION // 99.98% DISTRIBUTED UPTIME</span>
          <span>•</span>
          <span>⚡ EVENTHUB // REAL-TIME STOMP SEAT CONCURRENCY ENGINE // 10-MINUTE SEAT LOCK PROTOCOL ⚡</span>
          <span>•</span>
          <span>INSTANT CRYPTOGRAPHIC QR CODE TICKETS // MULTI-CURRENCY SETTLEMENTS // ZERO DUPLICATE BOOKINGS</span>
          <span>•</span>
          <span>CONCERTS, TECH CONFERENCES, THEATER PRODUCTIONS & INDUSTRIAL WORKSHOPS</span>
          <span>•</span>
          <span>DIRECT ORGANIZER GATE SCANNER VALIDATION // 99.98% DISTRIBUTED UPTIME</span>
        </div>
      </div>

      {/* ─── 1. BRUTALIST DIY CLUB FLYER NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 bg-asphalt-black/95 backdrop-blur-md border-b-2 border-asphalt-border px-4 py-3">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Stamp Logo */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="bg-acid-yellow text-asphalt-black px-2.5 py-0.5 font-display text-2xl tracking-wider -rotate-2 border-2 border-grit-white shadow-[3px_3px_0px_#ff1f6d] group-hover:rotate-0 transition-transform">
                EVENTHUB
              </div>
              <div className="hidden sm:flex flex-col font-ticker leading-none">
                <span className="text-xs font-bold text-grit-white tracking-widest uppercase">TICKETING_PROTOCOL</span>
                <span className="text-[10px] text-neon-magenta tracking-tight">REAL-TIME SEAT RESERVATION & PASSES</span>
              </div>
            </div>
            <span className="hidden lg:inline-block font-ticker text-[10px] bg-electric-cobalt text-grit-white px-2 py-0.5 uppercase font-bold border border-grit-white/40 stamp-slant-2">
              PLATFORM V2.4
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative flex items-center">
              <select 
                value={currency} 
                onChange={(e) => setActiveCurrency(e.target.value)}
                className="bg-asphalt-card text-acid-yellow font-ticker text-xs font-bold border-2 border-acid-yellow px-2 py-1 focus:outline-none appearance-none cursor-pointer pr-6 shadow-[2px_2px_0px_#ff1f6d]"
              >
                {getAvailableCurrencies().map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-acid-yellow pointer-events-none absolute right-1 text-xs font-bold">arrow_drop_down</span>
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
              className="w-8 h-8 bg-asphalt-card border border-asphalt-border text-grit-dim hover:text-acid-yellow flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
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
                  className="w-9 h-9 bg-acid-yellow text-asphalt-black font-ticker font-extrabold text-sm border-2 border-grit-white shadow-[2px_2px_0px_#ff1f6d] flex items-center justify-center cursor-pointer"
                  title={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials(currentUser)
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-asphalt-surface border-3 border-grit-white shadow-[6px_6px_0px_#ff1f6d] p-3 z-50">
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
                        className="flex items-center gap-2 p-1.5 hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left"
                      >
                        <User size={13} /> Account Profile
                      </button>

                      {currentUser.role === 'CUSTOMER' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('my-bookings'); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-2 p-1.5 hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left"
                        >
                          <Ticket size={13} /> My Tickets
                        </button>
                      )}

                      {currentUser.role === 'ORGANIZER' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('create-event'); setProfileDropdownOpen(false); }}
                            className="flex items-center gap-2 p-1.5 hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left"
                          >
                            <PlusCircle size={13} /> Create New Event
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('checkin'); setProfileDropdownOpen(false); }}
                            className="flex items-center gap-2 p-1.5 hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left"
                          >
                            <QrCode size={13} /> Gate Scanner
                          </button>
                        </>
                      )}

                      {currentUser.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('admin'); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-2 p-1.5 hover:bg-asphalt-card text-grit-white hover:text-acid-yellow text-left"
                        >
                          <ShieldCheck size={13} /> Admin Panel
                        </button>
                      )}

                      <div className="h-px bg-asphalt-border my-1" />

                      <button
                        type="button"
                        onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                        className="flex items-center gap-2 p-1.5 hover:bg-asphalt-card text-danger-red text-left font-bold"
                      >
                        <LogOut size={13} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleNavClick('login')} 
                  className="bg-asphalt-card hover:bg-asphalt-surface text-grit-white px-3 py-1 font-display text-base tracking-wider uppercase border border-asphalt-border hover:border-acid-yellow"
                >
                  SIGN IN
                </button>
                <button 
                  onClick={() => handleNavClick('register')} 
                  className="bg-neon-magenta hover:bg-neon-magenta-dark text-grit-white px-3 sm:px-4 py-1.5 font-display text-base tracking-wider uppercase border-2 border-grit-white shadow-[3px_3px_0px_#eefc54] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  REGISTER
                </button>
              </div>
            )}

          </div>

        </div>
      </header>
    </>
  );
}
