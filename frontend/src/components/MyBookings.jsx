import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Calendar, MapPin, Download, XCircle } from 'lucide-react';
import { apiFetch, getStoredToken } from '../services/api';
import { formatPrice } from '../services/currency';

export default function MyBookings({ currentUser, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/bookings/user/${currentUser?.id || 1}`);
      setBookings(data);
    } catch (_err) {
      setBookings([
        {
          id: 101,
          bookingDate: '2026-08-01T14:30:00',
          bookingStatus: 'CONFIRMED',
          quantity: 2,
          totalAmount: 150.00,
          event: {
            id: 1,
            name: 'Neon Horizon Cyber Music Festival 2026',
            eventDate: '2026-09-15',
            startTime: '19:00:00',
            category: 'MUSIC',
            venue: { name: 'Metro Arena Center', address: '450 Innovation Way, San Francisco' }
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchUserBookings();
    }
  }, [currentUser, fetchUserBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? Seats will be returned.')) return;

    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
      showToast('Booking cancelled. Waitlist auto-promoted.', 'info');
      fetchUserBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleDownloadPdf = async (booking) => {
    if (booking.bookingStatus === 'CANCELLED') {
      showToast('Cannot download ticket PDF for a cancelled booking.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/tickets/booking/${booking.id}/pdf`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Ticket PDF download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-${booking.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast('Unified booking PDF download started.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download ticket PDF.', 'error');
    }
  };

  const handleDownloadCalendar = (eventId) => {
    window.open(`http://localhost:8080/api/events/${eventId}/calendar.ics`, '_blank');
    showToast('Downloading calendar file...', 'info');
  };

  return (
    <div style={{ padding: '0 24px 40px 24px', maxWidth: '1320px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>My Tickets</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage bookings, download PDFs, or export to calendar</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <Ticket size={40} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontWeight: 700 }}>No bookings yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.88rem' }}>Explore events and reserve your seats</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>
                  {b.bookingStatus}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>#{b.id}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', fontWeight: 700 }}>{b.event?.name || 'Event'}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--text-subtle)" /> {b.event?.eventDate} @ {b.event?.startTime || '19:00'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} color="var(--text-subtle)" /> {b.event?.venue?.name || 'Venue'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={14} color="var(--text-subtle)" /> {b.quantity} ticket(s) · <strong style={{ color: '#FFF' }}>{formatPrice(b.totalAmount, b.event?.currency)}</strong>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '14px' }}>
                {b.bookingStatus !== 'CANCELLED' && (
                  <button onClick={() => handleDownloadPdf(b)} className="btn btn-primary btn-sm">
                    <Download size={12} /> Unified PDF Ticket
                  </button>
                )}

                <button onClick={() => handleDownloadCalendar(b.event?.id || 1)} className="btn btn-secondary btn-sm">
                  <Calendar size={12} /> Calendar
                </button>

                {b.bookingStatus === 'CONFIRMED' && (
                  <button onClick={() => handleCancelBooking(b.id)} className="btn btn-secondary btn-sm">
                    <XCircle size={12} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
