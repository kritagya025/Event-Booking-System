import React, { useState } from 'react';
import { X, Cookie, ShieldCheck, Check, Settings } from 'lucide-react';

export default function CookiesModal({ isOpen, onClose, showToast }) {
  const [preferences, setPreferences] = useState({
    essential: true, // Always required for HttpOnly auth
    analytics: true,
    functional: true
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (showToast) showToast('Cookie preferences saved successfully', 'success');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--card-bg, #111827)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(234, 179, 8, 0.15)',
              color: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cookie size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #fff)', margin: 0 }}>
                Cookie Policy & Preferences
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #9ca3af)', margin: 0, marginTop: '2px' }}>
                Manage how cookies & session storage are used on EventHub
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: 'var(--text-secondary, #cbd5e1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '28px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #cbd5e1)', margin: 0, lineHeight: 1.6 }}>
            We use cookies and similar technologies to maintain secure authentication, remember your currency preferences, and deliver seamless seat booking experiences.
          </p>

          {/* Cookie Item: Essential */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #fff)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Strictly Necessary Cookies <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '10px' }}>Required</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)', marginTop: '4px' }}>
                HttpOnly session cookies required for user login, JWT renewal, and seat hold state.
              </div>
            </div>
            <input type="checkbox" checked disabled style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'not-allowed' }} />
          </div>

          {/* Cookie Item: Functional */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #fff)' }}>
                Functional & Preference Cookies
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)', marginTop: '4px' }}>
                Remembers currency settings (USD/EUR/GBP/INR) and active catalog filters.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.functional} 
              onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--sb-orange, #f97316)', cursor: 'pointer' }} 
            />
          </div>

          {/* Cookie Item: Analytics */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #fff)' }}>
                Performance & Analytics
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)', marginTop: '4px' }}>
                Anonymous telemetry helping us optimize page load speeds & event discovery algorithms.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.analytics} 
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--sb-orange, #f97316)', cursor: 'pointer' }} 
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button onClick={() => setPreferences({ essential: true, analytics: true, functional: true })} className="btn btn-secondary btn-sm">
            Accept All
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
