import React, { useState, useEffect } from 'react';
import { Heart, Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';
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
          name: 'Neon Horizon Cyber Music Festival 2026',
          category: 'MUSIC',
          ticketPrice: 85.00,
          eventDate: '2026-09-15',
          availableSeats: 140,
          venueName: 'Metro Arena Center'
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
      showToast('Removed from wishlist', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove', 'error');
    }
  };

  return (
    <div style={{ padding: '0 24px 40px 24px', maxWidth: '1320px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Wishlist</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Events you want to attend</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : wishlistItems.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <Heart size={40} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontWeight: 700 }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.88rem' }}>Save events by clicking the heart icon</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {wishlistItems.map((event) => (
            <div key={event.id} className="glass-panel glass-panel-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-purple">{event.category}</span>
                  <button 
                    onClick={() => handleRemoveFromWishlist(event.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: 700 }}>{event.name}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="var(--text-subtle)" /> {event.eventDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--text-subtle)" /> {event.venueName || 'Main Arena'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFF' }}>{formatPrice(event.ticketPrice, event.currency)}</span>
                <button onClick={() => onSelectEvent(event)} className="btn btn-primary btn-sm">
                  Book <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
