import React from 'react';
import { Heart, MapPin, Calendar, Clock, Film, Music, Sparkles, ChevronRight, Check } from 'lucide-react';
import { formatPrice } from '../services/currency';

// Helper for event image fallback with authentic real-world photography
export const getImageForEvent = (ev, isCinema) => {
  if (!ev) return '/images/events/neon-horizon-music.jpg';

  const title = (ev.name || '').toLowerCase();
  const banner = ev.bannerImageUrl || '';

  // Filter out known fake / mismatched legacy image URLs
  const isFakeOrOutdated = 
    banner.includes('1578632767115') || // Fake anime figure
    banner.includes('1507676184212') || // Generic microphone for theater
    banner.includes('1511512578047') || // Old arcade machines for eSports
    banner === '/images/concert.jpg' ||
    banner === '/images/tech.jpg';

  if (banner && !isFakeOrOutdated) {
    return banner;
  }

  // 1. High-precision event title matching with real-world photography
  if (/cyberpunk/i.test(title)) {
    return '/images/events/cyberpunk-imax.jpg';
  }
  if (/interstellar/i.test(title)) {
    return '/images/events/interstellar-70mm.jpg';
  }
  if (/phantom|opera/i.test(title)) {
    return '/images/events/phantom-opera.jpg';
  }
  if (/esports|grand prix|gaming/i.test(title)) {
    return '/images/events/esports-championship.jpg';
  }
  if (/neon horizon|music festival/i.test(title)) {
    return '/images/events/neon-horizon-music.jpg';
  }
  if (/ai.*summit|autonomous.*summit|tech summit/i.test(title)) {
    return '/images/events/ai-tech-summit.jpg';
  }

  // 2. High-definition category defaults with real photography
  if (ev.category === 'CINEMA' || isCinema) {
    return '/images/events/cyberpunk-imax.jpg';
  }
  if (ev.category === 'MUSIC') {
    return '/images/events/neon-horizon-music.jpg';
  }
  if (ev.category === 'TECH') {
    return '/images/events/ai-tech-summit.jpg';
  }
  if (ev.category === 'THEATER') {
    return '/images/events/phantom-opera.jpg';
  }
  if (ev.category === 'SPORTS') {
    return '/images/events/esports-championship.jpg';
  }

  return '/images/events/neon-horizon-music.jpg';
};

// Helper for formatted date
export const formatEventDate = (dateStr) => {
  if (!dateStr) return { weekday: 'Fri', month: 'OCT', day: '24', time: '8:00 PM', full: 'Fri, Oct 24 • 8:00 PM' };
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      weekday,
      month,
      day,
      time: '8:00 PM',
      full: `${weekday}, ${month} ${day} • 8:00 PM`
    };
  } catch {
    return { weekday: 'Fri', month: 'OCT', day: '24', time: '8:00 PM', full: dateStr };
  }
};

