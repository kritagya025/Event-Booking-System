import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, FileCode } from 'lucide-react';

export default function ApiDocsModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/login',
      category: 'Auth',
      summary: 'USER AUTHENTICATION',
      description: 'AUTHENTICATES USER CREDENTIALS AND ISSUES HTTPONLY SESSION ACCESS COOKIES.',
      body: '{\n  "email": "user@eventhub.com",\n  "password": "passphrase"\n}'
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      category: 'Auth',
      summary: 'ACCOUNT REGISTRATION',
      description: 'CREATES A NEW CUSTOMER OR EVENT ORGANIZER PROFILE.',
      body: '{\n  "firstName": "Alex",\n  "lastName": "Kane",\n  "email": "alex@eventhub.com",\n  "role": "CUSTOMER"\n}'
    },
    {
      method: 'GET',
      path: '/api/events',
      category: 'Events',
      summary: 'EVENT CATALOG DISPATCH',
      description: 'RETURNS PAGINATED EVENTS WITH VENUE AND TICKET PRICING SPECIFICATIONS.',
      queryParams: '?category=MUSIC&minPrice=20'
    },
    {
      method: 'POST',
      path: '/api/bookings',
      category: 'Bookings',
      summary: 'RESERVE TICKETS & LOCK SEATS',
      description: 'LOCKS SEATS FOR 10 MINUTES VIA STOMP CONCURRENCY WITH CRYPTOGRAPHIC WATERMARK.',
      body: '{\n  "eventId": 1,\n  "seatIds": [1, 2],\n  "couponCode": "EARLYBIRD"\n}'
    },
    {
      method: 'GET',
      path: '/api/checkin/validate/{code}',
      category: 'Gate Entry',
      summary: 'GATE QR TICKET VERIFICATION',
      description: 'VERIFIES OPTICAL QR BARCODE SIGNATURE AT VENUE ADMISSION GATE.'
    }
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const categories = ['All', 'Auth', 'Events', 'Bookings', 'Gate Entry'];
  const filteredEndpoints = activeCategory === 'All' 
    ? endpoints 
    : endpoints.filter(e => e.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-4 font-mono-zine" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-asphalt-surface border-4 border-grit-white text-grit-white shadow-[10px_10px_0px_#eefc54] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-4 -right-2 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB://REST_API
        </div>

        {/* Header */}
        <div className="p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                API_PROTOCOL
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                SPRING BOOT 3.4 // JSON SPEC
              </span>
            </div>
            <h3 className="font-display text-3xl uppercase tracking-tight text-grit-white leading-none">
              REST & WEBSOCKET STOMP API
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              API SPECIFICATION FOR FRONTEND CLIENTS, GATE SCANNERS & ORGANIZERS
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-1.5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="bg-asphalt-black border-b border-asphalt-border px-5 py-2.5 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-impact tracking-wider uppercase border transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold shadow-[2px_2px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filteredEndpoints.map((ep, idx) => (
            <div key={ep.path} className="bg-asphalt-card border-2 border-asphalt-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-impact text-xs px-2 py-0.5 uppercase border ${
                    ep.method === 'POST' ? 'bg-neon-magenta text-grit-white border-asphalt-black' : 'bg-acid-yellow text-asphalt-black border-asphalt-black'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-ticker text-xs text-grit-white font-bold">{ep.path}</span>
                </div>
                <button
                  onClick={() => handleCopy(ep.path, idx)}
                  className="text-grit-dim hover:text-acid-yellow p-1 cursor-pointer"
                  title="Copy path"
                >
                  {copiedIndex === idx ? <Check size={14} className="text-acid-yellow" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="font-impact text-xs uppercase text-grit-white tracking-wider">
                {ep.summary}
              </div>
              <p className="text-[11px] text-grit-dim uppercase">
                {ep.description}
              </p>

              {ep.body && (
                <div className="bg-asphalt-black border border-asphalt-border p-2.5 mt-2">
                  <span className="text-[9px] font-ticker text-grit-dim uppercase block mb-1">SAMPLE JSON PAYLOAD:</span>
                  <pre className="text-[10px] font-ticker text-acid-yellow overflow-x-auto">{ep.body}</pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex items-center justify-between">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            BASE_URI: HTTP://LOCALHOST:8080/API
          </span>
          <button 
            onClick={onClose} 
            className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-sm uppercase px-6 py-2 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[2px_2px_0px_#ffffff] cursor-pointer"
          >
            CLOSE PROTOCOL SPEC
          </button>
        </div>
      </div>
    </div>
  );
}
