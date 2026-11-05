import React, { useState, useEffect } from 'react';
import { Bookmark, Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../services/api';
import { formatPrice } from '../services/currency';

export default function Wishlist({ _currentUser, onSelectEvent, showToast }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/wishlist');
      setWishlistItems(data);
    } catch (_err) {
      setWishlistItems([
        {
          id: 1,
          name: 'MAHLER 203: RESURRECTION RAVE',
          category: 'TECHNO',
          ticketPrice: 30.00,
          eventDate: '2026-09-15',
          availableSeats: 50,
          venueName: 'PIER 44 COLD SHED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (eventId) => {
    try {
      await apiFetch(`/wishlist/${eventId}`, { method: 'DELETE' });
      setWishlistItems(wishlistItems.filter(e => e.id !== eventId));
      showToast('REMOVED FROM SAVED TAPES', 'info');
    } catch (err) {
      showToast(err.message || 'FAILED TO REMOVE TAPE', 'error');
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 md:px-6 py-8 text-grit-white font-mono-zine">
      
      {/* Header */}
      <div className="mb-8 border-b-2 border-asphalt-border pb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
              VAULT://BOOKMARKS
            </span>
            <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
              SAVED FLYERS
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-grit-white leading-none">
            SAVED TAPES & FLYER BOOKMARKS
          </h1>
          <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
            YOUR CURATED DECK OF UPCOMING INDUSTRIAL SESSIONS & WAREHOUSE GIGS
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-acid-yellow border-t-transparent mx-auto mb-3"></div>
          <span className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider animate-pulse">
            AUDITING SAVED TAPES ARCHIVE...
          </span>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-asphalt-surface border-4 border-dashed border-asphalt-border p-12 text-center">
          <Bookmark size={48} className="text-grit-dim mx-auto mb-3 opacity-40" />
          <h3 className="font-impact text-2xl uppercase text-grit-white tracking-wider">NO TAPES SAVED</h3>
          <p className="font-mono-zine text-xs text-grit-dim uppercase mt-1">
            CLICK THE BOOKMARK STAMP ON ANY FLYER TO PIN IT TO THIS ARCHIVE
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((event) => (
            <div 
              key={event.id} 
              className="bg-asphalt-surface border-4 border-grit-white shadow-[6px_6px_0px_#eefc54] p-5 flex flex-col justify-between relative"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5 uppercase">
                    {event.category}
                  </span>
                  <button 
                    onClick={() => handleRemoveFromWishlist(event.id)}
                    className="text-neon-magenta hover:text-grit-white bg-asphalt-card border border-asphalt-border hover:border-neon-magenta p-1 cursor-pointer transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h3 className="font-display text-2xl uppercase tracking-tight text-grit-white leading-tight mb-3">
                  {event.name}
                </h3>

                <div className="space-y-1.5 font-mono-zine text-xs text-grit-dim uppercase mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-acid-yellow" />
                    <span>{event.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-acid-yellow" />
                    <span>{event.venueName || 'NORTH INDUSTRIAL DOCKS'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-asphalt-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-ticker text-grit-dim uppercase block">TARIFF</span>
                  <span className="font-display text-2xl text-acid-yellow font-bold leading-none">
                    {formatPrice(event.ticketPrice, event.currency)}
                  </span>
                </div>
                <button 
                  onClick={() => onSelectEvent(event)} 
                  className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs uppercase px-4 py-2 border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[2px_2px_0px_#ffffff] flex items-center gap-1.5 cursor-pointer"
                >
                  CLAIM PASS <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