// Realistic Mini Barcode SVG for authentic ticket stub aesthetic
export function TicketBarcodeSVG({ className = "w-full h-7" }) {
  return (
    <svg className={className} viewBox="0 0 100 24" preserveAspectRatio="none" fill="currentColor">
      <rect x="0" y="0" width="2" height="24" />
      <rect x="4" y="0" width="1" height="24" />
      <rect x="7" y="0" width="3" height="24" />
      <rect x="12" y="0" width="2" height="24" />
      <rect x="16" y="0" width="1" height="24" />
      <rect x="19" y="0" width="4" height="24" />
      <rect x="25" y="0" width="1" height="24" />
      <rect x="28" y="0" width="2" height="24" />
      <rect x="32" y="0" width="3" height="24" />
      <rect x="37" y="0" width="1" height="24" />
      <rect x="40" y="0" width="2" height="24" />
      <rect x="44" y="0" width="4" height="24" />
      <rect x="50" y="0" width="1" height="24" />
      <rect x="53" y="0" width="3" height="24" />
      <rect x="58" y="0" width="2" height="24" />
      <rect x="62" y="0" width="1" height="24" />
      <rect x="65" y="0" width="4" height="24" />
      <rect x="71" y="0" width="2" height="24" />
      <rect x="75" y="0" width="1" height="24" />
      <rect x="78" y="0" width="3" height="24" />
      <rect x="83" y="0" width="2" height="24" />
      <rect x="87" y="0" width="1" height="24" />
      <rect x="90" y="0" width="4" height="24" />
      <rect x="96" y="0" width="2" height="24" />
      <rect x="99" y="0" width="1" height="24" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REALISTIC DIE-CUT TICKET NOTCH SVGs
// Authentic paper ticket notches that seamlessly punch through the card border
// with NO flat line at the mouth of the circle.
// ─────────────────────────────────────────────────────────────────────────────
export function TicketNotchTopSVG({ className = "absolute -top-[3px] -left-[14px] w-7 h-4 z-20 pointer-events-none overflow-visible" }) {
  return (
    <svg className={className} width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {/* Mask fill that covers the card interior and erases the top 3px black border */}
      <path d="M -1 -6 L -1 0 A 14 14 0 0 0 29 0 L 29 -6 Z" fill="#FFF8E7" />
      {/* Crisp 3px black border tracing the curved ticket notch indentation */}
      <path d="M 0 0 A 14 14 0 0 0 28 0" stroke="#1E1B2E" strokeWidth="3" strokeLinecap="butt" fill="none" />
    </svg>
  );
}

export function TicketNotchBottomSVG({ className = "absolute -bottom-[3px] -left-[14px] w-7 h-4 z-20 pointer-events-none overflow-visible" }) {
  return (
    <svg className={className} width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {/* Mask fill that punches out the card interior, the 3px bottom border, AND the 4px bottom drop shadow */}
      <path d="M -1 26 L -1 16 A 14 14 0 0 1 29 16 L 29 26 Z" fill="#FFF8E7" />
      {/* Crisp 3px black border tracing the curved ticket notch indentation */}
      <path d="M 0 16 A 14 14 0 0 1 28 16" stroke="#1E1B2E" strokeWidth="3" strokeLinecap="butt" fill="none" />
    </svg>
  );
}

export function TicketNotchLeftSVG({ className = "absolute -left-[3px] -top-[14px] w-4 h-7 z-20 pointer-events-none overflow-visible" }) {
  return (
    <svg className={className} width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {/* Mask fill that covers the card interior and erases the left 3px black border */}
      <path d="M -6 -1 L 0 -1 A 14 14 0 0 1 0 29 L -6 29 Z" fill="#FFF8E7" />
      {/* Crisp 3px black border tracing the curved ticket notch indentation */}
      <path d="M 0 0 A 14 14 0 0 1 0 28" stroke="#1E1B2E" strokeWidth="3" strokeLinecap="butt" fill="none" />
    </svg>
  );
}

export function TicketNotchRightSVG({ className = "absolute -right-[3px] -top-[14px] w-4 h-7 z-20 pointer-events-none overflow-visible" }) {
  return (
    <svg className={className} width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {/* Mask fill that covers card interior, 3px right border, and 4px right drop shadow */}
      <path d="M 26 -1 L 16 -1 A 14 14 0 0 0 16 29 L 26 29 Z" fill="#FFF8E7" />
      {/* Crisp 3px black border tracing the curved ticket notch indentation */}
      <path d="M 16 0 A 14 14 0 0 0 16 28" stroke="#1E1B2E" strokeWidth="3" strokeLinecap="butt" fill="none" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MODERN TICKET PASS (LANDSCAPE) — The Core Reimagined Card
// Artwork on the left, rich info in the center, tear-off stub on the right.
// ─────────────────────────────────────────────────────────────────────────────
export function ModernLandscapeTicketPass({
  event,
  index = 0,
  currentUser,
  onBook,
  onWishlist,
  onWaitlist,
  onDelete
}) {
  const isSoldOut = event.availableSeats === 0;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER');
  const isCinema = event.category === 'CINEMA' || event.category === 'MOVIE' || /imax|cinema|movie|film|screening/i.test(event.name || '');

  const colorThemes = [
    { popShadow: 'hover:shadow-pop-purple', rsvpBg: 'bg-candy-purple text-white hover:bg-bubble-pink', accentBorder: 'border-candy-purple', stubBg: 'bg-candy-purple/5' },
    { popShadow: 'hover:shadow-pop-pink', rsvpBg: 'bg-bubble-pink text-white hover:bg-candy-purple', accentBorder: 'border-bubble-pink', stubBg: 'bg-bubble-pink/5' },
    { popShadow: 'hover:shadow-pop-azure', rsvpBg: 'bg-sky-azure text-toy-black hover:bg-sun-yellow', accentBorder: 'border-sky-azure', stubBg: 'bg-sky-azure/5' },
    { popShadow: 'hover:shadow-pop-mint', rsvpBg: 'bg-mint-pop text-toy-black hover:bg-sun-yellow', accentBorder: 'border-mint-pop', stubBg: 'bg-mint-pop/5' }
  ];
  const theme = colorThemes[index % colorThemes.length];
  const dateObj = formatEventDate(event.eventDate);
  const showtimes = event.showtimes || (isCinema ? ['11:30 AM', '02:45 PM', '06:15 PM'] : null);

  return (
    <div className={`group relative bg-white rounded-3xl border-[3px] border-toy-black shadow-toy ${theme.popShadow} hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row min-w-0`}>
      
      {/* ─── LEFT: ARTWORK ANCHOR ─── */}
      <div className="relative w-full md:w-44 lg:w-48 h-48 md:h-auto shrink-0 bg-toy-black overflow-hidden rounded-t-[21px] md:rounded-tr-none md:rounded-l-[21px] border-b-[3px] md:border-b-0 md:border-r-[3px] border-toy-black">
        <img
          src={getImageForEvent(event, isCinema)}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="eager"
        />
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-toy-black/80 via-toy-black/20 to-transparent pointer-events-none" />

        {/* Top Badges: Wishlist / Admin Delete */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={onWishlist}
            className="w-8 h-8 rounded-full bg-white text-toy-black border-2 border-toy-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            title="Save to Wishlist"
          >
            <Heart size={14} className="text-bubble-pink fill-bubble-pink/25" />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-8 h-8 rounded-full bg-coral-peach text-white border-2 border-toy-black flex items-center justify-center font-black text-xs hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-[2px_2px_0px_#1E1B2E]"
              title="Remove Event"
            >
              ✕
            </button>
          )}
        </div>

        {/* Top Right: Category Tag */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/95 text-toy-black font-display font-black text-[10px] uppercase border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] tracking-wider">
            {event.category || 'EVENT'}
          </span>
        </div>

        {/* Bottom Format & Seats Badges */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
          <span className="px-2 py-0.5 rounded-md bg-toy-black/85 text-white font-display font-black text-[10px] uppercase border border-white/30 truncate max-w-[110px]" title={event.movieFormat || event.category}>
            {event.movieFormat || event.category || 'LIVE'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-mint-pop text-toy-black font-display font-black text-[10px] border border-toy-black flex items-center gap-1 shadow-sm shrink-0">
            {!isSoldOut && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
            {isSoldOut ? 'SOLD OUT' : `${event.availableSeats ?? 90} LEFT`}
          </span>
        </div>
      </div>

      {/* ─── CENTER: RICH DETAILS & SHOWTIMES ─── */}
      <div className="flex-1 p-3.5 sm:p-4 md:p-4 flex flex-col justify-between min-w-0 bg-white">
        <div className="flex flex-col gap-1.5">
          {/* Date & Time Header Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-buttercream border border-toy-black font-display font-black text-[11px] text-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
              <Calendar size={12} className="text-bubble-pink shrink-0" />
              <span>{dateObj.full}</span>
            </span>
            {isCinema && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sun-yellow/40 border border-toy-black/50 text-[10px] font-display font-black uppercase text-toy-black">
                <Film size={11} />
                IMAX 3D
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="font-display font-black text-base sm:text-lg text-toy-black leading-snug tracking-tight group-hover:text-bubble-pink transition-colors line-clamp-2">
            {event.name}
          </h3>

          {/* Venue & Location */}
          <div className="flex items-center gap-1 text-toy-black/75 text-xs font-body font-semibold">
            <MapPin size={13} className="text-candy-purple shrink-0" />
            <span className="truncate" title={event.venueAddress || event.venueName}>
              {event.venueAddress || event.venueName || 'Main Arena'}
            </span>
          </div>

          {/* Cinema Quick Showtime Selector */}
          {showtimes && (
            <div className="mt-1 pt-2 border-t border-dashed border-toy-black/15">
              <span className="block text-[10px] font-display font-black uppercase text-toy-black/60 mb-1">
                SELECT SHOWTIME:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {showtimes.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onBook(st)}
                    className="px-2 py-1 rounded-lg bg-buttercream hover:bg-sun-yellow text-toy-black border border-toy-black text-[10px] font-display font-black shadow-[1px_1px_0px_#1E1B2E] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Trust & Feature Indicators */}
        <div className="mt-2.5 pt-2 flex items-center gap-2 text-[10px] font-display font-extrabold text-toy-black/60 border-t border-toy-black/10">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Instant QR Pass
          </span>
          <span>•</span>
          <span>Official Box Office</span>
        </div>
      </div>

      {/* ─── PERFORATION NOTCHES & VERTICAL DASHES (DESKTOP) ─── */}
      <div className="hidden md:block relative w-0 shrink-0 border-l-2 border-dashed border-toy-black/30">
        <TicketNotchTopSVG />
        <TicketNotchBottomSVG />
      </div>

      {/* ─── PERFORATION NOTCHES & HORIZONTAL DASHES (MOBILE) ─── */}
      <div className="md:hidden relative h-0 shrink-0 border-t-2 border-dashed border-toy-black/30">
        <TicketNotchLeftSVG />
        <TicketNotchRightSVG />
      </div>

      {/* ─── RIGHT: TEAR-OFF BOOKING STUB ─── */}
      <div className={`w-full md:w-36 lg:w-40 p-3 sm:p-4 ${theme.stubBg} rounded-b-[21px] md:rounded-bl-none md:rounded-r-[21px] flex flex-row md:flex-col items-center justify-between md:justify-center gap-2.5 shrink-0 text-center border-t-[2.5px] md:border-t-0 border-toy-black/10`}>
        {/* Stub Decorative Barcode */}
        <div className="hidden md:block w-full text-toy-black/35 mb-0.5">
          <TicketBarcodeSVG className="w-full h-5" />
          <span className="block text-[8px] font-mono tracking-widest text-toy-black/50 mt-0.5">
            TKT-{(event.id * 8921).toString().slice(0, 8)}
          </span>
        </div>

        {/* Price Box */}
        <div className="text-left md:text-center">
          <span className="block text-[9px] font-display font-black uppercase text-toy-black/60 tracking-wider">
            {isSoldOut ? 'STATUS' : 'FROM'}
          </span>
          <span className="font-display font-black text-lg sm:text-xl text-toy-black leading-none tracking-tight">
            {isSoldOut ? 'SOLD OUT' : formatPrice(event.ticketPrice, event.currency)}
          </span>
        </div>

        {/* Action Button */}
        {isSoldOut ? (
          <button
            type="button"
            onClick={onWaitlist}
            className="px-3.5 py-2 rounded-full bg-sun-yellow text-toy-black font-display font-black text-[11px] sm:text-xs uppercase tracking-wider border-2 border-toy-black shadow-toy hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Waitlist
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onBook()}
            className={`px-3.5 py-2 rounded-full font-display font-black text-[11px] sm:text-xs uppercase tracking-wider border-2 border-toy-black shadow-toy hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap ${theme.rsvpBg}`}
          >
            {isCinema ? 'Book Seats ➔' : 'Select Seats ➔'}
          </button>
        )}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BENTO HEADLINER SPOTLIGHT CARD
// A cinematic widescreen card that anchors the Editorial Bento Showcase
// ─────────────────────────────────────────────────────────────────────────────
export function BentoSpotlightPass({
  event,
  currentUser,
  onBook,
  onWishlist,
  onWaitlist,
  onDelete
}) {
  if (!event) return null;
  const isSoldOut = event.availableSeats === 0;
  const canDelete = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER');
  const isCinema = event.category === 'CINEMA' || event.category === 'MOVIE' || /imax|cinema|movie|film|screening/i.test(event.name || '');
  const dateObj = formatEventDate(event.eventDate);
  const showtimes = event.showtimes || (isCinema ? ['11:30 AM', '02:45 PM', '06:15 PM', '09:45 PM'] : null);

  return (
    <div className="relative bg-toy-black text-white rounded-3xl border-[3px] border-toy-black shadow-toy-lg overflow-hidden flex flex-col md:flex-row md:h-64 lg:h-68 min-w-0">
      
      {/* Visual Widescreen Backdrop */}
      <div className="relative w-full md:w-5/12 lg:w-5/12 h-44 sm:h-48 md:h-full shrink-0 overflow-hidden">
        <img
          src={getImageForEvent(event, isCinema)}
          alt={event.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-toy-black via-toy-black/30 to-transparent" />

        {/* Headliner Spotlight Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-sun-yellow text-toy-black font-display font-black text-[10px] sm:text-xs uppercase tracking-wider border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] flex items-center gap-1">
            <Sparkles size={11} className="text-bubble-pink fill-bubble-pink" />
            ★ HEADLINER SPOTLIGHT
          </span>
          <span className="px-2 py-0.5 rounded-full bg-mint-pop text-toy-black font-display font-black text-[10px] uppercase border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]">
            {event.category || 'FEATURED'}
          </span>
        </div>

        {/* Action Controls: Wishlist & Admin Delete */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-coral-peach text-white border-2 border-toy-black flex items-center justify-center font-black text-xs hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-[2px_2px_0px_#1E1B2E]"
              title="Remove Event"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={onWishlist}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-toy-black border-2 border-toy-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0px_#1E1B2E] cursor-pointer"
            title="Save to Wishlist"
          >
            <Heart size={13} className="text-bubble-pink fill-bubble-pink/25" />
          </button>
        </div>

        {/* Floating Format Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-toy-black font-display font-black text-[10px] uppercase border border-toy-black">
            {event.movieFormat || 'VIP ACCESS'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-bubble-pink text-white font-display font-black text-[10px] border border-white/50">
            {isSoldOut ? 'SOLD OUT' : `${event.availableSeats ?? 90} REMAINING`}
          </span>
        </div>
      </div>

      {/* Spotlight Content & Direct Booking Area */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between bg-toy-black text-white min-w-0 h-full">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-sun-yellow text-xs font-display font-black tracking-wider uppercase">
            <Calendar size={13} />
            <span>{dateObj.full}</span>
          </div>

          <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-snug line-clamp-2">
            {event.name}
          </h2>

          <div className="flex items-center gap-1.5 text-white/70 text-xs font-body font-semibold">
            <MapPin size={13} className="text-sky-azure shrink-0" />
            <span className="truncate">{event.venueAddress || event.venueName || 'Main Arena'}</span>
          </div>

          <p className="text-white/75 font-body text-xs line-clamp-2 leading-relaxed">
            Experience the ultimate live spectacle in high fidelity with interactive auditorium seating, crystal-clear acoustics, and instant cryptographic QR passes.
          </p>

          {/* Quick Showtimes if Cinema */}
          {showtimes && (
            <div className="mt-1 pt-1.5 border-t border-white/10">
              <span className="block text-[10px] font-display font-black uppercase text-white/60 mb-1">
                FAST PASS SHOWTIMES:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {showtimes.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onBook(st)}
                    className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-sun-yellow hover:text-toy-black border border-white/30 hover:border-toy-black text-[10px] font-display font-black transition-all cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spotlight Footer Bar */}
        <div className="mt-2.5 pt-2.5 border-t border-white/15 flex flex-row items-center justify-between gap-3">
          <div>
            <span className="block text-[9px] font-display font-bold uppercase text-white/60 leading-none">PASSES FROM</span>
            <span className="font-display font-black text-xl sm:text-2xl text-sun-yellow leading-none">
              {isSoldOut ? 'SOLD OUT' : formatPrice(event.ticketPrice, event.currency)}
            </span>
          </div>

          {isSoldOut ? (
            <button
              type="button"
              onClick={onWaitlist}
              className="px-5 py-2 rounded-full bg-sun-yellow hover:bg-[#ffe142] text-toy-black font-display font-black text-xs uppercase tracking-wider border-2 border-white shadow-[2px_2px_0px_#FFE142] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
            >
              JOIN WAITLIST ➔
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBook()}
              className="px-5 py-2 rounded-full bg-bubble-pink hover:bg-[#ff1475] text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white shadow-[2px_2px_0px_#FFE142] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
            >
              {isCinema ? 'RESERVE SEATS ➔' : 'CLAIM PASSES ➔'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HORIZONTAL BOARDING PASS / TICKET STRIP (Dice.fm & Resident Advisor Style)
// Full-width stream format: Date tile on left, details center, stub on right.
// ─────────────────────────────────────────────────────────────────────────────
export function BoardingPassStrip({
  event,
  currentUser,
  onBook,
  onWishlist,
  onWaitlist
}) {
  const isSoldOut = event.availableSeats === 0;
  const isCinema = event.category === 'CINEMA' || event.category === 'MOVIE' || /imax|cinema|movie|film|screening/i.test(event.name || '');
  const dateObj = formatEventDate(event.eventDate);
  const showtimes = event.showtimes || (isCinema ? ['11:30 AM', '02:45 PM', '06:15 PM'] : null);

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border-[2.5px] border-toy-black shadow-toy hover:shadow-toy-lg hover:-translate-y-0.5 transition-all duration-300 p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-5 min-w-0">
      
      {/* 1. Date Block Tile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-sun-yellow border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] flex flex-col items-center justify-center text-center shrink-0">
          <span className="text-[10px] font-display font-black uppercase text-toy-black tracking-wider leading-none">
            {dateObj.month}
          </span>
          <span className="text-2xl sm:text-3xl font-display font-black text-toy-black leading-none my-0.5">
            {dateObj.day}
          </span>
          <span className="text-[9px] font-display font-bold uppercase text-toy-black/70 leading-none">
            {dateObj.weekday}
          </span>
        </div>

        {/* Thumbnail Preview */}
        <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-toy-black border-2 border-toy-black overflow-hidden shrink-0">
          <img
            src={getImageForEvent(event, isCinema)}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>

      {/* 2. Middle Event Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-mint-pop border border-toy-black text-[10px] font-display font-black uppercase text-toy-black shadow-sm">
            {event.category || 'EVENT'}
          </span>
          <span className="text-xs font-display font-bold text-candy-purple">
            {dateObj.time}
          </span>
          <span className="text-toy-black/40">•</span>
          <span className="text-xs font-display font-bold text-toy-black/60 truncate">
            {event.movieFormat || 'LIVE AUDITORIUM'}
          </span>
        </div>

        <h4 className="font-display font-black text-base sm:text-lg text-toy-black leading-snug group-hover:text-bubble-pink transition-colors truncate">
          {event.name}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-toy-black/70 font-semibold mt-0.5 truncate">
          <MapPin size={12} className="text-candy-purple shrink-0" />
          <span className="truncate">{event.venueAddress || event.venueName || 'Main Arena'}</span>
        </div>
      </div>

      {/* 3. Showtimes Pill (if cinema) */}
      {showtimes && (
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          {showtimes.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onBook(st)}
              className="px-2.5 py-1 rounded-lg bg-buttercream hover:bg-sun-yellow border border-toy-black text-[11px] font-display font-bold transition-colors cursor-pointer"
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* 4. Price & Action Button */}
      <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-toy-black/10">
        <div className="text-left md:text-right">
          <span className="block text-[9px] font-display font-black uppercase text-toy-black/60">
            {isSoldOut ? 'STATUS' : 'PRICE'}
          </span>
          <span className="font-display font-black text-lg sm:text-xl text-toy-black leading-none">
            {isSoldOut ? 'SOLD OUT' : formatPrice(event.ticketPrice, event.currency)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBook()}
          disabled={isSoldOut}
          className={`px-5 py-2.5 rounded-full font-display font-black text-xs uppercase tracking-wider border-2 border-toy-black shadow-toy transition-all cursor-pointer whitespace-nowrap ${
            isSoldOut
              ? 'bg-toy-black/20 text-toy-black cursor-not-allowed'
              : 'bg-toy-black text-white hover:bg-bubble-pink hover:-translate-y-0.5 active:translate-y-0.5'
          }`}
        >
          {isSoldOut ? 'Waitlist' : isCinema ? 'Book ➔' : 'Select ➔'}
        </button>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INTERACTIVE 4-MODE LAYOUT SWITCHER BAR
// Lets the user review & switch between all 4 layout styles in real-time
// ─────────────────────────────────────────────────────────────────────────────
export function LayoutSwitcherBar({
  activeLayout = 'bento',
  onSelectLayout
}) {
  const layouts = [
    {
      id: 'bento',
      label: '1. Bento Showcase',
      desc: 'Widescreen Spotlight + Paired Ticket Passes',
      icon: '✦'
    },
    {
      id: 'feed',
      label: '2. Boarding Pass Feed',
      desc: 'Full-width Dice.fm style event strips',
      icon: '☰'
    },
    {
      id: 'reels',
      label: '3. Category Split Reels',
      desc: 'Curated IMAX & Concert visual streams',
      icon: '🎬'
    },
    {
      id: 'grid',
      label: '4. Landscape Pass Grid',
      desc: 'Balanced 2-column landscape ticket passes',
      icon: '⚏'
    }
  ];

  return (
    <div className="mb-6 bg-lilac-wash rounded-3xl border-[3px] border-toy-black p-3.5 sm:p-5 shadow-toy flex flex-col gap-3 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sun-yellow text-toy-black font-display font-black text-[10px] uppercase border border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
            LAYOUT EXPERIMENT
          </span>
          <h4 className="font-display font-black text-sm sm:text-base text-toy-black">
            Choose Your Preferred Layout Style:
          </h4>
        </div>
        <span className="text-xs font-body font-semibold text-toy-black/70">
          Showing 4 distinct modern layout styles
        </span>
      </div>

      {/* Switcher Buttons Grid / Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {layouts.map((lt) => {
          const isActive = activeLayout === lt.id;
          return (
            <button
              key={lt.id}
              type="button"
              onClick={() => onSelectLayout(lt.id)}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 border-toy-black text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                isActive
                  ? 'bg-sun-yellow text-toy-black shadow-toy scale-[1.02] ring-2 ring-bubble-pink'
                  : 'bg-white hover:bg-buttercream text-toy-black hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#1E1B2E]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-display font-black text-xs sm:text-sm tracking-tight flex items-center gap-1.5 truncate">
                  <span>{lt.icon}</span>
                  <span>{lt.label}</span>
                </span>
                {isActive && (
                  <span className="w-4 h-4 rounded-full bg-toy-black text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-[10px] font-body font-semibold text-toy-black/70 line-clamp-1">
                {lt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
