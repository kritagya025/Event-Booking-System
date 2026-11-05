import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-asphalt-surface border-4 border-grit-white text-grit-white shadow-[10px_10px_0px_#eefc54] flex flex-col font-mono-zine relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-4 -right-2 bg-neon-magenta text-grit-white font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-10">
          VAULT://MANIFESTO_PROTOCOL
        </div>

        {/* Header */}
        <div className="p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                TERMS_OF_ENGAGEMENT
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                DOC REV 2026.09
              </span>
            </div>
            <h3 className="font-display text-3xl uppercase tracking-tight text-grit-white leading-none">
              WAREHOUSE RULES OF ENGAGEMENT
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              PROTOCOL REQUIREMENTS FOR ATTENDEES, RAVERS & SOUND SYSTEM OPERATORS
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-grit-dim uppercase leading-relaxed font-mono-zine">
          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              01. NO CAMERAS / NO FLASH RECORDING
            </h4>
            <p>
              VAULT OPERATES STRICT ANALOG DANCEFLOOR SANCTUARY PROTOCOLS. OPTICAL SENSORS, FLASH RECORDINGS, AND PHONE LIVESTREAMS ARE PROHIBITED BEYOND THE DOCK ENTRANCE. PHONE LENSES MUST BE SEALED AT GATE ADMITTANCE.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              02. 40KW SUBWOOFER PRIORITY & HEARING SAFETY
            </h4>
            <p>
              ACOUSTIC PRESSURE LEVELS MAY PEAK AT 132.8 DB-C. ATTENDEES ASSUME RESPONSIBILITY FOR AUDITORY SAFETY. HIGH-FIDELITY FOAM FILTERS ARE DISTRIBUTED GRATIS AT BOUNCER GATE ENTRY.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              03. WRISTBAND CONCURRENCY & ZERO SECONDARY TICKETING
            </h4>
            <p>
              ALL WRISTBANDS ARE DIGITALLY LOCKED TO STOMP PROTOCOL NODES. SCALPING, BOT RESERVATIONS, AND FORGERY VOID ALL PASS WATERMARKS INSTANTLY WITHOUT TARIFF REFUND.
            </p>
          </section>

          <section className="bg-asphalt-card border border-asphalt-border p-4">
            <h4 className="font-impact text-base text-acid-yellow tracking-wider mb-1">
              04. SECRET GATE COORDINATES CURFEW
            </h4>
            <p>
              VENUE COORDINATES ARE DISPATCHED 02 HOURS PRIOR TO CURFEW VIA ENCRYPTED COMM CHANNELS. ADMITTANCE DOORS SHUT AT MIDNIGHT EXACTLY; LATECOMERS SHALL BE DENIED ENTRY.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex items-center justify-between">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            SEC_STATUS: RATIFIED BY WAREHOUSE CONSORTIUM
          </span>
          <button 
            onClick={onClose} 
            className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-sm uppercase px-6 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] cursor-pointer"
          >
            ACKNOWLEDGE & RATIFY
          </button>
        </div>
      </div>
    </div>
  );
}
