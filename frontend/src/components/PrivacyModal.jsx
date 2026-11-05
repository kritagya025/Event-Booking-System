import React from 'react';
import { X, Shield, Lock, Eye, Server, RefreshCw } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-asphalt-surface border-4 border-grit-white text-grit-white shadow-[10px_10px_0px_#ff1f6d] flex flex-col font-mono-zine relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-4 -right-2 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-10">
          VAULT://CIPHER_PRIVACY
        </div>

        {/* Header */}
        <div className="p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                PRIVACY_MANIFEST
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                ZERO TELEMETRY LEAKAGE
              </span>
            </div>
            <h3 className="font-display text-3xl uppercase tracking-tight text-grit-white leading-none">
              CRYPTOGRAPHIC PRIVACY POLICY
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              HOW WE SHIELD ATTENDEE IDENTITIES, COMM ADDRESSES & WRISTBAND KEYS
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-1.5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-grit-dim uppercase leading-relaxed font-mono-zine">
          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-neon-magenta tracking-wider mb-1">
              01. ZERO THIRD-PARTY TRACKERS OR AD NETWORKS
            </h4>
            <p>
              VAULT HOUSES ZERO TRACKING PIXELS, BEACONS, OR CORPORATE AD NETWORKS. SESSIONS OPERATE IN AIR-GAPPED SANDBOXES WITH CRYPTOGRAPHIC TLS COMMUNICATIONS DIRECT TO OUR NORTH DOCKS BACKEND RIG.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-neon-magenta tracking-wider mb-1">
              02. EPHEMERAL COMM ENCRYPTION
            </h4>
            <p>
              LOCATION COORDINATES DISPATCHED VIA EMAIL / SMS AUTO-EXPIRE 24 HOURS FOLLOWING EVENT CONCLUSION. PASS WATERMARKS ARE PERMANENTLY RETIRED AND HASHED IN POSTGRESQL.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-neon-magenta tracking-wider mb-1">
              03. RIGHT TO DATA PURGE
            </h4>
            <p>
              ANY CREW MEMBER MAY REQUEST AN IMMEDIATE, IRREVERSIBLE FLUSH OF THEIR COMM RECORD, WRISTBAND LOGS, AND SYSTEM IDENTIFIERS WITH ZERO AUDIT TRAIL.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex items-center justify-between">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            PRIVACY STATUS: ZERO LOGGING VERIFIED
          </span>
          <button 
            onClick={onClose} 
            className="bg-neon-magenta text-grit-white font-impact tracking-wider text-sm uppercase px-6 py-2.5 border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black transition-all shadow-[4px_4px_0px_#eefc54] cursor-pointer"
          >
            ACCEPT & ENTER
          </button>
        </div>
      </div>
    </div>
  );
}
