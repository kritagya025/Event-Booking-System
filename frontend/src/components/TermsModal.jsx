import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
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
              background: 'rgba(249, 115, 22, 0.15)',
              color: 'var(--sb-orange, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #fff)', margin: 0 }}>
                Terms & Conditions
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #9ca3af)', margin: 0, marginTop: '2px' }}>
                Last updated: August 2026 • EventHub Platform Master Policy
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
              <ShieldCheck size={18} color="var(--sb-orange, #f97316)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                1. Acceptance of Terms & Services
              </h3>
            </div>
            <p>
              By accessing or using EventHub, booking tickets, hosting events, or interacting with our automated QR gate verification infrastructure, you agree to bound by these Terms & Conditions. If you do not agree to these terms, please do not utilize our platform.
            </p>
          </section>

          <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <CheckCircle2 size={18} color="var(--sb-orange, #f97316)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                2. Seat Locks, Ticketing & Real-time Allocation
              </h3>
            </div>
            <p style={{ marginBottom: '10px' }}>
              Seat allocations are dynamically held during your checkout flow for a maximum duration of 10 minutes. If payment confirmation is not received within this window, held seats automatically release back to the active inventory pool.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Tickets are digitally issued with unique cryptographic QR codes.</li>
              <li>Each QR ticket is valid for one-time admission at venue gate scanners.</li>
              <li>Reselling tickets at inflated prices above face value is strictly prohibited.</li>
            </ul>
          </section>

          <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <AlertCircle size={18} color="var(--sb-orange, #f97316)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                3. Cancellations & Refund Policy
              </h3>
            </div>
            <p>
              Event organizers define individual refund eligibility periods. Approved cancellations prior to 48 hours before event start time receive full automated credit or refund processing minus network processing fees.
            </p>
          </section>

          <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <HelpCircle size={18} color="var(--sb-orange, #f97316)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #fff)', margin: 0 }}>
                4. Organizer Code of Conduct
              </h3>
            </div>
            <p>
              Organizers hosting live events on EventHub must verify venue logistics, ensure maximum occupancy safety thresholds are strictly respected, and honor legitimate ticket entries verified via the Gate Scanner protocol.
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
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #9ca3af)' }}>
            Questions? Contact support@eventhub.com
          </span>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
