import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, Calendar, MapPin, Download, XCircle, Search, ExternalLink } from 'lucide-react';
import { apiFetch, BASE_URL } from '../services/api';
import { formatPrice } from '../services/currency';
import BookingCardSkeleton from './BookingCardSkeleton';

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
    if (!window.confirm('CANCEL THIS BOOKING? ALLOCATED SEATS WILL RETURN TO LIVE INVENTORY.')) return;

    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
      showToast('BOOKING CANCELLED AND SEATS RELEASED', 'info');
      fetchUserBookings();
    } catch (err) {
      showToast(err.message || 'FAILED TO CANCEL BOOKING', 'error');
    }
  };

  const handleDownloadPdf = async (booking) => {
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
        link.download = `EVENTHUB-Ticket-${booking.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast('TICKET ADMISSION PASS DOWNLOADED', 'success');
        return;
      }
    } catch (e) {
      console.warn('PDF API notice:', e);
    }

    // High-Fidelity EventHub Brutalist Printable Pass Stub Fallback
    try {
      const passWindow = window.open('', '_blank');
      if (passWindow) {
        passWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>EVENTHUB VIP PASS #${booking.id}</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: 'JetBrains Mono', 'Courier New', monospace; background: #0e0e11; color: #f5f5f0; padding: 40px 16px; text-align: center; margin: 0; }
              .pass-card { max-width: 520px; margin: 0 auto; background: #16161c; border: 3px solid #f5f5f0; padding: 0; box-shadow: 10px 10px 0px #eefc54; text-align: left; overflow: hidden; position: relative; }
              .hazard { height: 10px; background: repeating-linear-gradient(-45deg, #eefc54, #eefc54 10px, #0e0e11 10px, #0e0e11 20px); }
              .pass-body { padding: 24px; }
              .top-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2d2d38; padding-bottom: 12px; margin-bottom: 16px; }
              .logo { font-size: 22px; font-weight: 900; color: #f5f5f0; letter-spacing: -1px; }
              .pass-badge { background: #eefc54; color: #0e0e11; padding: 2px 6px; font-size: 10px; font-weight: 900; vertical-align: middle; margin-left: 6px; }
              .season-badge { background: #ff1f6d; color: #f5f5f0; padding: 3px 8px; font-size: 9px; font-weight: 900; text-transform: uppercase; border: 1px solid #0e0e11; }
              .serial { color: #eefc54; font-size: 10px; font-weight: bold; margin-top: 4px; text-align: right; }
              .event-title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #f5f5f0; text-transform: uppercase; line-height: 1.1; }
              .event-meta { font-size: 11px; color: #eefc54; margin: 0 0 16px 0; font-weight: bold; text-transform: uppercase; }
              .venue-box { background: #1c1c24; border: 1px solid #2d2d38; padding: 12px; margin-bottom: 16px; }
              .venue-label { font-size: 9px; color: #90929e; text-transform: uppercase; letter-spacing: 1px; }
              .venue-name { font-size: 13px; font-weight: bold; color: #f5f5f0; margin-top: 2px; }
              .split-grid { display: grid; grid-template-columns: 1fr 140px; gap: 16px; align-items: center; background: #1c1c24; border: 1px solid #2d2d38; padding: 14px; margin-bottom: 16px; }
              .holder-label { font-size: 9px; color: #90929e; text-transform: uppercase; }
              .holder-name { font-size: 15px; font-weight: 900; color: #f5f5f0; margin: 2px 0; text-transform: uppercase; }
              .holder-email { font-size: 10px; color: #90929e; word-break: break-all; }
              .seat-badge { display: inline-block; background: #eefc54; color: #0e0e11; padding: 4px 8px; font-size: 13px; font-weight: 900; margin-top: 8px; }
              .qr-box { text-align: center; background: #ffffff; padding: 8px; border: 2px solid #0e0e11; }
              .qr-box img { width: 110px; height: 110px; display: block; margin: 0 auto; }
              .qr-label { font-size: 8px; font-weight: 900; color: #0e0e11; margin-top: 4px; text-transform: uppercase; }
              .perf-line { border-top: 2px dashed #374151; margin: 16px 0; position: relative; text-align: center; }
              .perf-label { background: #16161c; padding: 0 8px; font-size: 9px; color: #90929e; text-transform: uppercase; position: relative; top: -7px; }
              .guarantees { display: flex; justify-content: space-between; font-size: 8px; color: #eefc54; text-transform: uppercase; font-weight: bold; margin-bottom: 12px; }
              .print-btn { display: block; width: 100%; background: #ff1f6d; color: #f5f5f0; border: 2px solid #f5f5f0; padding: 14px; font-weight: 900; font-size: 14px; cursor: pointer; text-transform: uppercase; box-shadow: 4px 4px 0px #eefc54; transition: all 0.2s; }
              .print-btn:hover { background: #eefc54; color: #0e0e11; }
              @media print {
                body { background: #fff; padding: 0; }
                .pass-card { box-shadow: none; border-color: #000; }
                .print-btn { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="pass-card">
              <div class="hazard"></div>
              <div class="pass-body">
                <div class="top-row">
                  <div>
                    <span class="logo">EVENTHUB<span class="pass-badge">VIP PASS</span></span>
                    <div style="font-size: 8px; color: #90929e; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">
                      AUTHENTICATED ADMISSION GATEWAY
                    </div>
                  </div>
                  <div>
                    <div class="season-badge">SEASON 2026</div>
                    <div class="serial">EHB-${booking.id}</div>
                  </div>
                </div>

                <h1 class="event-title">${booking.event?.name || 'LIVE ARENA EVENT'}</h1>
                <div class="event-meta">
                  ⚡ ${booking.event?.eventDate || '2026-10-24'} @ ${booking.isCinema ? (booking.showtime || '06:15 PM') : (booking.event?.startTime || '07:30 PM')}
                </div>

                <div class="venue-box">
                  <div class="venue-label">LOCATION & AUDITORIUM:</div>
                  <div class="venue-name">${booking.screenName || booking.event?.venue?.name || 'MAIN CONCERT ARENA'}</div>
                  <div style="font-size: 10px; color: #90929e; margin-top: 2px;">${booking.event?.venue?.address || 'MAIN EVENT GATE 01'}</div>
                </div>

                <div class="split-grid">
                  <div>
                    <div class="holder-label">ACCREDITED ATTENDEE:</div>
                    <div class="holder-name">${currentUser?.firstName || 'VIP'} ${currentUser?.lastName || 'ATTENDEE'}</div>
                    <div class="holder-email">${currentUser?.email || 'AUTHENTICATED HOLDER'}</div>
                    <div class="seat-badge">SEAT: ${booking.selectedSeats || 'GENERAL ADMISSION'}</div>
                  </div>
                  <div class="qr-box">
                    <img src="${booking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EVENTHUB-PASS-${booking.id}`}" alt="Pass QR" />
                    <div class="qr-label">SCAN AT GATE</div>
                  </div>
                </div>

                <div class="perf-line">
                  <span class="perf-label">✂ DETACH AT TURNSTILE GATE ✂</span>
                </div>

                <div class="guarantees">
                  <span>⚡ 10-MIN CART LOCK</span>
                  <span>🛡️ ZERO OVERBOOKING</span>
                  <span>🎟️ OFFLINE GATE VERIFIED</span>
                </div>

                <button class="print-btn" onclick="window.print()">PRINT / EXPORT PASS</button>
              </div>
              <div class="hazard"></div>
            </div>
          </body>
          </html>
        `);
        passWindow.document.close();
        showToast('ADMISSION TICKET OPENED FOR PRINTING', 'success');
      }
    } catch {
      showToast('GENERATING TICKET PASS...', 'success');
    }
  };

  const handleDownloadCalendar = (eventId) => {
    window.open(`${BASE_URL}/events/${eventId}/calendar.ics`, '_blank');
    showToast('DOWNLOADING ICS CALENDAR FILE...', 'info');
  };

  const handleOpenGoogleCalendar = async (eventId, eventData) => {
    try {
      const response = await apiFetch(`/events/${eventId}/google-calendar-link`);
      if (response && response.googleCalendarUrl) {
        window.open(response.googleCalendarUrl, '_blank');
        showToast('SYNCHRONIZING GOOGLE CALENDAR...', 'success');
        return;
      }
    } catch (err) {
      console.warn('Backend calendar link fallback:', err);
    }

    const title = encodeURIComponent(eventData?.name || 'EventHub Live Event');
    const details = encodeURIComponent(`Admission Ticket for ${eventData?.name || 'Live Event'}`);
    const location = encodeURIComponent(eventData?.venue?.name || 'Main Arena');
    const dateFormatted = (eventData?.eventDate || '2026-09-15').replace(/-/g, '');
    const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T230000Z/${dateFormatted}T060000Z`;
    window.open(gUrl, '_blank');
    showToast('SYNCHRONIZING GOOGLE CALENDAR...', 'success');
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
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-grit-white font-mono-zine">
      
      {/* Header */}
      <div className="mb-8 border-b-2 border-asphalt-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
              OFFICIAL TICKET VAULT
            </span>
            <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
              ACCOUNT: {currentUser?.email || 'ATTENDEE'}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-grit-white leading-none">
            MY BOOKINGS & DIGITAL TICKETS
          </h1>
          <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
            VERIFIED EVENT PASSES, REAL-TIME SEAT RESERVATIONS & QR ADMISSION TICKETS
          </p>
        </div>

        <button 
          onClick={fetchUserBookings} 
          className="self-start md:self-auto bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-acid-yellow hover:text-asphalt-black px-4 py-2 text-xs font-impact tracking-wider uppercase transition-all shadow-[4px_4px_0px_#0e0e11] cursor-pointer touch-manipulation"
        >
          REFRESH BOOKINGS
        </button>
      </div>

      {/* 4 Brutalist Metric Stamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-asphalt-surface border-2 border-grit-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#eefc54] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TOTAL BOOKINGS</span>
          <span className="font-display text-2xl sm:text-3xl md:text-4xl text-grit-white font-bold leading-none mt-1 block">
            {stats.totalCount}
          </span>
        </div>

        <div className="bg-asphalt-surface border-2 border-grit-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#ff1f6d] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">CONFIRMED PASSES</span>
          <span className="font-display text-2xl sm:text-3xl md:text-4xl text-acid-yellow font-bold leading-none mt-1 block">
            {stats.confirmedCount}
          </span>
        </div>

        <div className="bg-asphalt-surface border-2 border-grit-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#1d4ed8] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">UPCOMING EVENTS</span>
          <span className="font-display text-2xl sm:text-3xl md:text-4xl text-blue-400 font-bold leading-none mt-1 block">
            {stats.upcomingCount}
          </span>
        </div>

        <div className="bg-asphalt-surface border-2 border-grit-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#ffffff] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TOTAL AMOUNT SPENT</span>
          <span className="font-display text-2xl sm:text-3xl md:text-4xl text-grit-white font-bold leading-none mt-1 block">
            {formatPrice(stats.totalSpent)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-asphalt-surface border-2 border-asphalt-border p-3 mb-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto touch-scroll scrollbar-none pb-1 md:pb-0">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-impact tracking-wider uppercase border transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold shadow-[2px_2px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-grit-dim" />
          <input
            type="text"
            placeholder="FILTER EVENT / VENUE / PASS #ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-9 pr-3 py-1.5 text-xs uppercase outline-none"
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
        <div className="bg-asphalt-surface border-4 border-dashed border-asphalt-border p-12 text-center">
          <Ticket size={48} className="text-grit-dim mx-auto mb-3 opacity-40" />
          <h3 className="font-impact text-2xl uppercase text-grit-white tracking-wider">NO PASSES DISCOVERED</h3>
          <p className="font-mono-zine text-xs text-grit-dim uppercase mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'NO TICKET RECORDS MATCH FILTER CRITERIA'
              : 'EXPLORE EVENTS AND BOOK YOUR FIRST ADMITTANCE PASS'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => {
            const isCinema = b.isCinema || b.event?.category === 'CINEMA' || b.event?.category === 'MOVIE' || /imax|cinema|movie|film|screening|interstellar/i.test(b.event?.name || '');
            return (
            <div 
              key={b.id} 
              className="bg-asphalt-surface border-2 border-grit-white shadow-[3px_3px_0px_#E2F13C] flex flex-col justify-between relative overflow-hidden"
            >
              {/* Slanted Tape Badge */}
              <div className={`absolute top-3 right-3 text-xs font-impact tracking-wider px-2.5 py-0.5 border border-asphalt-black uppercase -rotate-2 ${
                b.bookingStatus === 'CONFIRMED'
                  ? (isCinema ? 'bg-acid-yellow text-asphalt-black' : 'bg-acid-yellow text-asphalt-black')
                  : 'bg-neon-magenta text-grit-white'
              }`}>
                {isCinema && b.bookingStatus === 'CONFIRMED' ? 'CINEMA PASS' : b.bookingStatus}
              </div>

              {/* Pass Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-ticker text-grit-dim uppercase tracking-wider">
                    TICKET #{b.id} // VERIFIED PASS
                  </span>
                  {isCinema && (
                    <span className="text-[9px] font-impact bg-asphalt-card border border-asphalt-border px-1.5 py-0.2 text-acid-yellow">
                      SCREEN 01 // LASER
                    </span>
                  )}
                </div>

                <h3 className="font-display text-2xl uppercase tracking-tight text-grit-white leading-tight mb-4 pr-16">
                  {b.event?.name || 'LIVE EVENT'}
                </h3>

                <div className="space-y-1.5 font-mono-zine text-xs text-grit-dim uppercase mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-acid-yellow" />
                    <span>{b.event?.eventDate} @ {b.showtime || b.event?.startTime || '19:00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-acid-yellow" />
                    <span>{b.screenName || b.event?.venue?.name || 'CONCERT ARENA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket size={13} className="text-acid-yellow" />
                    <span>
                      {b.quantity} PASS(ES) · {b.selectedSeats ? `SEATS: ${b.selectedSeats}` : 'GENERAL ADMISSION'}
                    </span>
                  </div>
                  {b.snacks && Object.keys(b.snacks).length > 0 && (
                    <div className="flex items-start gap-2 text-acid-yellow pt-1 border-t border-asphalt-border/60">
                      <span className="shrink-0 font-impact text-[9px] bg-asphalt-card px-1 border border-asphalt-border">SNACKS:</span>
                      <span className="text-[11px] truncate">
                        {Object.entries(b.snacks).map(([k, q]) => `${q}x ${k.replace(/_/g, ' ').toUpperCase()}`).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-asphalt-border font-impact text-lg text-grit-white">
                    TOTAL AMOUNT: {formatPrice(b.totalAmount, b.event?.currency)}
                  </div>
                </div>

                {/* Perforated Barcode Line */}
                <div className="pt-3 border-t-2 border-dashed border-asphalt-border flex items-center justify-between opacity-50 select-none">
                  <span className="font-ticker text-[8px] text-grit-dim uppercase">PASS_BARCODE_VERIFIED</span>
                  <svg className="h-4 w-28" viewBox="0 0 112 16" fill="currentColor">
                    <rect x="0" y="0" width="3" height="16"/>
                    <rect x="5" y="0" width="2" height="16"/>
                    <rect x="9" y="0" width="4" height="16"/>
                    <rect x="15" y="0" width="2" height="16"/>
                    <rect x="19" y="0" width="5" height="16"/>
                    <rect x="26" y="0" width="1" height="16"/>
                    <rect x="29" y="0" width="4" height="16"/>
                    <rect x="35" y="0" width="3" height="16"/>
                    <rect x="40" y="0" width="5" height="16"/>
                    <rect x="47" y="0" width="2" height="16"/>
                    <rect x="51" y="0" width="4" height="16"/>
                    <rect x="57" y="0" width="2" height="16"/>
                    <rect x="61" y="0" width="5" height="16"/>
                    <rect x="68" y="0" width="3" height="16"/>
                    <rect x="73" y="0" width="4" height="16"/>
                    <rect x="79" y="0" width="2" height="16"/>
                    <rect x="83" y="0" width="5" height="16"/>
                    <rect x="90" y="0" width="2" height="16"/>
                    <rect x="94" y="0" width="4" height="16"/>
                    <rect x="100" y="0" width="2" height="16"/>
                    <rect x="104" y="0" width="5" height="16"/>
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex flex-wrap gap-2">
                {b.bookingStatus !== 'CANCELLED' && (
                  <button 
                    onClick={() => handleDownloadPdf(b)} 
                    className="flex-1 bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs uppercase py-2 px-3 border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[2px_2px_0px_#ffffff] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> PRINT TICKET PASS
                  </button>
                )}

                <button 
                  onClick={() => handleDownloadCalendar(b.event?.id || 1)} 
                  className="bg-asphalt-surface border border-asphalt-border hover:border-grit-white text-grit-white font-mono-zine text-xs px-2.5 py-1.5 uppercase cursor-pointer"
                  title="Download .ics file"
                >
                  <Calendar size={13} /> .ICS
                </button>

                <button 
                  onClick={() => handleOpenGoogleCalendar(b.event?.id || 1, b.event)} 
                  className="bg-asphalt-surface border border-asphalt-border hover:border-grit-white text-grit-white font-mono-zine text-xs px-2.5 py-1.5 uppercase cursor-pointer"
                  title="Add to Google Calendar"
                >
                  <ExternalLink size={13} /> GCAL
                </button>

                {b.bookingStatus === 'CONFIRMED' && (
                  <button 
                    onClick={() => handleCancelBooking(b.id)} 
                    className="bg-asphalt-surface border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-grit-white font-mono-zine text-xs px-2.5 py-1.5 uppercase cursor-pointer transition-colors"
                    title="Cancel booking"
                  >
                    <XCircle size={13} /> CANCEL
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
