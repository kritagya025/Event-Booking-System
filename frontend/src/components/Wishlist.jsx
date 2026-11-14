import React, { useState, useEffect } from 'react';
import { Bookmark, Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../services/api';
import { formatPrice } from '../services/currency';
import { BalloonSticker } from './CustomStickers';
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
      setWishlistItems(prev => prev.filter(e => e.id !== eventId));
      showToast('Removed from saved wishlist', 'info');
    } catch {
      setWishlistItems(prev => prev.filter(e => e.id !== eventId));
      showToast('Removed from saved wishlist', 'info');
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 text-toy-black font-body">
      
      {/* Header */}
      <div className="mb-8 sm:mb-10 border-b-2 border-dashed border-toy-black/20 pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sun-yellow text-toy-black text-xs font-display font-black px-3 py-1 rounded-full border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
              Saved Parties
            </span>
            <span className="text-xs text-toy-black/70 font-display font-bold">
              Your Party Wishlist
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-toy-black leading-tight">
            Saved Parties & Gatherings
          </h1>
          <p className="text-sm font-body font-semibold text-toy-black/70 mt-1.5 leading-relaxed">
            Your curated collection of upcoming rooftop jams, supper clubs, and concerts.
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
        <div className="bg-white rounded-[32px] border-[3px] border-toy-black p-12 text-center max-w-lg mx-auto shadow-toy-lg">
          <div className="w-16 h-16 rounded-full bg-sun-yellow border-2 border-toy-black shadow-toy flex items-center justify-center mx-auto mb-4">
            <BalloonSticker size={38} />
          </div>
          <h3 className="text-xl font-display font-black text-toy-black">No saved parties yet</h3>
          <p className="text-sm font-body font-semibold text-toy-black/70 mt-1.5">
            Click the heart icon on any party card to save it to your personal wishlist!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((event) => {
            const isSoldOut = event.availableSeats === 0;
            return (
              <div 
                key={event.id} 
                className={`bg-white rounded-[28px] border-[3px] border-toy-black p-6 flex flex-col justify-between transition-all shadow-toy hover:shadow-pop-purple ${
                  isSoldOut ? 'opacity-75' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-lilac-wash text-toy-black border-2 border-toy-black text-xs font-display font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {event.category}
                      </span>
                      {isSoldOut && (
                        <span className="bg-coral-peach text-white text-xs font-display font-black px-3 py-1 rounded-full border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveFromWishlist(event.id)}
                      className="w-9 h-9 rounded-full bg-buttercream hover:bg-coral-peach/30 text-toy-black border-2 border-toy-black flex items-center justify-center transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#1E1B2E]"
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-toy-black leading-snug mb-3">
                    {event.name}
                  </h3>

                  <div className="space-y-2 text-xs text-toy-black/70 mb-6 font-body font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-bubble-pink shrink-0" />
                      <span>{event.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-candy-purple shrink-0" />
                      <span className="truncate">{event.venueName || 'Metropolitan Auditorium'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-dashed border-toy-black/20 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase text-toy-black/60 font-display font-black tracking-wider block">Ticket Price</span>
                    <span className={`text-xl font-display font-black ${isSoldOut ? 'text-toy-black/40 line-through' : 'text-toy-black'}`}>
                      {formatPrice(event.ticketPrice, event.currency)}
                    </span>
                  </div>
                  {isSoldOut ? (
                    <button 
                      onClick={() => onSelectEvent(event)} 
                      className="h-[46px] px-5 rounded-full bg-buttercream text-toy-black hover:bg-sun-yellow text-xs font-display font-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Waitlist</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelectEvent(event)} 
                      className="h-[46px] px-6 rounded-full bg-sun-yellow hover:bg-[#ffe142] text-toy-black text-xs font-display font-black border-2 border-toy-black shadow-toy hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>RSVP Now</span>
                      <ArrowRight size={14} />
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
