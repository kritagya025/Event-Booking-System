import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        setAuthSession(response.token, response.refreshToken, response.user || { email: formData.email, firstName: 'User', role: 'CUSTOMER' });
        showToast('Successfully logged in!', 'success');
        onAuthSuccess(response.user || { email: formData.email, firstName: 'User', role: 'CUSTOMER' });
        onClose();
      } else if (mode === 'register') {
        await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        showToast('Registration successful! Check your email to verify.', 'success');
        setMode('login');
      } else if (mode === 'forgot') {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        });
        showToast('Password reset link sent to your email!', 'info');
        setMode('login');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create account'}
              {mode === 'forgot' && 'Reset password'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {mode === 'login' && 'Sign in to access your tickets and bookings'}
              {mode === 'register' && 'Join to book events and manage tickets'}
              {mode === 'forgot' && 'Enter your email to receive a reset link'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="form-input" placeholder="Jane" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="form-input" placeholder="Doe" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="form-select">
                    <option value="CUSTOMER">Customer</option>
                    <option value="ORGANIZER">Organizer</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="form-input" placeholder="name@example.com" />
            </div>

            {mode !== 'forgot' && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Forgot?
                    </button>
                  )}
                </div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="form-input" placeholder="••••••••" />
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <span>No account? <button onClick={() => setMode('register')} style={{ color: '#FFF', fontWeight: '700' }}>Register</button></span>
            ) : (
              <span>Have an account? <button onClick={() => setMode('login')} style={{ color: '#FFF', fontWeight: '700' }}>Sign in</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
