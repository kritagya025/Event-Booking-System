import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, ShieldCheck, Ticket, Heart, Calendar, 
  MapPin, Download, PlusCircle, QrCode, DollarSign, Edit3, X, CheckCircle, 
  TrendingUp, Award, Layers, LogOut, Lock, RefreshCw, Zap, Trash2
} from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';
import { formatPrice } from '../services/currency';
import confetti from 'canvas-confetti';

export default function ProfileDashboard({ currentUser, onNavigate, showToast, onUpdateUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'wishlist' | 'events'
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(currentUser);

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

  useEffect(() => {
    if (!currentUser) return;
    fetchProfileData();
  }, [currentUser]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Fetch fresh user profile
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
        // Fetch Organizer events
        const eventsRes = await apiFetch('/events?size=50').catch(() => null);
        if (eventsRes && eventsRes.content) {
          setManagedEvents(eventsRes.content);
        }
      }

      if (currentUser.role === 'CUSTOMER' || currentUser.role === 'ADMIN') {
        // Fetch Customer bookings and wishlist
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
  };

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
      showToast('Profile details updated successfully', 'success');
      setIsEditOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteManagedEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to remove event "${eventName || 'this event'}"?`)) return;
    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      showToast('Event removed successfully', 'success');
      setManagedEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      showToast(err.message || 'Failed to remove event', 'error');
    }
  };

  const handleDownloadPdf = async (booking) => {
    if (booking.bookingStatus === 'CANCELLED') {
      showToast('Cannot download tickets for a cancelled booking', 'error');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/booking/${booking.id}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!response.ok) throw new Error('PDF download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-${booking.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast('Downloaded PDF Ticket', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download ticket PDF', 'error');
    }
  };

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h3>Please sign in to view your Profile Dashboard</h3>
        <button onClick={() => onNavigate('login')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Sign In
        </button>
      </div>
    );
  }

  const isOrganizer = currentUser.role === 'ORGANIZER';

  // Calculate Metrics
  const totalSpent = bookings.reduce((sum, b) => b.bookingStatus === 'CONFIRMED' ? sum + (b.totalAmount || 0) : sum, 0);
  const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;

  const totalTicketsSold = managedEvents.reduce((sum, e) => sum + (e.availableSeats ? (100 - e.availableSeats) : 25), 0);
  const estimatedRevenue = managedEvents.reduce((sum, e) => sum + (e.ticketPrice * 25), 0);

  return (
    <div style={{ padding: '0 24px 60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* ─── Profile Header Card ─── */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* User Avatar Circle */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: isOrganizer ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: '800',
              color: '#FFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}>
              {(profile.firstName || 'U')[0].toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>
                  {profile.firstName} {profile.lastName}
                </h2>
                <span className={`badge ${isOrganizer ? 'badge-purple' : 'badge-green'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> {profile.role}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--text-subtle)" /> {profile.email}
                </span>
                {profile.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--text-subtle)" /> {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsEditOpen(true)} className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '0.85rem' }}>
              <Edit3 size={14} /> Edit Profile
            </button>
            <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '0.85rem', color: '#ef4444' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>

        </div>
      </div>

      {/* ─── Role-Based KPI Metrics Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        {!isOrganizer ? (
          <>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL BOOKINGS</span>
                <Ticket size={18} color="var(--accent-purple, #a855f7)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{bookings.length}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{activeBookingsCount} confirmed active</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SPENT</span>
                <DollarSign size={18} color="#22c55e" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatPrice(totalSpent)}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Active currency format</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAVED WISHLIST</span>
                <Heart size={18} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{wishlist.length}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Events bookmarked</span>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>MANAGED EVENTS</span>
                <Layers size={18} color="var(--accent-purple, #a855f7)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{managedEvents.length}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Published on catalog</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TICKETS SOLD</span>
                <Ticket size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalTicketsSold}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Across hosted events</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED REVENUE</span>
                <TrendingUp size={18} color="#22c55e" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatPrice(estimatedRevenue)}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Gross event volume</span>
            </div>
          </>
        )}

      </div>

      {/* ─── Dashboard Section Tabs ─── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 4px',
            borderBottom: activeTab === 'overview' ? '2px solid #FFF' : '2px solid transparent',
            color: activeTab === 'overview' ? '#FFF' : 'var(--text-muted)',
            fontWeight: activeTab === 'overview' ? '700' : '400',
            fontSize: '0.9rem',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          {isOrganizer ? 'Organizer Overview' : 'Customer Overview'}
        </button>

        {!isOrganizer ? (
          <>
            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                padding: '12px 4px',
                borderBottom: activeTab === 'bookings' ? '2px solid #FFF' : '2px solid transparent',
                color: activeTab === 'bookings' ? '#FFF' : 'var(--text-muted)',
                fontWeight: activeTab === 'bookings' ? '700' : '400',
                fontSize: '0.9rem',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              My Tickets ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              style={{
                padding: '12px 4px',
                borderBottom: activeTab === 'wishlist' ? '2px solid #FFF' : '2px solid transparent',
                color: activeTab === 'wishlist' ? '#FFF' : 'var(--text-muted)',
                fontWeight: activeTab === 'wishlist' ? '700' : '400',
                fontSize: '0.9rem',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              Wishlist ({wishlist.length})
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '12px 4px',
              borderBottom: activeTab === 'events' ? '2px solid #FFF' : '2px solid transparent',
              color: activeTab === 'events' ? '#FFF' : 'var(--text-muted)',
              fontWeight: activeTab === 'events' ? '700' : '400',
              fontSize: '0.9rem',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            My Managed Events ({managedEvents.length})
          </button>
        )}
      </div>

      {/* ─── TAB CONTENT ─── */}

      {/* CUSTOMER / ORGANIZER OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Main Activity Column */}
          <div>
            {!isOrganizer ? (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="btn btn-secondary btn-sm">
                    View All
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tickets booked yet. Browse events to reserve your seats.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookings.slice(0, 3).map((b) => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.92rem' }}>{b.event?.name || 'Event Ticket'}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.event?.eventDate} · {b.quantity} seat(s)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>{b.bookingStatus}</span>
                          {b.bookingStatus === 'CONFIRMED' && (
                            <button onClick={() => handleDownloadPdf(b)} className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }}>
                              <Download size={12} /> PDF
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Managed Events Catalog</h3>
                  <button onClick={() => onNavigate('create-event')} className="btn btn-primary btn-sm">
                    <PlusCircle size={14} /> Create Event
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {managedEvents.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>{ev.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.category} · {ev.eventDate} · {ev.availableSeats} seats left</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(ev.ticketPrice, ev.currency)}</span>
                        <span className="badge badge-purple">PUBLISHED</span>
                        <button 
                          onClick={() => handleDeleteManagedEvent(ev.id, ev.name)} 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px 10px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                          title="Remove Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Tools & Quick Actions Column */}
          <div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Quick Tools</h3>

              {isOrganizer ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => onNavigate('create-event')} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                    <PlusCircle size={16} /> Publish New Event
                  </button>
                  <button onClick={() => onNavigate('checkin')} className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
                    <QrCode size={16} /> Launch Gate QR Scanner
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => onNavigate('home')} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                    Browse All Events
                  </button>
                  <button onClick={() => setActiveTab('bookings')} className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
                    Download My Tickets
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* CUSTOMER BOOKINGS LIST TAB */}
      {activeTab === 'bookings' && !isOrganizer && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>{b.bookingStatus}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>#{b.id}</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{b.event?.name || 'Event'}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {b.event?.eventDate} · {b.quantity} seat(s) · Total: {formatPrice(b.totalAmount, b.event?.currency)}
              </p>
              {b.bookingStatus !== 'CANCELLED' && (
                <button onClick={() => handleDownloadPdf(b)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Download size={14} /> Download Unified PDF Ticket
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Edit Account Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="btn btn-secondary" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name<span style={{ color: '#ef4444' }}> *</span></label>
                    <input type="text" required value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name<span style={{ color: '#ef4444' }}> *</span></label>
                    <input type="text" required value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Phone Number</label>
                  <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="form-input" placeholder="+1 (555) 000-0000" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
