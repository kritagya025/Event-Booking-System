import React, { useState, useEffect } from 'react';
import { Bookmark, Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../services/api';
import { formatPrice } from '../services/currency';
import WishlistCardSkeleton from './WishlistCardSkeleton';

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
    } catch {
      setWishlistItems([
        {
          id: 1,
          name: 'GLOBAL DEVELOPER SUMMIT 2026',
          category: 'TECH',
          ticketPrice: 49.00,
          eventDate: '2026-09-15',
          availableSeats: 50,
          venueName: 'METROPOLITAN CONVENTION CENTER'
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
      showToast('REMOVED FROM SAVED WISHLIST', 'info');
    } catch (err) {
      showToast(err.message || 'FAILED TO REMOVE EVENT', 'error');
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 md:px-6 py-8 text-grit-white font-mono-zine">
      
      {/* Header */}
      <div className="mb-8 border-b-2 border-asphalt-border pb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
              EVENTHUB://WISHLIST
            </span>
            <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
              SAVED EVENTS
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-grit-white leading-none">
            SAVED EVENTS & WISHLIST
          </h1>
          <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
            YOUR CURATED LIST OF UPCOMING CONCERTS, CONFERENCES & EXPERIENCES
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <WishlistCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-asphalt-surface border-4 border-dashed border-asphalt-border p-12 text-center">
          <Bookmark size={48} className="text-grit-dim mx-auto mb-3 opacity-40" />
          <h3 className="font-impact text-2xl uppercase text-grit-white tracking-wider">NO SAVED EVENTS</h3>
          <p className="font-mono-zine text-xs text-grit-dim uppercase mt-1">
            CLICK THE BOOKMARK STAMP ON ANY EVENT TO SAVE IT HERE
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((event) => {
            const isSoldOut = event.availableSeats === 0;
            return (
              <div 
                key={event.id} 
                className={`bg-asphalt-surface border-2 p-5 flex flex-col justify-between relative transition-all ${
                  isSoldOut
                    ? 'sold-out-monochrome border-grit-dim/70 shadow-[3px_3px_0px_#222] opacity-85 hover:opacity-100'
                    : 'border-grit-white shadow-[3px_3px_0px_#E2F13C]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`${isSoldOut ? 'bg-asphalt-black text-grit-white border border-grit-white' : 'bg-acid-yellow text-asphalt-black'} font-impact tracking-wider text-xs px-2 py-0.5 uppercase`}>
                        {event.category}
                      </span>
                      {isSoldOut && (
                        <span className="bg-grit-white text-asphalt-black font-impact text-[10px] px-1.5 py-0.5 uppercase font-bold">
                          SOLD OUT
                        </span>
                      )}
                    </div>
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
                      <Calendar size={13} className={isSoldOut ? 'text-grit-dim' : 'text-acid-yellow'} />
                      <span>{event.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className={isSoldOut ? 'text-grit-dim' : 'text-acid-yellow'} />
                      <span>{event.venueName || 'METROPOLITAN AUDITORIUM'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-asphalt-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-ticker text-grit-dim uppercase block">TICKET PRICE</span>
                    <span className={`font-display text-2xl font-bold leading-none ${isSoldOut ? 'text-grit-white line-through opacity-70' : 'text-acid-yellow'}`}>
                      {formatPrice(event.ticketPrice, event.currency)}
                    </span>
                  </div>
                  {isSoldOut ? (
                    <button 
                      onClick={() => onSelectEvent(event)} 
                      className="bg-asphalt-surface text-grit-white font-impact tracking-wider text-xs uppercase px-4 py-2 border border-grit-dim hover:border-grit-white hover:bg-grit-white hover:text-asphalt-black transition-all shadow-[2px_2px_0px_#222] flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      WAITLIST // SOLD OUT <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelectEvent(event)} 
                      className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs uppercase px-4 py-2 border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[2px_2px_0px_#ffffff] flex items-center gap-1.5 cursor-pointer"
                    >
                      BOOK TICKETS <ArrowRight size={13} />
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
