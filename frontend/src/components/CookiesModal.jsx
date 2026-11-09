import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CookiesModal({ isOpen, onClose, showToast }) {
  const [preferences, setPreferences] = useState({
    essential: true, // Always required for HttpOnly auth
    analytics: true,
    functional: true
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (showToast) showToast('COOKIE PREFERENCES COMMITTED TO LOCAL MEMORY', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-mono-zine touch-scroll safe-pb select-none" onClick={onClose}>
      <div 
        className="w-full max-w-xl max-h-[85vh] bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[4px_4px_0px_#E2F13C] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-neon-magenta text-grit-white font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB://COOKIE_PREFERENCES
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                STORAGE_PREFERENCES
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                LOCAL SESSION STORE
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-grit-white leading-none">
              COOKIE & STORAGE SETTINGS
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              SPECIFY STORAGE CONFIGURATION FOR THIS BROWSER
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-2 min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
            aria-label="Close cookies modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 touch-scroll">
          <div className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-impact text-sm sm:text-base text-grit-white tracking-wider">ESSENTIAL AUTHENTICATION</span>
                <span className="bg-acid-yellow text-asphalt-black font-impact text-[10px] px-1.5 py-0.2">MANDATORY</span>
              </div>
              <p className="text-[11px] text-grit-dim uppercase mt-1">
                REQUIRED FOR HTTPONLY JWT TOKENS AND STOMP PROTOCOL CONNECTION SEALS.
              </p>
            </div>
            <input type="checkbox" checked disabled className="w-5 h-5 accent-acid-yellow shrink-0" />
          </div>

          <div className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div>
              <span className="font-impact text-sm sm:text-base text-grit-white tracking-wider block">LOCAL PASS CACHING</span>
              <p className="text-[11px] text-grit-dim uppercase mt-1">
                PRESERVES RECENT TICKET PASSES IN LOCALSTORAGE FOR FAST OFFLINE ACCESS.
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.functional} 
              onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
              className="w-5 h-5 accent-acid-yellow cursor-pointer shrink-0" 
            />
          </div>

          <div className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div>
              <span className="font-impact text-sm sm:text-base text-grit-white tracking-wider block">TELEMETRY DIAGNOSTICS</span>
              <p className="text-[11px] text-grit-dim uppercase mt-1">
                MEASURES REST API ROUND-TRIP LATENCY AND REAL-TIME SEAT LOCK CONCURRENCY.
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.analytics} 
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="w-5 h-5 accent-acid-yellow cursor-pointer shrink-0" 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            POLICY COMPLIANCE: ZERO AD TELEMETRY
          </span>
          <button 
            onClick={handleSave} 
            className="w-full sm:w-auto bg-acid-yellow text-asphalt-black font-impact tracking-wider text-sm uppercase px-6 py-2 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[2px_2px_0px_#ffffff] cursor-pointer touch-manipulation text-center"
          >
            COMMIT PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
}
