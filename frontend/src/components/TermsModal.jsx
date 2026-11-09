import React from 'react';
import { X } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 touch-scroll safe-pb select-none" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[4px_4px_0px_#E2F13C] flex flex-col font-mono-zine relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-neon-magenta text-grit-white font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB://TERMS_OF_SERVICE
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                TERMS_OF_SERVICE
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                DOC REV 2026.09
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-grit-white leading-none">
              TERMS OF SERVICE & ATTENDANCE POLICY
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              LEGAL TERMS & CONDITIONS FOR EVENT TICKET HOLDERS AND ORGANIZERS
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-2 min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
            aria-label="Close terms modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs text-grit-dim uppercase leading-relaxed font-mono-zine touch-scroll">
          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              01. VERIFIED TICKETING & DIGITAL ADMISSION
            </h4>
            <p>
              ALL TICKETS ISSUED THROUGH EVENTHUB ARE DIGITALLY WATERMARKED AND CRYPTOGRAPHICALLY VALIDATED. ATTENDEES MUST PRESENT THEIR UNIQUE QR CODE AT GATE ENTRY. PASSES CANNOT BE TRANSFERRED THROUGH UNAUTHORIZED THIRD-PARTY RESALE EXCHANGES.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              02. REAL-TIME SEAT HOLD & RESERVATION POLICY
            </h4>
            <p>
              SEAT SELECTIONS ARE TEMPORARILY LOCKED FOR 10 MINUTES VIA DISTRIBUTED WEBSOCKET PROTOCOL. IF CHECKOUT IS NOT COMPLETED WITHIN THE 10-MINUTE HOLD WINDOW, LOCKED SEATS ARE AUTOMATICALLY RELEASED BACK TO PUBLIC INVENTORY.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              03. ZERO TOLERANCE SCALPING & BOT PROHIBITION
            </h4>
            <p>
              AUTOMATED BOT RESERVATIONS, SCRAPING, AND FRAUDULENT TICKET CORNERING ARE STRICTLY FORBIDDEN. EVENTHUB ENFORCES REAL-TIME CONCURRENCY LOCKS TO ENSURE FAIR, DIRECT ACCESS AT FACE VALUE.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-3.5 sm:p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              04. CANCELLATION, REFUNDS & VENUE ADMISSION RULES
            </h4>
            <p>
              REFUND AND CANCELLATION POLICIES ARE GOVERNED BY THE DESIGNATED EVENT ORGANIZER AND JURISDICTION REGULATIONS. ATTENDEES MUST ADHERE TO ALL VENUE SECURITY PROTOCOLS, SAFETY STANDARDS, AND CODES OF CONDUCT.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            LEGAL STATUS: RATIFIED BY EVENTHUB PLATFORM
          </span>
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto bg-acid-yellow text-asphalt-black font-impact tracking-wider text-sm uppercase px-6 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] cursor-pointer touch-manipulation text-center"
          >
            I ACCEPT TERMS OF SERVICE
          </button>
        </div>
      </div>
    </div>
  );
}
