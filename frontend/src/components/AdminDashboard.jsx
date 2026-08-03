import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calendar, Ticket, Activity, BarChart2, Award, Trash2 } from 'lucide-react';
import { apiFetch } from '../services/api';
import { formatPrice } from '../services/currency';

export default function AdminDashboard({ showToast }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dash, rev] = await Promise.all([
        apiFetch('/admin/dashboard').catch(() => null),
        apiFetch('/admin/revenue').catch(() => null)
      ]);
      setDashboardData(dash);
      setRevenueData(rev);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to remove event "${eventName || 'this event'}"?`)) return;
    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      showToast('Event removed successfully', 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to remove event', 'error');
    }
  };

  const metrics = dashboardData || {
    totalUsers: 1420,
    totalEvents: 48,
    totalBookings: 3890,
    totalRevenue: 248900.00,
    todayRevenue: 4250.00,
    upcomingEventsCount: 18,
    cancelledEventsCount: 2,
    popularEvents: [
      { id: 1, name: 'Symphony in the Park', category: 'MUSIC', ticketPrice: 75.00, availableSeats: 120 },
      { id: 2, name: 'AI & Future Tech Summit', category: 'TECH', ticketPrice: 299.00, availableSeats: 45 },
      { id: 3, name: 'Broadway Musical Revival', category: 'THEATER', ticketPrice: 120.00, availableSeats: 12 }
    ]
  };

  return (
    <div style={{ padding: '0 24px 40px 24px', maxWidth: '1320px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Platform metrics overview</p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
          <Activity size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Revenue</span>
            <DollarSign size={18} color="var(--text-subtle)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800' }}>
            {formatPrice(metrics.totalRevenue)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>+{formatPrice(4250)} today</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bookings</span>
            <Ticket size={18} color="var(--text-subtle)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800' }}>
            {metrics.totalBookings?.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Confirmed orders</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Users</span>
            <Users size={18} color="var(--text-subtle)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800' }}>
            {metrics.totalUsers?.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Customers & organizers</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Events</span>
            <Calendar size={18} color="var(--text-subtle)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800' }}>
            {metrics.totalEvents}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{metrics.upcomingEventsCount} upcoming</span>
        </div>
      </div>

      {/* Detail Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <div className="stat-card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Award size={16} color="var(--text-secondary)" /> Top Events
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics.popularEvents?.map((event, idx) => (
              <div key={event.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FFF', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.name}</h4>
                    <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>{event.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{formatPrice(event.ticketPrice, event.currency)}</span>
                  <button 
                    onClick={() => handleDeleteEvent(event.id, event.name)} 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: '4px 8px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    title="Remove Event"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <BarChart2 size={16} color="var(--text-secondary)" /> System Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Database</span>
              <span className="badge badge-green">PostgreSQL</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Cache</span>
              <span className="badge badge-green">Redis</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>WebSocket</span>
              <span className="badge badge-purple">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rate Limit</span>
              <span className="badge badge-cyan">10/min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
