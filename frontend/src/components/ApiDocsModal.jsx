import React, { useState } from 'react';
import { X, Code2, ExternalLink, Copy, Check, Terminal, FileCode, Layers } from 'lucide-react';

export default function ApiDocsModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/login',
      category: 'Auth',
      summary: 'User Sign In',
      description: 'Authenticates user credentials and issues HttpOnly session access & refresh cookies.',
      body: '{\n  "email": "user@example.com",\n  "password": "password123"\n}'
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      category: 'Auth',
      summary: 'User Registration',
      description: 'Creates a new CUSTOMER or ORGANIZER account.',
      body: '{\n  "firstName": "Jane",\n  "lastName": "Doe",\n  "email": "jane@example.com",\n  "password": "password123",\n  "role": "CUSTOMER"\n}'
    },
    {
      method: 'GET',
      path: '/api/events',
      category: 'Events',
      summary: 'Browse Events Catalog',
      description: 'Returns paginated list of live events with venue and pricing details.',
      queryParams: '?page=0&size=10&category=CONCERT'
    },
    {
      method: 'POST',
      path: '/api/bookings',
      category: 'Bookings',
      summary: 'Reserve Seats & Create Booking',
      description: 'Locks selected seats for 10 minutes and generates booking transaction.',
      body: '{\n  "eventId": 1,\n  "seatIds": [101, 102],\n  "paymentMethod": "CREDIT_CARD"\n}'
    },
    {
      method: 'GET',
      path: '/api/tickets/validate/{code}',
      category: 'Gate Entry',
      summary: 'Validate QR Ticket Signature',
      description: 'Scans QR signature token and verifies ticket legitimacy and admission state.',
      queryParams: 'Returns { "valid": true, "ticketStatus": "ACTIVE" }'
    },
    {
      method: 'GET',
      path: '/actuator/health',
      category: 'System',
      summary: 'Backend Service Health',
      description: 'Exposes database, disk, and API health diagnostics.'
    }
  ];

  const categories = ['All', 'Auth', 'Events', 'Bookings', 'Gate Entry', 'System'];

  const filtered = activeCategory === 'All' 
    ? endpoints 
    : endpoints.filter((e) => e.category === activeCategory);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
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
        maxWidth: '850px',
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
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #fff)', margin: 0 }}>
                REST API Documentation
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #9ca3af)', margin: 0, marginTop: '2px' }}>
                OpenAPI 3.0 Standard • Spring Boot REST Interface
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              Swagger UI <ExternalLink size={14} />
            </a>
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
        </div>

        {/* Category Tabs */}
        <div style={{
          padding: '12px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.15)',
          overflowX: 'auto'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeCategory === cat ? '#0ea5e9' : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary, #cbd5e1)',
                fontWeight: activeCategory === cat ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Endpoints List */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {filtered.map((ep, idx) => {
            const methodColor = ep.method === 'GET' ? '#10b981' : ep.method === 'POST' ? '#3b82f6' : '#f59e0b';
            return (
              <div key={idx} style={{
                padding: '18px 20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: `${methodColor}20`,
                      color: methodColor
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main, #fff)' }}>
                      {ep.path}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(`http://localhost:8080${ep.path}`, idx)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedIndex === idx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedIndex === idx ? 'Copied' : 'Copy URL'}
                  </button>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main, #fff)', marginBottom: '4px' }}>
                  {ep.summary}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5 }}>
                  {ep.description}
                </div>

                {ep.body && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #9ca3af)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Request Payload (JSON)
                    </div>
                    <pre style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: '#38bdf8',
                      margin: 0,
                      overflowX: 'auto'
                    }}>
                      {ep.body}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #9ca3af)' }}>
            Base URL: http://localhost:8080/api
          </span>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '8px 18px' }}>
            Close API Specs
          </button>
        </div>
      </div>
    </div>
  );
}
