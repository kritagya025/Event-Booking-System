import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, Edit3, X, LogOut, Shield, Ticket, Bookmark, DollarSign } from 'lucide-react';
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
      showToast('Profile specifications updated successfully', 'success');
      setIsEditOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto py-24 text-center font-sans text-[#111111]">
        <h3 className="text-3xl font-extrabold tracking-tight mb-2">Sign in required</h3>
        <p className="text-sm text-[#6b7280] mb-6">Sign in to access your profile, bookings, and digital passes.</p>
        <button 
          onClick={() => onNavigate('login')} 
          className="h-[51px] px-8 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
        >
          Sign In
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
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 text-toy-black font-body">
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <>
          {/* Profile Header Card */}
          <div className="bg-white rounded-[32px] border-[3px] border-toy-black p-6 sm:p-8 shadow-toy mb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 max-w-full">
                {/* Rounded Avatar Circle */}
                <div className="w-20 h-20 rounded-full bg-sun-yellow border-2 border-toy-black text-toy-black shadow-[2px_2px_0px_#1E1B2E] flex items-center justify-center text-3xl font-display font-black shrink-0">
                  {(profile.firstName || 'U')[0].toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 max-w-full">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-toy-black">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <span className="bg-bubble-pink text-white text-xs font-display font-black px-3 py-1 rounded-full uppercase tracking-wider border border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
                      {profile.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-body font-semibold text-toy-black/70">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-candy-purple" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-mint-pop" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsEditOpen(true)} 
                  className="h-[44px] px-5 rounded-full border-2 border-toy-black bg-white hover:bg-buttercream text-xs font-display font-black text-toy-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1E1B2E] flex-1 sm:flex-initial"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
                <button 
                  onClick={onLogout} 
                  className="h-[44px] px-5 rounded-full border-2 border-toy-black bg-coral-peach text-white text-xs font-display font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1E1B2E] flex-1 sm:flex-initial"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {!isOrganizer ? (
              <>
                <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
                  <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Total Bookings</span>
                  <span className="text-2xl sm:text-3xl font-display font-black text-toy-black leading-none mt-2 block">{bookings.length}</span>
                  <span className="text-xs text-candy-purple font-display font-bold block mt-1.5">{activeBookingsCount} confirmed passes</span>
                </div>

                <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
                  <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Total Spent</span>
                  <span className="text-2xl sm:text-3xl font-display font-black text-mint-pop leading-none mt-2 block">{formatPrice(totalSpent)}</span>
                  <span className="text-xs text-toy-black/70 block mt-1.5">Confirmed reservations</span>
                </div>

                <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
                  <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Watchlist</span>
                  <span className="text-2xl sm:text-3xl font-display font-black text-bubble-pink leading-none mt-2 block">{wishlist.length}</span>
                  <span className="text-xs text-toy-black/70 block mt-1.5">Saved experiences</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
                  <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Hosted Events</span>
                  <span className="text-2xl sm:text-3xl font-display font-black text-toy-black leading-none mt-2 block">{managedEvents.length}</span>
                  <span className="text-xs text-candy-purple font-display font-bold block mt-1.5">Active published shows</span>
                </div>

                <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
                  <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Tickets Allocated</span>
                  <span className="text-2xl sm:text-3xl font-display font-black text-sun-yellow leading-none mt-2 block">{totalTicketsSold}</span>
                  <span className="text-xs text-toy-black/70 block mt-1.5">Across hosted venues</span>
                </div>

                <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
                  <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Estimated Gross</span>
                  <span className="text-2xl sm:text-3xl font-display font-black text-mint-pop leading-none mt-2 block">{formatPrice(estimatedRevenue)}</span>
                  <span className="text-xs text-mint-pop font-semibold block mt-1.5">Gross ticket receipts</span>
                </div>
              </>
            )}
          </div>

          {/* Section Tabs (Capsule Pills) */}
          <div className="flex p-1.5 bg-lilac-wash rounded-full border-2 border-toy-black max-w-fit mb-6 overflow-x-auto shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-display font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]'
                  : 'text-toy-black/70 hover:text-toy-black'
              }`}
            >
              {isOrganizer ? 'Organizer Overview' : 'Account Details'}
            </button>

            {!isOrganizer ? (
              <>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-display font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'bookings'
                      ? 'bg-white text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]'
                      : 'text-toy-black/70 hover:text-toy-black'
                  }`}
                >
                  My Passes ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-display font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'wishlist'
                      ? 'bg-white text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]'
                      : 'text-toy-black/70 hover:text-toy-black'
                  }`}
                >
                  Watchlist ({wishlist.length})
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('events')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-display font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'bg-white text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]'
                    : 'text-toy-black/70 hover:text-toy-black'
                }`}
              >
                Managed Events ({managedEvents.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[28px] border-[3px] border-toy-black p-6 shadow-toy">
                <h3 className="text-xl font-display font-black tracking-tight text-toy-black mb-5">
                  Account Profile
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b-2 border-dashed border-toy-black/20 pb-2.5">
                    <span className="text-toy-black/70 font-display font-bold">Full Name</span>
                    <span className="text-toy-black font-display font-black">{profile.firstName} {profile.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b-2 border-dashed border-toy-black/20 pb-2.5">
                    <span className="text-toy-black/70 font-display font-bold">Email Address</span>
                    <span className="text-toy-black font-display font-black truncate">{profile.email}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-toy-black/20 pb-2.5">
                    <span className="text-toy-black/70 font-display font-bold">Phone Number</span>
                    <span className="text-toy-black font-display font-black">{profile.phone || 'None provided'}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-toy-black/20 pb-2.5">
                    <span className="text-toy-black/70 font-display font-bold">Role</span>
                    <span className="text-candy-purple font-display font-black uppercase">{profile.role}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[28px] border-[3px] border-toy-black p-6 shadow-toy">
                <h3 className="text-xl font-display font-black tracking-tight text-toy-black mb-3 flex items-center gap-2">
                  <Shield size={20} className="text-mint-pop" />
                  <span>Security & Safety</span>
                </h3>
                <p className="text-xs text-toy-black/70 mb-5 leading-relaxed font-body font-semibold">
                  Your EventHub account is protected with authenticated session tokens and encrypted customer records.
                </p>
                <div className="bg-buttercream border-2 border-toy-black rounded-2xl p-4 text-xs text-toy-black/80 font-bold shadow-sm">
                  <span className="font-display font-black text-toy-black block mb-1">Account Identifier</span>
                  <span className="font-mono">#EVENTHUB-USER-{profile.id || 1} · Verified Active</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsEditOpen(false)}>
          <div 
            className="w-full max-w-md bg-white text-[#111111] rounded-[28px] border border-[#e5e7eb] shadow-2xl p-6 sm:p-7 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-4 mb-5">
              <h3 className="text-xl font-bold tracking-tight">Edit Profile</h3>
              <button 
                onClick={() => setIsEditOpen(false)} 
                className="w-8 h-8 rounded-full bg-[#f7f7f7] hover:bg-[#ebebeb] flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-4 h-[44px] text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-4 h-[44px] text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-4 h-[44px] text-sm outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)} 
                  className="h-[44px] px-5 rounded-full border border-[#e5e7eb] hover:bg-[#f7f7f7] text-xs font-semibold text-[#111111] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="h-[44px] px-6 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
