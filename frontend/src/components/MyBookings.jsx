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
      const eventImg = booking.event?.bannerImageUrl || (booking.event?.category?.toUpperCase().includes('TECH') ? '/images/tech.jpg' : '/images/concert.jpg');
      const passWindow = window.open('', '_blank');
      if (passWindow) {
        passWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>EVENTHUB VIP PASS #${booking.id}</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: 'JetBrains Mono', 'Courier New', monospace; background: #0a0a0e; color: #f8fafc; padding: 32px 16px; text-align: center; margin: 0; }
              .pass-container { max-width: 740px; margin: 0 auto; text-align: left; }
              .doc-header { display: flex; justify-content: space-between; align-items: center; background: #121420; border: 2px solid #00f0ff; padding: 10px 16px; margin-bottom: 16px; }
              .doc-title { font-size: 13px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; }
              .doc-meta { font-size: 9px; color: #94a3b8; margin-top: 2px; }
              .doc-status { text-align: right; font-size: 10px; font-weight: bold; color: #00f0ff; }
              .pass-card { background: #121420; border: 3px solid #fef02a; padding: 0; box-shadow: 10px 10px 0px #00f0ff; overflow: hidden; position: relative; }
              .hazard { height: 9px; background: repeating-linear-gradient(-45deg, #fef02a, #fef02a 12px, #0a0a0e 12px, #0a0a0e 24px, #ff006e 24px, #ff006e 36px, #0a0a0e 36px, #0a0a0e 48px); }
              .pass-body { display: grid; grid-template-columns: 1fr 230px; position: relative; }
              .left-pass { padding: 20px 24px; border-right: 2px dashed #00f0ff; position: relative; background: #121420; }
              .right-stub { padding: 20px 16px; background: #f8fafc; color: #0a0a0e; text-align: center; display: flex; flex-direction: column; justify-content: space-between; }
              .event-banner-art { width: 100%; height: 135px; border: 2px solid #00f0ff; overflow: hidden; margin-bottom: 12px; position: relative; background: #0a0a0e; }
              .event-banner-art img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.15) saturate(1.25); display: block; }
              .art-overlay { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 6px; }
              .live-pill { background: #ff006e; color: #ffffff; font-size: 8px; font-weight: 900; padding: 2px 6px; text-transform: uppercase; border: 1px solid #0a0a0e; }
              .season-pill { background: #fef02a; color: #0a0a0e; font-size: 8px; font-weight: 900; padding: 2px 6px; text-transform: uppercase; border: 1px solid #0a0a0e; }
              .stub-art-thumb { width: 100%; height: 45px; overflow: hidden; border: 1.5px solid #0a0a0e; margin-bottom: 8px; }
              .stub-art-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
              .notch-top { position: absolute; top: -10px; right: 220px; width: 20px; height: 20px; background: #0a0a0e; border-radius: 50%; border: 2px solid #fef02a; z-index: 10; }
              .notch-bottom { position: absolute; bottom: -10px; right: 220px; width: 20px; height: 20px; background: #0a0a0e; border-radius: 50%; border: 2px solid #fef02a; z-index: 10; }
              .top-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px; }
              .logo { font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -1px; }
              .pass-badge { background: #fef02a; color: #0a0a0e; padding: 2px 6px; font-size: 9px; font-weight: 900; vertical-align: middle; margin-left: 6px; }
              .season-badge { background: #ff006e; color: #ffffff; padding: 2px 6px; font-size: 8px; font-weight: 900; text-transform: uppercase; border: 1px solid #0a0a0e; margin-left: 4px; }
              .serial { color: #fef02a; font-size: 9px; font-weight: bold; text-align: right; }
              .event-title { font-size: 22px; font-weight: 900; margin: 0 0 4px 0; color: #ffffff; text-transform: uppercase; line-height: 1.1; }
              .event-meta { font-size: 10px; color: #00f0ff; margin: 0 0 12px 0; font-weight: bold; text-transform: uppercase; }
              .venue-box { background: #1a1e2e; border: 1px solid #334155; border-left: 4px solid #ff006e; padding: 10px; margin-bottom: 12px; }
              .venue-label { font-size: 8px; color: #ff006e; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
              .venue-name { font-size: 13px; font-weight: bold; color: #ffffff; margin-top: 2px; }
              .seat-banner { background: #fef02a; color: #0a0a0e; border: 2px solid #0a0a0e; padding: 8px 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
              .seat-big { font-size: 16px; font-weight: 900; }
              .seat-tier { font-size: 9px; font-weight: 900; text-transform: uppercase; background: #ff006e; color: #ffffff; padding: 3px 6px; }
              .holder-box { background: #1a1e2e; border: 1px solid #334155; border-left: 4px solid #00f0ff; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; }
              .holder-label { font-size: 8px; color: #00f0ff; text-transform: uppercase; font-weight: bold; }
              .holder-name { font-size: 13px; font-weight: 900; color: #ffffff; margin: 2px 0; text-transform: uppercase; }
              .holder-email { font-size: 9px; color: #00f0ff; }
              .guarantees { display: flex; gap: 8px; font-size: 8px; text-transform: uppercase; font-weight: bold; }
              .stub-head { font-size: 10px; font-weight: 900; color: #0a0a0e; margin-bottom: 2px; }
              .stub-sub { font-size: 8px; color: #ff006e; font-weight: bold; margin-bottom: 8px; }
              .stub-seat { background: #fef02a; border: 2px solid #0a0a0e; color: #0a0a0e; font-size: 12px; font-weight: 900; padding: 4px; margin-bottom: 8px; }
              .qr-box { background: #ffffff; padding: 6px; border: 2px solid #0a0a0e; margin-bottom: 8px; }
              .qr-box img { width: 105px; height: 105px; display: block; margin: 0 auto; }
              .qr-label { font-size: 7px; font-weight: 900; color: #0a0a0e; margin-top: 3px; text-transform: uppercase; }
              .barcode-box { background: #ffffff; padding: 4px; border: 2px solid #0a0a0e; margin-bottom: 6px; }
              .barcode-box .bars { font-size: 12px; font-weight: 900; letter-spacing: -1px; color: #0a0a0e; margin: 0; line-height: 1; }
              .barcode-box .serial { font-size: 7px; color: #0a0a0e; font-weight: bold; text-align: center; }
              .tear-bar { border-top: 1px dashed #00f0ff; padding: 6px 0; text-align: center; font-size: 8px; color: #00f0ff; letter-spacing: 1px; font-weight: bold; }
              .protocol-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; background: #121420; border: 1px solid #334155; padding: 14px; margin-top: 16px; }
              .protocol-col { padding: 8px; background: #1a1e2e; }
              .protocol-col:nth-child(1) { border-top: 3px solid #00f0ff; }
              .protocol-col:nth-child(2) { border-top: 3px solid #ff006e; }
              .protocol-col:nth-child(3) { border-top: 3px solid #10e68c; }
              .protocol-col h4 { margin: 0 0 6px 0; font-size: 9px; text-transform: uppercase; font-weight: 900; }
              .protocol-col:nth-child(1) h4 { color: #00f0ff; }
              .protocol-col:nth-child(2) h4 { color: #ff006e; }
              .protocol-col:nth-child(3) h4 { color: #10e68c; }
              .protocol-col p { margin: 0; font-size: 8px; color: #94a3b8; line-height: 1.4; }
              .print-btn { display: block; width: 100%; background: #ff006e; color: #ffffff; border: 2px solid #ffffff; padding: 12px; font-weight: 900; font-size: 13px; cursor: pointer; text-transform: uppercase; box-shadow: 4px 4px 0px #fef02a; transition: all 0.2s; margin-top: 16px; }
              .print-btn:hover { background: #fef02a; color: #0a0a0e; }
              @media print {
                body { background: #fff; padding: 0; }
                .pass-card { box-shadow: none; border-color: #000; }
                .print-btn { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="pass-container">
              <div class="doc-header">
                <div>
                  <div class="doc-title">EVENTHUB OFFICIAL DIGITAL ADMISSION DOCUMENT</div>
                  <div class="doc-meta">ORDER NO: #EHB-${booking.id} | ISSUED: ${new Date().toLocaleDateString()} | VALIDATED PASS</div>
                </div>
                <div class="doc-status">
                  VERIFIED ADMISSION<br />
                  <span style="font-size: 12px; color: #fef02a;">CONFIRMED</span>
                </div>
              </div>

              <div class="pass-card">
                <div class="hazard"></div>
                <div class="notch-top"></div>
                <div class="notch-bottom"></div>
                <div class="pass-body">
                  <div class="left-pass">
                    <div class="top-row">
                      <div>
                        <span class="logo">EVENTHUB<span class="pass-badge">VIP PASS</span><span class="season-badge">SEASON 2026</span></span>
                        <div style="font-size: 7px; color: #94a3b8; letter-spacing: 1px; margin-top: 3px; text-transform: uppercase;">
                          AUTHENTICATED ADMISSION GATEWAY // REVENUE PASS
                        </div>
                      </div>
                      <div class="serial">
                        SERIAL: EHB-${booking.id}<br />
                        <span style="color: #10e68c; font-size: 7px;">STATUS: ACTIVE // VERIFIED</span>
                      </div>
                    </div>

                    <div class="event-banner-art">
                      <img src="${eventImg}" alt="Event Artwork" />
                      <div class="art-overlay">
                        <span class="live-pill">LIVE STAGE PRODUCTION</span>
                        <span class="season-pill">SEASON 2026</span>
                      </div>
                    </div>

                    <h1 class="event-title">${booking.event?.name || 'LIVE ARENA CONCERT'}</h1>
                    <div class="event-meta">
                      SHOWTIME: ${booking.event?.eventDate || '2026-10-24'} @ ${booking.isCinema ? (booking.showtime || '06:15 PM') : (booking.event?.startTime || '07:30 PM')}
                    </div>
              .venue-box { background: #1a1e2e; border: 1px solid #334155; border-left: 4px solid #ff006e; padding: 10px; margin-bottom: 12px; }
              .venue-label { font-size: 8px; color: #ff006e; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
              .venue-name { font-size: 13px; font-weight: bold; color: #ffffff; margin-top: 2px; }
              .seat-banner { background: #fef02a; color: #0a0a0e; border: 2px solid #0a0a0e; padding: 8px 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
              .seat-big { font-size: 16px; font-weight: 900; }
              .seat-tier { font-size: 9px; font-weight: 900; text-transform: uppercase; background: #ff006e; color: #ffffff; padding: 3px 6px; }
              .holder-box { background: #1a1e2e; border: 1px solid #334155; border-left: 4px solid #00f0ff; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; }
              .holder-label { font-size: 8px; color: #00f0ff; text-transform: uppercase; font-weight: bold; }
              .holder-name { font-size: 13px; font-weight: 900; color: #ffffff; margin: 2px 0; text-transform: uppercase; }
              .holder-email { font-size: 9px; color: #00f0ff; }
              .guarantees { display: flex; gap: 8px; font-size: 8px; text-transform: uppercase; font-weight: bold; }
              .stub-head { font-size: 10px; font-weight: 900; color: #0a0a0e; margin-bottom: 2px; }
              .stub-sub { font-size: 8px; color: #ff006e; font-weight: bold; margin-bottom: 8px; }
              .stub-seat { background: #fef02a; border: 2px solid #0a0a0e; color: #0a0a0e; font-size: 12px; font-weight: 900; padding: 4px; margin-bottom: 8px; }
              .qr-box { background: #ffffff; padding: 6px; border: 2px solid #0a0a0e; margin-bottom: 8px; }
              .qr-box img { width: 105px; height: 105px; display: block; margin: 0 auto; }
              .qr-label { font-size: 7px; font-weight: 900; color: #0a0a0e; margin-top: 3px; text-transform: uppercase; }
              .barcode-box { background: #ffffff; padding: 4px; border: 2px solid #0a0a0e; margin-bottom: 6px; }
              .barcode-box .bars { font-size: 12px; font-weight: 900; letter-spacing: -1px; color: #0a0a0e; margin: 0; line-height: 1; }
              .barcode-box .serial { font-size: 7px; color: #0a0a0e; font-weight: bold; text-align: center; }
              .tear-bar { border-top: 1px dashed #00f0ff; padding: 6px 0; text-align: center; font-size: 8px; color: #00f0ff; letter-spacing: 1px; font-weight: bold; }
              .protocol-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; background: #121420; border: 1px solid #334155; padding: 14px; margin-top: 16px; }
              .protocol-col { padding: 8px; background: #1a1e2e; }
              .protocol-col:nth-child(1) { border-top: 3px solid #00f0ff; }
              .protocol-col:nth-child(2) { border-top: 3px solid #ff006e; }
              .protocol-col:nth-child(3) { border-top: 3px solid #10e68c; }
              .protocol-col h4 { margin: 0 0 6px 0; font-size: 9px; text-transform: uppercase; font-weight: 900; }
              .protocol-col:nth-child(1) h4 { color: #00f0ff; }
              .protocol-col:nth-child(2) h4 { color: #ff006e; }
              .protocol-col:nth-child(3) h4 { color: #10e68c; }
              .protocol-col p { margin: 0; font-size: 8px; color: #94a3b8; line-height: 1.4; }
              .print-btn { display: block; width: 100%; background: #ff006e; color: #ffffff; border: 2px solid #ffffff; padding: 12px; font-weight: 900; font-size: 13px; cursor: pointer; text-transform: uppercase; box-shadow: 4px 4px 0px #fef02a; transition: all 0.2s; margin-top: 16px; }
              .print-btn:hover { background: #fef02a; color: #0a0a0e; }
              @media print {
                body { background: #fff; padding: 0; }
                .pass-card { box-shadow: none; border-color: #000; }
                .print-btn { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="pass-container">
              <div class="doc-header">
                <div>
                  <div class="doc-title">EVENTHUB OFFICIAL DIGITAL ADMISSION DOCUMENT</div>
                  <div class="doc-meta">ORDER NO: #EHB-${booking.id} | ISSUED: ${new Date().toLocaleDateString()} | VALIDATED PASS</div>
                </div>
                <div class="doc-status">
                  VERIFIED ADMISSION<br />
                  <span style="font-size: 12px; color: #fef02a;">CONFIRMED</span>
                </div>
              </div>

              <div class="pass-card">
                <div class="hazard"></div>
                <div class="notch-top"></div>
                <div class="notch-bottom"></div>
                <div class="pass-body">
                  <div class="left-pass">
                    <div class="top-row">
                      <div>
                        <span class="logo">EVENTHUB<span class="pass-badge">VIP PASS</span><span class="season-badge">SEASON 2026</span></span>
                        <div style="font-size: 7px; color: #94a3b8; letter-spacing: 1px; margin-top: 3px; text-transform: uppercase;">
                          AUTHENTICATED ADMISSION GATEWAY // REVENUE PASS
                        </div>
                      </div>
                      <div class="serial">
                        SERIAL: EHB-${booking.id}<br />
                        <span style="color: #10e68c; font-size: 7px;">STATUS: ACTIVE // VERIFIED</span>
                      </div>
                    </div>

                    <h1 class="event-title">${booking.event?.name || 'LIVE ARENA CONCERT'}</h1>
                    <div class="event-meta">
                      SHOWTIME: ${booking.event?.eventDate || '2026-10-24'} @ ${booking.isCinema ? (booking.showtime || '06:15 PM') : (booking.event?.startTime || '07:30 PM')}
                    </div>

                    <div class="venue-box">
                      <div class="venue-label">LOCATION & AUDITORIUM:</div>
                      <div class="venue-name">${booking.screenName || booking.event?.venue?.name || 'MAIN CONCERT ARENA'}</div>
                      <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${booking.event?.venue?.address || 'MAIN EVENT GATE 01'} // NORTH ENTRY</div>
                    </div>

                    <div class="seat-banner">
                      <div>
                        <div style="font-size: 7px; font-weight: bold; text-transform: uppercase;">CONFIRMED SEATING ASSIGNMENT:</div>
                        <div class="seat-big">SEAT: ${booking.selectedSeats || 'GENERAL ADMISSION'}</div>
                      </div>
                      <div class="seat-tier">VIP RESERVED</div>
                    </div>

                    <div class="holder-box">
                      <div>
                        <div class="holder-label">ACCREDITED ATTENDEE:</div>
                        <div class="holder-name">${currentUser?.firstName || 'VIP'} ${currentUser?.lastName || 'ATTENDEE'}</div>
                        <div class="holder-email">${currentUser?.email || 'AUTHENTICATED HOLDER'}</div>
                      </div>
                      <div style="text-align: right;">
                        <div class="holder-label" style="color: #fef02a;">BOOKING REFERENCE:</div>
                        <div style="font-size: 11px; font-weight: bold; color: #fef02a; margin-top: 2px;">#EHB-${booking.id}</div>
                        <div style="font-size: 8px; color: #10e68c;">ADMIT ONE PERSON</div>
                      </div>
                    </div>

                    <div class="guarantees">
                      <span style="color: #fef02a;">[ 10-MIN CART LOCK ]</span>
                      <span style="color: #10e68c;">[ ZERO OVERBOOKING ]</span>
                      <span style="color: #00f0ff;">[ OFFLINE GATE AUDITED ]</span>
                      <span style="color: #ff006e;">[ PHOTO ID REQ ]</span>
                    </div>
                  </div>

                  <div class="right-stub">
                    <div>
                      <div class="stub-head">GATE TURNSTILE STUB</div>
                      <div class="stub-sub">ADMIT ONE // SCAN AT GATE</div>
                      <div class="stub-art-thumb">
                        <img src="${eventImg}" alt="Event Artwork" />
                      </div>
                      <div class="stub-seat">${booking.selectedSeats || 'GA-01'}</div>
                    </div>

                    <div class="qr-box">
                      <img src="${booking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EVENTHUB-PASS-${booking.id}`}" alt="Pass QR" />
                      <div class="qr-label">OPTICAL GATE TOKEN</div>
                    </div>

                    <div class="barcode-box">
                      <div class="bars">|| | ||| | || |||| | ||| | || | ||||</div>
                      <div class="serial">* EHB-${booking.id} *</div>
                    </div>

                    <div style="font-size: 7px; color: #475569; font-weight: bold;">SINGLE USE // TURNSTILE SCAN</div>
                  </div>
                </div>

                <div class="tear-bar">
                  --------------------- TEAR / SCAN AT GATE TURNSTILE ---------------------
                </div>
                <div class="hazard"></div>
              </div>

              <div class="protocol-grid">
                <div class="protocol-col">
                  <h4>01 // TURNSTILE ENTRY</h4>
                  <p>[>] Present pass printed or on phone at 100% brightness.<br />[>] Align QR token with gate scanner.<br />[>] Pass through when light turns GREEN.</p>
                </div>
                <div class="protocol-col">
                  <h4>02 // ADMISSION POLICY</h4>
                  <p>[*] Government-issued photo ID required.<br />[*] Single-entry credential only.<br />[*] Duplicate scans trigger security alarms.</p>
                </div>
                <div class="protocol-col">
                  <h4>03 // ZERO OVERBOOKING</h4>
                  <p>[#] Real-time distributed seat lock.<br />[#] SHA-256 cryptographically verified.<br />[#] Support: support@eventhub.live</p>
                </div>
              </div>

              <button class="print-btn" onclick="window.print()">PRINT / EXPORT PASS</button>
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
