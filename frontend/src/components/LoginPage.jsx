import React, { useState } from 'react';
import { ArrowRight, Ticket } from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';

export default function LoginPage({ onAuthSuccess, onNavigate, showToast }) {
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (forgotMode) {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        });
        showToast('Password reset link sent to your email', 'info');
        setForgotMode(false);
      } else {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const user = response.user || { email: formData.email, firstName: 'User', role: 'CUSTOMER' };
        setAuthSession(response.token, response.refreshToken, user);
        showToast('Welcome back!', 'success');
        onAuthSuccess(user);
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
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

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div 
            onClick={() => onNavigate('home')}
            style={{
              width: '48px', height: '48px', borderRadius: '14px', background: '#FFF',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', cursor: 'pointer'
            }}
          >
            <Ticket size={24} color="#000" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
            {forgotMode ? 'Reset password' : 'Welcome back'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {forgotMode
              ? 'Enter your email to receive a reset link'
              : 'Sign in to your EventHub account'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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

          {!forgotMode && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password<span style={{ color: '#ef4444' }}> *</span></label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}
                >
                  Forgot password?
                </button>
              </div>
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
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : forgotMode ? 'Send Reset Link' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {forgotMode ? (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <button onClick={() => setForgotMode(false)} style={{ color: '#FFF', fontWeight: '700' }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button onClick={() => onNavigate('register')} style={{ color: '#FFF', fontWeight: '700' }}>
              Create account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
