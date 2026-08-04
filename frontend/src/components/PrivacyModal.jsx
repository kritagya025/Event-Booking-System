import React from 'react';
import { X, Lock, ShieldCheck, Database, Key, Check } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
        maxWidth: '750px',
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
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #fff)', margin: 0 }}>
                Privacy Policy & Security
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #9ca3af)', margin: 0, marginTop: '2px' }}>
                GDPR & CCPA Compliant • HttpOnly Encrypted Session Management
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
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: 'var(--text-secondary, #cbd5e1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                1. Data Protection Guarantee
              </h3>
            </div>
            <p>
              Your privacy is paramount. EventHub employs industry-leading end-to-end security measures. All sensitive session tokens are delivered exclusively over secure HttpOnly cookies, completely mitigating cross-site scripting (XSS) attack vectors.
            </p>
          </section>

          <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Database size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                2. Information We Collect
              </h3>
            </div>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Account Credentials:</strong> Full name, email address, encrypted password hash (BCrypt salted).</li>
              <li><strong>Booking Transactions:</strong> Reserved seats, venue locations, ticket QR signature tokens.</li>
              <li><strong>Check-in Logs:</strong> Gate entry timestamps and validation metrics for venue access audit control.</li>
            </ul>
          </section>

          <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Key size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                3. Third-Party Sharing & Data Export
              </h3>
            </div>
            <p>
              We do not sell or monetize personal user data. Data is shared with venue organizers strictly to facilitate event access, seat allocation, and attendee safety protocols. Users retain the full right to export or request permanent deletion of their account records at any time.
            </p>
          </section>
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
          <span style={{ fontSize: '0.82rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} /> 256-Bit SSL/TLS Encryption Active
          </span>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '10px 24px', background: '#10b981', borderColor: '#10b981' }}>
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
