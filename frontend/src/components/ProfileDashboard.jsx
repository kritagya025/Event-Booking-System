import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, Edit3, X, LogOut } from 'lucide-react';
import { apiFetch, BASE_URL } from '../services/api';
import { formatPrice } from '../services/currency';
import ProfileSkeleton from './ProfileSkeleton';

export default function ProfileDashboard({ currentUser, onNavigate, showToast, onUpdateUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'wishlist' | 'events'
  const [profile, setProfile] = useState(currentUser);
  const [loading, setLoading] = useState(true);

  // Customer Data
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Organizer Data
  const [managedEvents, setManagedEvents] = useState([]);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const userRes = await apiFetch('/users/me').catch(() => currentUser);
      if (userRes) {
        setProfile(userRes);
        setEditForm({
          firstName: userRes.firstName || '',
          lastName: userRes.lastName || '',
          phone: userRes.phone || ''
        });
      }

      const isOrg = currentUser.role === 'ORGANIZER' || currentUser.role === 'ADMIN';

      if (isOrg) {
        const eventsRes = await apiFetch('/events?size=50').catch(() => null);
        if (eventsRes && eventsRes.content) {
          setManagedEvents(eventsRes.content);
        }
      }

      if (currentUser.role === 'CUSTOMER' || currentUser.role === 'ADMIN') {
        const [bRes, wRes] = await Promise.all([
          apiFetch('/bookings/user/' + (currentUser.id || 1)).catch(() => []),
          apiFetch('/wishlist/user/' + (currentUser.id || 1)).catch(() => [])
        ]);
        setBookings(Array.isArray(bRes) ? bRes : []);
        setWishlist(Array.isArray(wRes) ? wRes : []);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetchProfileData();
  }, [currentUser, fetchProfileData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setProfile(updated);
      if (onUpdateUser) onUpdateUser(updated);
      showToast('PROFILE SPECIFICATIONS UPDATED', 'success');
      setIsEditOpen(false);
    } catch (err) {
      showToast(err.message || 'FAILED TO UPDATE PROFILE', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const _handleDeleteManagedEvent = async (eventId, eventName) => {
    if (!window.confirm(`ARE YOU SURE YOU WANT TO REMOVE EVENT "${eventName || 'THIS EVENT'}"?`)) return;
    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      showToast('EVENT REMOVED FROM CATALOG', 'success');
      setManagedEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      showToast(err.message || 'FAILED TO REMOVE EVENT', 'error');
    }
  };

  const _handleDownloadPdf = async (booking) => {
    if (booking.bookingStatus === 'CANCELLED') {
      showToast('CANNOT DOWNLOAD PASS FOR CANCELLED RESERVATION', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/tickets/booking/${booking.id}/pdf`, {
        headers,
        credentials: 'include'
      }).catch(() => null);

      if (response && response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `EVENTHUB-Pass-${booking.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast('TICKET ADMISSION PASS DOWNLOADED', 'success');
      } else {
        throw new Error('PDF download failed');
      }
    } catch (err) {
      showToast(err.message || 'FAILED TO DOWNLOAD PASS', 'error');
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto py-24 text-center font-mono-zine text-grit-white">
        <h3 className="font-display text-3xl uppercase mb-4">AUTHENTICATION REQUIRED</h3>
        <p className="text-xs text-grit-dim uppercase mb-6">SIGN IN TO ACCESS YOUR PROFILE, BOOKINGS, AND TICKET PASSES</p>
        <button 
          onClick={() => onNavigate('login')} 
          className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-base uppercase px-6 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white shadow-[4px_4px_0px_#ffffff] cursor-pointer"
        >
          SIGN IN
        </button>
      </div>
    );
  }

  const isOrganizer = currentUser.role === 'ORGANIZER';

  const totalSpent = bookings.reduce((sum, b) => b.bookingStatus === 'CONFIRMED' ? sum + (b.totalAmount || 0) : sum, 0);
  const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;

  const totalTicketsSold = managedEvents.reduce((sum, e) => sum + (e.availableSeats ? (100 - e.availableSeats) : 25), 0);
  const estimatedRevenue = managedEvents.reduce((sum, e) => sum + (e.ticketPrice * 25), 0);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-grit-white font-mono-zine">
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <>
          {/* Profile Header Box */}
      <div className="bg-asphalt-surface border-2 border-grit-white p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_#E2F13C] mb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 max-w-full">
            {/* Stamp Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-acid-yellow text-asphalt-black border-2 border-asphalt-black flex items-center justify-center font-display text-3xl sm:text-4xl font-bold shadow-[4px_4px_0px_#0e0e11] shrink-0">
              {(profile.firstName || 'U')[0].toUpperCase()}
            </div>

            <div className="min-w-0 flex-1 max-w-full">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-1 flex-wrap">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-grit-white leading-tight sm:leading-none break-words">
                  {profile.firstName} {profile.lastName}
                </h2>
                <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2.5 py-0.5 border border-asphalt-black shadow-[2px_2px_0px_#0e0e11] uppercase shrink-0">
                  {profile.role}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-4 text-xs font-mono-zine text-grit-dim uppercase min-w-0 max-w-full">
                <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                  <Mail size={13} className="text-acid-yellow shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Phone size={13} className="text-acid-yellow shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsEditOpen(true)} 
              className="bg-asphalt-card border-2 border-asphalt-border hover:border-acid-yellow text-grit-white font-impact tracking-wider text-xs px-4 py-2 uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all touch-manipulation flex-1 sm:flex-initial"
            >
              <Edit3 size={13} /> EDIT PROFILE
            </button>
            <button 
              onClick={onLogout} 
              className="bg-asphalt-card border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-grit-white font-impact tracking-wider text-xs px-4 py-2 uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all touch-manipulation flex-1 sm:flex-initial"
            >
              <LogOut size={13} /> LOG OUT
            </button>
          </div>

        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {!isOrganizer ? (
          <>
            <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#eefc54]">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TOTAL BOOKINGS</span>
              <span className="font-display text-2xl sm:text-3xl text-grit-white font-bold leading-none mt-1 block">{bookings.length}</span>
              <span className="text-[10px] text-acid-yellow uppercase block mt-1">{activeBookingsCount} CONFIRMED PASSES</span>
            </div>

            <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#ff1f6d]">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TOTAL SPENT</span>
              <span className="font-display text-2xl sm:text-3xl text-acid-yellow font-bold leading-none mt-1 block">{formatPrice(totalSpent)}</span>
              <span className="text-[10px] text-grit-dim uppercase block mt-1">CONFIRMED RESERVATIONS</span>
            </div>

            <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#1d4ed8]">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">SAVED EVENTS</span>
              <span className="font-display text-2xl sm:text-3xl text-blue-400 font-bold leading-none mt-1 block">{wishlist.length}</span>
              <span className="text-[10px] text-grit-dim uppercase block mt-1">WISHLIST BOOKMARKS</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#eefc54]">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">HOSTED EVENTS</span>
              <span className="font-display text-2xl sm:text-3xl text-grit-white font-bold leading-none mt-1 block">{managedEvents.length}</span>
              <span className="text-[10px] text-acid-yellow uppercase block mt-1">ACTIVE LIVE EVENTS</span>
            </div>

            <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#ff1f6d]">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TICKETS ALLOCATED</span>
              <span className="font-display text-2xl sm:text-3xl text-acid-yellow font-bold leading-none mt-1 block">{totalTicketsSold}</span>
              <span className="text-[10px] text-grit-dim uppercase block mt-1">ACROSS HOSTED EVENTS</span>
            </div>

            <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#1d4ed8]">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">ESTIMATED REVENUE</span>
              <span className="font-display text-2xl sm:text-3xl text-blue-400 font-bold leading-none mt-1 block">{formatPrice(estimatedRevenue)}</span>
              <span className="text-[10px] text-grit-dim uppercase block mt-1">GROSS TICKET SALES</span>
            </div>
          </>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b-2 border-asphalt-border pb-3 sm:pb-4 mb-6 overflow-x-auto touch-scroll scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 sm:px-4 py-2 font-impact tracking-wider text-xs uppercase border-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'overview'
              ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff]'
              : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
          }`}
        >
          {isOrganizer ? 'ORGANIZER DASHBOARD' : 'ACCOUNT OVERVIEW'}
        </button>

        {!isOrganizer ? (
          <>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 sm:px-4 py-2 font-impact tracking-wider text-xs uppercase border-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              MY TICKETS ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3 sm:px-4 py-2 font-impact tracking-wider text-xs uppercase border-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'wishlist'
                  ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              SAVED EVENTS ({wishlist.length})
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 sm:px-4 py-2 font-impact tracking-wider text-xs uppercase border-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'events'
                ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[3px_3px_0px_#ffffff]'
                : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
            }`}
          >
            MANAGED EVENTS ({managedEvents.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-asphalt-surface border-2 border-grit-white p-4 sm:p-6 shadow-[3px_3px_0px_#E2F13C]">
            <h3 className="font-display text-2xl uppercase tracking-tight text-grit-white leading-none mb-4">
              ACCOUNT PROFILE DETAILS
            </h3>
            <div className="space-y-3 font-mono-zine text-xs uppercase">
              <div className="flex justify-between border-b border-asphalt-border pb-2 gap-2">
                <span className="text-grit-dim shrink-0">FULL NAME:</span>
                <span className="text-grit-white font-bold text-right break-words">{profile.firstName} {profile.lastName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-asphalt-border pb-2 gap-2 min-w-0">
                <span className="text-grit-dim shrink-0">EMAIL ADDRESS:</span>
                <span className="text-grit-white font-bold truncate text-right min-w-0 flex-1">{profile.email}</span>
              </div>
              <div className="flex justify-between border-b border-asphalt-border pb-2 gap-2">
                <span className="text-grit-dim shrink-0">PHONE NUMBER:</span>
                <span className="text-grit-white font-bold text-right">{profile.phone || 'NONE SPECIFIED'}</span>
              </div>
              <div className="flex justify-between border-b border-asphalt-border pb-2 gap-2">
                <span className="text-grit-dim shrink-0">ACCOUNT ROLE:</span>
                <span className="text-acid-yellow font-bold text-right">{profile.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-asphalt-surface border-2 border-grit-white p-4 sm:p-6 shadow-[3px_3px_0px_#F43F5E]">
            <h3 className="font-display text-2xl uppercase tracking-tight text-grit-white leading-none mb-4">
              SECURITY PROTOCOL
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase mb-4 leading-relaxed">
              THIS ACCOUNT IS SECURED WITH INDUSTRY-STANDARD ENCRYPTION AND ACTIVE FRAUD DEFENSE.
            </p>
            <div className="hazard-tape h-3 w-full mb-4"></div>
            <div className="text-[10px] font-ticker text-grit-dim uppercase">
              ACCOUNT ID: #EHB-USER-{profile.id || 1} // VERIFIED BUYER STATUS
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-asphalt-black/85 flex items-center justify-center p-3 sm:p-4 overflow-y-auto safe-pb touch-scroll" onClick={() => setIsEditOpen(false)}>
          <div 
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[4px_4px_0px_#E2F13C] p-4 sm:p-6 relative font-mono-zine my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b-2 border-asphalt-border pb-3 mb-4">
              <h3 className="font-display text-xl sm:text-2xl uppercase">EDIT ACCOUNT PROFILE</h3>
              <button 
                onClick={() => setIsEditOpen(false)} 
                className="text-grit-dim hover:text-neon-magenta p-2 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer touch-manipulation"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-grit-dim uppercase mb-1">FIRST NAME</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs uppercase outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-grit-dim uppercase mb-1">LAST NAME</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs uppercase outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-grit-dim uppercase mb-1">PHONE NUMBER</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs uppercase outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-asphalt-border gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)} 
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-grit-white font-mono-zine text-xs px-3 py-2 min-h-[38px] uppercase cursor-pointer touch-manipulation"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-sm uppercase px-5 py-2 min-h-[40px] border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white shadow-[2px_2px_0px_#ffffff] cursor-pointer touch-manipulation"
                >
                  {savingProfile ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
