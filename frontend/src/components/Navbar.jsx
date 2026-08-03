import React, { useState, useEffect } from 'react';
import { Ticket, Search, Heart, User, LogOut, ShieldCheck, QrCode, PlusCircle, Compass, Globe } from 'lucide-react';
import { getActiveCurrency, setActiveCurrency, getAvailableCurrencies, subscribeCurrencyChange } from '../services/currency';

export default function Navbar({ currentUser, onNavigate, activeTab, onOpenAuthModal, onLogout }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currency, setCurrency] = useState(getActiveCurrency());

  useEffect(() => {
    return subscribeCurrencyChange((newCurr) => setCurrency(newCurr));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      onNavigate('events', { keyword: searchKeyword.trim() });
    }
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      {/* Brand */}
      <div 
        onClick={() => onNavigate('home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ticket size={20} color="#000" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: '900', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            EventHub
          </span>
          <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-subtle)', fontWeight: '600', letterSpacing: '0.1em', marginTop: '-3px' }}>
            TICKETING
          </span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} style={{ flex: '0 1 320px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search events..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="form-input"
          style={{ width: '100%', paddingLeft: '36px', borderRadius: 'var(--radius-full)', height: '40px', fontSize: '0.85rem' }}
        />
        <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      </form>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button 
          onClick={() => onNavigate('events')}
          className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '7px 14px', fontSize: '0.82rem' }}
        >
          <Compass size={14} /> Explore
        </button>

        {currentUser && currentUser.role === 'CUSTOMER' && (
          <>
            <button 
              onClick={() => onNavigate('wishlist')}
              className={`btn ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <Heart size={14} /> Wishlist
            </button>

            <button 
              onClick={() => onNavigate('my-bookings')}
              className={`btn ${activeTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <Ticket size={14} /> Tickets
            </button>
          </>
        )}

        {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER') && (
          <>
            <button 
              onClick={() => onNavigate('create-event')}
              className="btn btn-secondary"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <PlusCircle size={14} /> Create
            </button>

            <button 
              onClick={() => onNavigate('checkin')}
              className={`btn ${activeTab === 'checkin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <QrCode size={14} /> Check-In
            </button>
          </>
        )}

        {currentUser && currentUser.role === 'ADMIN' && (
          <button 
            onClick={() => onNavigate('admin')}
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <ShieldCheck size={14} /> Admin
          </button>
        )}

        {/* Regional Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '2px 8px' }}>
          <Globe size={13} color="var(--text-muted)" />
          <select 
            value={currency} 
            onChange={(e) => setActiveCurrency(e.target.value)}
            style={{ 
              background: 'transparent', 
              color: 'var(--text-main)', 
              border: 'none', 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              outline: 'none', 
              cursor: 'pointer' 
            }}
          >
            {getAvailableCurrencies().map((c) => (
              <option key={c.code} value={c.code} style={{ background: '#0A0A0A', color: '#FFF' }}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', paddingLeft: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700' }}>
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>
                {currentUser.role}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="btn btn-secondary" 
              title="Logout"
              style={{ padding: '7px', borderRadius: '50%' }}
            >
              <LogOut size={14} color="#FFF" />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <button 
              onClick={() => onNavigate('login')} 
              className="btn btn-secondary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('register')} 
              className="btn btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
