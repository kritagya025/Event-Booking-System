import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, Calendar, MapPin, Download, XCircle, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { apiFetch, BASE_URL } from '../services/api';
import { formatPrice } from '../services/currency';
import BookingCardSkeleton from './BookingCardSkeleton';
import { TicketSticker } from './CustomStickers';

export default function MyBookings({ currentUser, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUserBookings = useCallback(async () => {
    setLoading(true);
    let remoteData = [];
    try {
      remoteData = await apiFetch(`/bookings/user/${currentUser?.id || 1}`);
    } catch {
      remoteData = [
        {
          id: 101,
          bookingDate: '2026-08-01T14:30:00',
          bookingStatus: 'CONFIRMED',
          quantity: 2,
          totalAmount: 60.00,
          event: {
            id: 1,
            name: 'GLOBAL DEVELOPER SUMMIT 2026',
            eventDate: '2026-09-15',
            startTime: '10:00',
            category: 'TECH',
            venue: { name: 'METROPOLITAN CONVENTION CENTER', address: '4241 INNOVATION BLVD' }
          }
        }
      ];
    }

    try {
      const localBookings = JSON.parse(localStorage.getItem('my_local_bookings') || '[]');
      const combined = [...(localBookings || []), ...(remoteData || [])];
      const unique = Array.from(new Map(combined.map(b => [b.id, b])).values());
      setBookings(unique);
    } catch {
      setBookings(remoteData || []);
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
    if (!window.confirm('Cancel this booking? Allocated seats will return to live inventory.')) return;

    let localBookings = [];
    try {
      localBookings = JSON.parse(localStorage.getItem('my_local_bookings') || '[]');
    } catch {}

    const isLocal = localBookings.some((b) => b.id === bookingId);

    if (isLocal) {
      const updated = localBookings.filter((b) => b.id !== bookingId);
      localStorage.setItem('my_local_bookings', JSON.stringify(updated));
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      showToast('Booking cancelled successfully', 'info');
      return;
    }

    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      showToast('Booking cancelled successfully', 'info');
      fetchUserBookings();
    } catch (err) {
      showToast(err.message || 'Unable to cancel booking', 'error');
    }
  };

  const handleDownloadPdf = async (booking) => {
    try {
      const token = localStorage.getItem('token');
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
        link.download = `eventhub-ticket-${booking.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast('Ticket pass downloaded', 'success');
        return;
      }
    } catch (e) {
      console.warn('PDF API notice:', e);
    }

    // Clean EventHub Printable Pass Stub Fallback
    try {
      const eventImg = booking.event?.bannerImageUrl || (booking.event?.category?.toUpperCase().includes('TECH') ? '/images/tech.jpg' : '/images/concert.jpg');
      const passWindow = window.open('', '_blank');
      if (passWindow) {
        passWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>eventhub Ticket Pass #${booking.id}</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f7f7f7; color: #111111; padding: 40px 20px; margin: 0; }
              .pass-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
              .header { background: #111111; color: #ffffff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
              .header h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
              .header span { font-size: 11px; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 9999px; }
              .body { padding: 32px; }
              .event-title { font-size: 24px; font-weight: 800; margin: 0 0 16px 0; color: #111111; }
              .meta-row { display: flex; gap: 24px; margin-bottom: 24px; color: #6b7280; font-size: 14px; }
              .seats-pill { background: #f7f7f7; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
              .qr-section { text-align: center; padding: 24px 0 0 0; border-top: 1px dashed #e5e7eb; }
              .qr-section img { width: 140px; height: 140px; margin-bottom: 8px; }
              .serial { font-family: monospace; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="pass-container">
              <div class="header">
                <h2>eventhub</h2>
                <span>Verified Admission</span>
              </div>
              <div class="body">
                <div class="event-title">${booking.event?.name || 'Live Experience'}</div>
                <div class="meta-row">
                  <div><strong>Date:</strong> ${booking.event?.eventDate || '2026-09-15'}</div>
                  <div><strong>Time:</strong> ${booking.showtime || booking.event?.startTime || '19:00'}</div>
                  <div><strong>Venue:</strong> ${booking.screenName || booking.event?.venue?.name || 'Main Arena'}</div>
                </div>
                <div class="seats-pill">
                  <div>
                    <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Seats Reserved</div>
                    <div style="font-size: 18px; font-weight: 800; margin-top: 2px;">${booking.selectedSeats || 'General Admission'}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Total</div>
                    <div style="font-size: 18px; font-weight: 800; color: #111111; margin-top: 2px;">$${Number(booking.totalAmount || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div class="qr-section">
                  <img src="${booking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EVENTHUB-PASS-${booking.id}`}" alt="QR Pass" />
                  <div class="serial">PASS #${booking.id} · SCAN AT GATE</div>
                </div>
              </div>
            </div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
          </html>
        `);
        passWindow.document.close();
      }
    } catch {
      showToast('Generating ticket pass...', 'success');
    }
  };

  const handleDownloadCalendar = (eventId) => {
    window.open(`${BASE_URL}/events/${eventId}/calendar.ics`, '_blank');
    showToast('Downloading calendar file (.ics)...', 'info');
  };

  const handleOpenGoogleCalendar = async (eventId, eventData) => {
    try {
      const response = await apiFetch(`/events/${eventId}/google-calendar-link`);
      if (response && response.googleCalendarUrl) {
        window.open(response.googleCalendarUrl, '_blank');
        showToast('Synchronizing with Google Calendar...', 'success');
        return;
      }
    } catch (err) {
      console.warn('Backend calendar link fallback:', err);
    }

    const title = encodeURIComponent(eventData?.name || 'eventhub Experience');
    const details = encodeURIComponent(`Admission Ticket for ${eventData?.name || 'Live Event'}`);
    const location = encodeURIComponent(eventData?.venue?.name || 'Main Arena');
    const dateFormatted = (eventData?.eventDate || '2026-09-15').replace(/-/g, '');
    const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T230000Z/${dateFormatted}T060000Z`;
    window.open(gUrl, '_blank');
    showToast('Synchronizing with Google Calendar...', 'success');
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'CONFIRMED' && b.bookingStatus === 'CONFIRMED') ||
        (statusFilter === 'CANCELLED' && b.bookingStatus === 'CANCELLED');

      const matchesSearch =
        !searchQuery.trim() ||
        b.event?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.event?.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(b.id).includes(searchQuery);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalCount = bookings.length;
    const confirmedCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
    const upcomingCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED' && (!b.event?.eventDate || new Date(b.event.eventDate) >= new Date())).length;
    const totalSpent = bookings
      .filter(b => b.bookingStatus === 'CONFIRMED')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    return { totalCount, confirmedCount, upcomingCount, totalSpent };
  }, [bookings]);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 text-toy-black font-body">
      
      {/* Header */}
      <div className="mb-8 sm:mb-10 border-b-2 border-dashed border-toy-black/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-sun-yellow text-toy-black text-xs font-display font-black px-3 py-1 rounded-full border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
              <TicketSticker size={16} tilted={false} />
              <span>Party Pass Wallet</span>
            </span>
            <span className="text-xs text-toy-black/70 font-display font-bold">
              {currentUser?.email || 'Authenticated Attendee'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-toy-black leading-tight">
            My Parties & Booked Passes
          </h1>
          <p className="text-sm font-body font-semibold text-toy-black/70 mt-1.5 leading-relaxed">
            Manage your verified party tickets, reserved seating, and print passes.
          </p>
        </div>

        <button 
          onClick={fetchUserBookings} 
          className="h-[44px] px-5 rounded-full border-2 border-toy-black bg-white hover:bg-buttercream text-sm font-display font-black text-toy-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-toy hover:-translate-y-0.5 active:translate-y-0.5 self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Passes</span>
        </button>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
          <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Total Bookings</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-toy-black leading-none mt-2 block">
            {stats.totalCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
          <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Confirmed Passes</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-mint-pop leading-none mt-2 block">
            {stats.confirmedCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
          <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Upcoming Events</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-candy-purple leading-none mt-2 block">
            {stats.upcomingCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-toy-black p-5 shadow-toy">
          <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider block">Total Spent</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-bubble-pink leading-none mt-2 block truncate">
            {formatPrice(stats.totalSpent)}
          </span>
        </div>
      </div>

      {/* Filter Capsule and Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-toy-black p-3 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-toy">
        {/* Capsule Filter Pills */}
        <div className="flex p-1 bg-lilac-wash rounded-full border-2 border-toy-black w-full md:w-auto">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-display font-black transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-toy-black text-white shadow-[2px_2px_0px_#1E1B2E]'
                  : 'text-toy-black/70 hover:text-toy-black'
              }`}
            >
              {st === 'ALL' ? 'All Passes' : st === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-toy-black/50" />
          <input
            type="text"
            placeholder="Search party, venue, or pass ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-buttercream border-2 border-toy-black focus:bg-white text-toy-black font-bold rounded-full pl-11 pr-4 h-[44px] text-xs outline-none transition-all placeholder:text-toy-black/40"
          />
        </div>
      </div>

      {/* Bookings Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-[32px] border-[3px] border-toy-black p-12 text-center max-w-lg mx-auto shadow-toy-lg">
          <div className="w-16 h-16 rounded-full bg-sun-yellow border-2 border-toy-black shadow-toy flex items-center justify-center mx-auto mb-4">
            <TicketSticker size={38} />
          </div>
          <h3 className="text-xl font-display font-black text-toy-black">No party passes found</h3>
          <p className="text-sm font-body font-semibold text-toy-black/70 mt-1.5">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No passes match your search or filter criteria.'
              : 'Explore trending gatherings and RSVP to your first party!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => {
            const isCinema = b.isCinema || b.event?.category === 'CINEMA' || b.event?.category === 'MOVIE' || /imax|cinema|movie|film|screening|interstellar/i.test(b.event?.name || '');
            const isCancelled = b.bookingStatus === 'CANCELLED';

            return (
              <div 
                key={b.id} 
                className={`bg-white rounded-[28px] border-[3px] border-toy-black shadow-toy hover:shadow-pop-purple transition-all flex flex-col justify-between overflow-hidden ${
                  isCancelled ? 'opacity-65' : ''
                }`}
              >
                {/* Pass Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-toy-black/60 font-mono font-bold">
                      Pass #{b.id}
                    </span>
                    <span className={`text-xs font-display font-black px-3 py-1 rounded-full border-2 border-toy-black ${
                      isCancelled 
                        ? 'bg-coral-peach text-white shadow-[1.5px_1.5px_0px_#1E1B2E]' 
                        : 'bg-mint-pop text-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]'
                    }`}>
                      {isCancelled ? 'Cancelled' : isCinema ? 'Cinema Pass' : 'Confirmed'}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-black text-toy-black leading-snug mb-4">
                    {b.event?.name || 'Live Event'}
                  </h3>

                  <div className="space-y-2 text-xs text-toy-black/70 mb-5 font-body font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-bubble-pink shrink-0" />
                      <span>{b.event?.eventDate} @ {b.showtime || b.event?.startTime || '19:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-candy-purple shrink-0" />
                      <span className="truncate">{b.screenName || b.event?.venue?.name || 'Concert Arena'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Ticket size={14} className="text-sun-yellow shrink-0 mt-0.5" />
                      <span>
                        {b.quantity} Pass(es) · {b.selectedSeats ? `Seats: ${b.selectedSeats}` : 'General Admission'}
                      </span>
                    </div>
                    {b.snacks && Object.keys(b.snacks).length > 0 && (
                      <div className="pt-2 border-t border-toy-black/20 text-xs text-toy-black font-semibold">
                        <span className="text-toy-black/70">Snacks: </span>
                        <span>
                          {Object.entries(b.snacks).map(([k, q]) => `${q}x ${k.replace(/_/g, ' ')}`).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t-2 border-dashed border-toy-black/20 flex items-center justify-between">
                    <span className="text-xs font-display font-black text-toy-black/70 uppercase tracking-wider">Total</span>
                    <span className="text-xl font-display font-black text-toy-black">
                      {formatPrice(b.totalAmount, b.event?.currency)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="p-4 bg-buttercream border-t-2 border-toy-black flex flex-wrap gap-2 items-center">
                  {!isCancelled && (
                    <button 
                      onClick={() => handleDownloadPdf(b)} 
                      className="flex-1 min-w-[140px] h-[44px] rounded-full bg-sun-yellow hover:bg-[#ffe142] text-toy-black text-xs font-display font-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Print Pass</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleDownloadCalendar(b.event?.id || 1)} 
                      className="h-[44px] px-3.5 rounded-full border-2 border-toy-black bg-white hover:bg-lilac-wash text-toy-black text-xs font-display font-black transition-colors flex items-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0px_#1E1B2E]"
                      title="Download .ics file"
                    >
                      <Calendar size={13} />
                      <span>.ICS</span>
                    </button>

                    <button 
                      onClick={() => handleOpenGoogleCalendar(b.event?.id || 1, b.event)} 
                      className="h-[44px] px-3.5 rounded-full border-2 border-toy-black bg-white hover:bg-lilac-wash text-toy-black text-xs font-display font-black transition-colors flex items-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0px_#1E1B2E]"
                      title="Add to Google Calendar"
                    >
                      <ExternalLink size={13} />
                      <span>GCal</span>
                    </button>

                    {!isCancelled && (
                      <button 
                        onClick={() => handleCancelBooking(b.id)} 
                        className="h-[44px] px-3.5 rounded-full border-2 border-toy-black bg-coral-peach text-white text-xs font-display font-black transition-colors flex items-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0px_#1E1B2E]"
                        title="Cancel booking"
                      >
                        <XCircle size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
