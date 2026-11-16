import React, { useState, useEffect } from 'react';
import { 
  Ticket, User, LogOut, ShieldCheck, QrCode, 
  Menu, X, Heart, Film, Plus, Sparkles
} from 'lucide-react';
import { BalloonSticker, DiscoBallSticker, SparklesSticker, TicketSticker, PopcornBucketSticker } from './CustomStickers';

export default function Navbar({ 
  currentUser, 
  onNavigate, 
  activeTab, 
  onLogout 
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Floating Confetti Decorative Custom Stickers */}
      <div className="fixed top-36 left-6 lg:left-12 z-0 pointer-events-none float-slow hidden md:block select-none">
        <BalloonSticker size={64} />
      </div>
      <div className="fixed top-48 right-6 lg:right-12 z-0 pointer-events-none float-slow hidden md:block select-none" style={{ animationDelay: '1.2s' }}>
        <SparklesSticker size={66} />
      </div>
      <div className="fixed bottom-24 left-6 lg:left-12 z-0 pointer-events-none float-slow hidden md:block select-none" style={{ animationDelay: '0.7s' }}>
        <DiscoBallSticker size={62} />
      </div>

      {/* NAVIGATION HEADER: Chunky Neo-Memphis Floating Pill */}
      <header className="sticky top-4 w-full z-50 px-3 xs:px-4 sm:px-8">
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md border-[3px] border-toy-black rounded-full px-3 xs:px-4 sm:px-5 py-2 sm:py-3 shadow-toy flex items-center justify-between transition-transform duration-200">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-1.5 xs:gap-2 group cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-sun-yellow border-[2px] sm:border-[2.5px] border-toy-black shadow-[2px_2px_0px_#1E1B2E] flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
              <TicketSticker size={22} />
            </div>
            <span className="font-display font-black text-xl xs:text-2xl tracking-tight text-toy-black group-hover:text-bubble-pink transition-colors">
              EventHub
            </span>
            <span className="hidden xs:inline-block bg-bubble-pink text-white text-[9px] sm:text-[10px] font-display font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border border-toy-black rotate-[-4deg]">
              BOX OFFICE
            </span>
          </div>

          {/* Center Nav Pills */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-lilac-wash px-2 py-1.5 rounded-full border-2 border-toy-black select-none">
            <button 
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-4 py-1.5 rounded-full font-display font-bold text-sm transition-all ${
                activeTab === 'home' || activeTab === 'explore'
                  ? 'bg-white text-toy-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black -translate-y-0.5'
                  : 'text-toy-black/80 hover:text-candy-purple'
              }`}
            >
              Explore Events
            </button>

            <button 
              type="button"
              onClick={() => handleNavClick('home', { keyword: 'Cinema' })}
              className="px-3.5 py-1.5 rounded-full text-toy-black/80 hover:text-candy-purple font-display font-bold text-sm transition-colors"
            >
              Cinema & IMAX
            </button>

            {currentUser && currentUser.role === 'CUSTOMER' && (
              <>
                <button 
                  type="button"
                  onClick={() => handleNavClick('my-bookings')}
                  className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-colors ${
                    activeTab === 'my-bookings'
                      ? 'bg-white text-toy-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black'
                      : 'text-toy-black/80 hover:text-bubble-pink'
                  }`}
                >
                  My Passes
                </button>
                <button 
                  type="button"
                  onClick={() => handleNavClick('wishlist')}
                  className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-colors ${
                    activeTab === 'wishlist'
                      ? 'bg-white text-toy-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black'
                      : 'text-toy-black/80 hover:text-bubble-pink'
                  }`}
                >
                  Saved
                </button>
              </>
            )}

            {currentUser && currentUser.role === 'ORGANIZER' && (
              <>
                <button 
                  type="button"
                  onClick={() => handleNavClick('create-event')}
                  className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-colors ${
                    activeTab === 'create-event'
                      ? 'bg-white text-toy-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black'
                      : 'text-toy-black/80 hover:text-candy-purple'
                  }`}
                >
                  Create Event
                </button>
                <button 
                  type="button"
                  onClick={() => handleNavClick('checkin')}
                  className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-colors ${
                    activeTab === 'checkin'
                      ? 'bg-white text-toy-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black'
                      : 'text-toy-black/80 hover:text-candy-purple'
                  }`}
                >
                  Gate Scanner
                </button>
              </>
            )}

            {currentUser && currentUser.role === 'ADMIN' && (
              <button 
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-white text-toy-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black'
                    : 'text-toy-black/80 hover:text-candy-purple'
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Profile or Sign In */}
            {currentUser ? (
              <div id="user-profile-menu-container" className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-sun-yellow text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] font-display font-black text-sm flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden"
                  title={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials(currentUser)
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white text-toy-black rounded-2xl border-[3px] border-toy-black shadow-toy-lg p-3.5 z-50 animate-modal-pop">
                    <div className="pb-2.5 mb-2.5 border-b-2 border-toy-black/20">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-sm text-toy-black">
                          {currentUser.firstName} {currentUser.lastName}
                        </span>
                        <span className="bg-bubble-pink text-white text-[9px] font-display font-black uppercase px-2 py-0.5 rounded-full border border-toy-black">
                          {currentUser.role}
                        </span>
                      </div>
                      <span className="font-body font-semibold text-xs text-toy-black/60 truncate block mt-0.5">
                        {currentUser.email}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 font-display font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => { handleNavClick('profile'); setProfileDropdownOpen(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-buttercream/60 hover:bg-buttercream border border-toy-black/30 text-toy-black text-left cursor-pointer transition-colors"
                      >
                        <User size={14} className="text-candy-purple" />
                        <span>Account Profile</span>
                      </button>

                      {currentUser.role === 'CUSTOMER' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('my-bookings'); setProfileDropdownOpen(false); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-buttercream/60 hover:bg-buttercream border border-toy-black/30 text-toy-black text-left cursor-pointer transition-colors"
                          >
                            <Ticket size={14} className="text-mint-pop" />
                            <span>My Event Passes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleNavClick('wishlist'); setProfileDropdownOpen(false); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-buttercream/60 hover:bg-buttercream border border-toy-black/30 text-toy-black text-left cursor-pointer transition-colors"
                          >
                            <Heart size={14} className="text-bubble-pink" />
                            <span>Saved Events</span>
                          </button>
                        </>
                      )}

                      {currentUser.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('admin'); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sun-yellow/40 hover:bg-sun-yellow border border-toy-black/30 text-toy-black text-left cursor-pointer transition-colors"
                        >
                          <ShieldCheck size={14} className="text-toy-black" />
                          <span>Admin Control Center</span>
                        </button>
                      )}

                      {currentUser.role === 'ORGANIZER' && (
                        <button
                          type="button"
                          onClick={() => { handleNavClick('checkin'); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-mint-pop/30 hover:bg-mint-pop border border-toy-black/30 text-toy-black text-left cursor-pointer transition-colors"
                        >
                          <QrCode size={14} className="text-toy-black" />
                          <span>Gate Admission Scanner</span>
                        </button>
                      )}

                      <div className="pt-2 border-t border-dashed border-toy-black/20 mt-1">
                        <button
                          type="button"
                          onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-coral-peach/20 hover:bg-coral-peach/40 border border-toy-black/30 text-toy-black text-left cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-2 text-red-600 font-black">
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => handleNavClick('login')}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-toy-black font-display font-bold text-sm hover:text-bubble-pink transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Quick Action Button: Find Tickets or Create Event */}
            {currentUser && currentUser.role === 'ORGANIZER' ? (
              <button 
                type="button"
                onClick={() => handleNavClick('create-event')}
                className="px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-mint-pop text-toy-black font-display font-black text-xs sm:text-sm tracking-wide border-2 border-toy-black shadow-toy hover:bg-[#34f5aa] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E1B2E] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="hidden xs:inline">Create Event</span>
                <span className="xs:hidden">Create</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('explore');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    handleNavClick('home');
                  }
                }}
                className="px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-mint-pop text-toy-black font-display font-black text-xs sm:text-sm tracking-wide border-2 border-toy-black shadow-toy hover:bg-[#34f5aa] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E1B2E] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="hidden xs:inline">Find Tickets</span>
                <span className="xs:hidden">Tickets</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-lilac-wash text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] flex items-center justify-center cursor-pointer ml-1 shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-6xl mx-auto bg-white border-[3px] border-toy-black rounded-3xl p-5 shadow-toy-lg z-50">
            <div className="flex flex-col gap-2 font-display font-bold text-sm">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-buttercream border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
              >
                <Sparkles size={18} className="text-toy-black" />
                <span>Explore Events & Screenings</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('home', { keyword: 'Cinema' })}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-lilac-wash border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
              >
                <Film size={18} className="text-toy-black" />
                <span>Cinema & IMAX Screenings</span>
              </button>

              {currentUser && currentUser.role === 'CUSTOMER' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('my-bookings')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-mint-pop/30 border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
                  >
                    <TicketSticker size={20} tilted={false} />
                    <span>My Reserved Passes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('wishlist')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-bubble-pink/20 border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
                  >
                    <Heart size={18} className="text-bubble-pink" />
                    <span>Saved Wishlist</span>
                  </button>
                </>
              )}

              {currentUser && currentUser.role === 'ORGANIZER' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('create-event')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-mint-pop/30 border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
                  >
                    <Plus size={18} className="text-toy-black" />
                    <span>Create New Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('checkin')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-sun-yellow/40 border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
                  >
                    <QrCode size={18} className="text-toy-black" />
                    <span>Gate Scanner</span>
                  </button>
                </>
              )}

              {currentUser && currentUser.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-sun-yellow border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
                >
                  <ShieldCheck size={18} className="text-toy-black" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] text-left"
                  >
                    <User size={18} className="text-toy-black" />
                    <span>My Profile ({currentUser.firstName})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-coral-peach/20 border-2 border-toy-black text-red-600 font-black text-left"
                  >
                    <LogOut size={18} className="text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavClick('login')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-sun-yellow border-2 border-toy-black shadow-toy text-toy-black font-black text-left"
                >
                  <User size={18} className="text-toy-black" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
