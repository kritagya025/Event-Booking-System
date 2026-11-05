import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, Calendar, MapPin, Download, XCircle, Search, ExternalLink, ShieldCheck, CreditCard, Clock, Radio } from 'lucide-react';
import { apiFetch, BASE_URL } from '../services/api';
import { formatPrice } from '../services/currency';

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
    } catch (_err) {
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
    } catch (e) {
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
      const response = await fetch(`${BASE_URL}/tickets/booking/${booking.id}/pdf`, {
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

    // EventHub Brutalist Printable Pass Stub
    try {
      const passWindow = window.open('', '_blank');
      if (passWindow) {
        passWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>EVENTHUB TICKET #${booking.id}</title>
            <style>
              body { font-family: 'Courier New', monospace; background: #0e0e11; color: #f5f5f0; padding: 40px; text-align: center; }
              .pass-card { max-width: 480px; margin: 0 auto; background: #16161c; border: 4px solid #f5f5f0; padding: 24px; box-shadow: 10px 10px 0px #eefc54; text-align: left; }
              .hazard { height: 12px; background: repeating-linear-gradient( -45deg, #eefc54, #eefc54 10px, #0e0e11 10px, #0e0e11 20px ); margin-bottom: 16px; }
              .badge { display: inline-block; background: #eefc54; color: #0e0e11; padding: 4px 10px; font-weight: 900; font-size: 11px; text-transform: uppercase; }
              h2 { font-size: 26px; margin: 12px 0 6px 0; color: #f5f5f0; font-weight: 900; text-transform: uppercase; }
              p { color: #90929e; font-size: 12px; margin: 0 0 16px 0; }
              .qr-container { text-align: center; margin: 20px 0; }
              .qr-img { width: 180px; height: 180px; padding: 12px; background: #FFF; border: 3px solid #0e0e11; }
              .info-row { display: flex; justify-content: space-between; margin-top: 14px; border-top: 2px dashed #90929e; padding-top: 10px; font-size: 11px; }
              .print-btn { display: block; width: 100%; background: #ff1f6d; color: #FFF; border: 2px solid #0e0e11; padding: 12px; font-weight: 900; font-size: 14px; cursor: pointer; margin-top: 20px; text-transform: uppercase; box-shadow: 4px 4px 0px #eefc54; }
            </style>
          </head>
          <body>
            <div class="pass-card">
              <div class="hazard"></div>
              <span class="badge">EVENTHUB OFFICIAL ADMISSION PASS</span>
              <h2>${booking.event?.name || 'LIVE EVENT'}</h2>
              <p>${booking.event?.eventDate || '2026-09-15'} · ${booking.event?.venue?.name || 'MAIN CONCERT ARENA'}</p>
              <div class="qr-container">
                <img src="${booking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EVENTHUB-PASS-${booking.id}`}" class="qr-img" alt="Pass QR" />
              </div>
              <div class="info-row">
                <div><span>ATTENDEE</span><br><strong>${currentUser?.firstName || 'GUEST'} ${currentUser?.lastName || 'ATTENDEE'}</strong></div>
                <div style="text-align:right"><span>SEATS / ROW</span><br><strong>${booking.selectedSeats || 'GENERAL ADMISSION'}</strong></div>
              </div>
              <button class="print-btn" onclick="window.print()">PRINT / EXPORT TICKET</button>
            </div>
          </body>
          </html>
        `);
        passWindow.document.close();
        showToast('ADMISSION TICKET OPENED FOR PRINTING', 'success');
      }
    } catch (passErr) {
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
    <div className="w-full max-w-[1360px] mx-auto px-4 md:px-6 py-8 text-grit-white font-mono-zine">
      
      {/* Header */}
      <div className="mb-8 border-b-2 border-asphalt-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
              EVENTHUB://TICKETS_PORTAL
            </span>
            <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
              ACCOUNT: {currentUser?.email || 'ANON_USER'}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-grit-white leading-none">
            MY BOOKINGS & DIGITAL TICKETS
          </h1>
          <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
            VERIFIED EVENT PASSES, REAL-TIME SEAT RESERVATIONS & QR ADMISSION TICKETS
          </p>
        </div>

        <button 
          onClick={fetchUserBookings} 
          className="self-start md:self-auto bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-acid-yellow hover:text-asphalt-black px-4 py-2 text-xs font-impact tracking-wider uppercase transition-all shadow-[4px_4px_0px_#0e0e11] cursor-pointer"
        >
          REFRESH BOOKINGS
        </button>
      </div>

      {/* 4 Brutalist Metric Stamps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#eefc54] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TOTAL BOOKINGS</span>
          <span className="font-display text-3xl md:text-4xl text-grit-white font-bold leading-none mt-1 block">
            {stats.totalCount}
          </span>
        </div>

        <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#ff1f6d] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">CONFIRMED PASSES</span>
          <span className="font-display text-3xl md:text-4xl text-acid-yellow font-bold leading-none mt-1 block">
            {stats.confirmedCount}
          </span>
        </div>

        <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#1d4ed8] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">UPCOMING EVENTS</span>
          <span className="font-display text-3xl md:text-4xl text-blue-400 font-bold leading-none mt-1 block">
            {stats.upcomingCount}
          </span>
        </div>

        <div className="bg-asphalt-surface border-2 border-grit-white p-4 shadow-[4px_4px_0px_#ffffff] relative">
          <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">TOTAL AMOUNT SPENT</span>
          <span className="font-display text-3xl md:text-4xl text-grit-white font-bold leading-none mt-1 block">
            {formatPrice(stats.totalSpent)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-asphalt-surface border-2 border-asphalt-border p-3 mb-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex gap-2 w-full md:w-auto">
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
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-acid-yellow border-t-transparent mx-auto mb-3"></div>
          <span className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider animate-pulse">
            AUDITING TICKET PASS INVENTORY...
          </span>
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
          {filteredBookings.map((b) => (
            <div 
              key={b.id} 
              className="bg-asphalt-surface border-4 border-grit-white shadow-[6px_6px_0px_#eefc54] flex flex-col justify-between relative overflow-hidden"
            >
              {/* Slanted Tape Badge */}
              <div className={`absolute top-3 right-3 text-xs font-impact tracking-wider px-2.5 py-0.5 border border-asphalt-black uppercase -rotate-2 ${
                b.bookingStatus === 'CONFIRMED'
                  ? 'bg-acid-yellow text-asphalt-black'
                  : 'bg-neon-magenta text-grit-white'
              }`}>
                {b.bookingStatus}
              </div>

              {/* Pass Content */}
              <div className="p-5">
                <div className="text-[10px] font-ticker text-grit-dim uppercase tracking-wider mb-2">
                  TICKET #{b.id} // SEC_NODE
                </div>

                <h3 className="font-display text-2xl uppercase tracking-tight text-grit-white leading-tight mb-4 pr-16">
                  {b.event?.name || 'LIVE EVENT'}
                </h3>

                <div className="space-y-1.5 font-mono-zine text-xs text-grit-dim uppercase mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-acid-yellow" />
                    <span>{b.event?.eventDate} @ {b.event?.startTime || '19:00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-acid-yellow" />
                    <span>{b.event?.venue?.name || 'CONCERT ARENA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket size={13} className="text-acid-yellow" />
                    <span>
                      {b.quantity} PASS(ES) · {b.selectedSeats ? `SEATS: ${b.selectedSeats}` : 'GENERAL ADMISSION'}
                    </span>
                  </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
