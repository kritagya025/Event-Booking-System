import React, { useState } from 'react';
import { ArrowRight, Ticket } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function RegisterPage({ onNavigate, showToast }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Account created! Check your email to verify.', 'success');
      onNavigate('login');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <button 
        onClick={() => onNavigate('home')} 
        className="btn btn-secondary btn-sm"
        style={{ position: 'absolute', top: '24px', left: '24px' }}
      >
        ← Back to Home
      </button>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div 
            onClick={() => onNavigate('home')}
            style={{
              width: '52px', height: '52px', borderRadius: '14px', background: 'var(--eb-orange)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', cursor: 'pointer',
              boxShadow: '0 4px 18px var(--eb-orange-glow)'
            }}
          >
            <Ticket size={26} color="#FFFFFF" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Join EventHub to reserve seats, track tickets, and unlock exclusive rewards
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">First Name<span style={{ color: '#ef4444' }}> *</span></label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Jane"
                style={{ height: '48px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name<span style={{ color: '#ef4444' }}> *</span></label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Doe"
                style={{ height: '48px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email<span style={{ color: '#ef4444' }}> *</span></label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="name@example.com"
              style={{ height: '48px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password<span style={{ color: '#ef4444' }}> *</span></label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              style={{ height: '48px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+1 (555) 000-0000"
                style={{ height: '48px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Type<span style={{ color: '#ef4444' }}> *</span></label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                style={{ height: '48px' }}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ORGANIZER">Organizer</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} style={{ color: '#FFF', fontWeight: '700' }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
