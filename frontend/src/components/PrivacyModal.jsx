import React from 'react';
import { X } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 touch-scroll safe-pb select-none" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[4px_4px_0px_#F43F5E] flex flex-col font-mono-zine relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB://PRIVACY_POLICY
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                PRIVACY_POLICY
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                ENCRYPTED DATA PROTECTION
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-grit-white leading-none">
              DATA PRIVACY & PROTECTION POLICY
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              HOW WE PROTECT ATTENDEE IDENTITIES, PAYMENT INFORMATION & DIGITAL TICKETS
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-2 min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
            aria-label="Close privacy modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-grit-dim uppercase leading-relaxed font-mono-zine touch-scroll">
          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-neon-magenta tracking-wider mb-1">
              01. ZERO THIRD-PARTY TRACKERS OR AD NETWORKS
            </h4>
            <p>
              EVENTHUB ENFORCES STRICT ZERO THIRD-PARTY AD TRACKING. ALL DATA EXCHANGES OPERATE OVER ENCRYPTED TLS 1.3 CONNECTIONS DIRECTLY TO SECURE VAULT SERVERS.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-neon-magenta tracking-wider mb-1">
              02. SECURE TICKET CRYPTOGRAPHY
            </h4>
            <p>
              ALL ADMISSION PASSES ARE GENERATED WITH CRYPTOGRAPHIC DIGITAL SIGNATURES. PASS DATA AND QR CODES ARE STORED SECURELY IN ENCRYPTED DATABASE VAULTS AND CAN ONLY BE VALIDATED AT AUTHORIZED EVENT ENTRANCES.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-neon-magenta tracking-wider mb-1">
              03. RIGHT TO DATA PURGE & ACCESS
            </h4>
            <p>
              ANY REGISTERED USER MAY EXERCISE THEIR RIGHT TO DATA PRIVACY UNDER GDPR AND CCPA TO REVIEW, EXPORT, OR REQUEST COMPLETE DELETION OF THEIR ACCOUNT PROFILE AND BOOKING HISTORY.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            PRIVACY STATUS: GDPR & CCPA COMPLIANT
          </span>
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto bg-neon-magenta text-grit-white font-impact tracking-wider text-sm uppercase px-6 py-2.5 border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black transition-all shadow-[4px_4px_0px_#eefc54] cursor-pointer touch-manipulation text-center"
          >
            ACCEPT PRIVACY POLICY
          </button>
        </div>
      </div>
    </div>
  );
}
