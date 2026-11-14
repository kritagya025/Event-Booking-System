import React from 'react';
import { X, Shield } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-[28px] border border-[#e5e7eb] text-[#111111] shadow-2xl flex flex-col relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#111111] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Security & Data
              </span>
              <span className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
                <Shield size={13} className="text-[#0000ee]" />
                GDPR & CCPA Compliant
              </span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Privacy & Data Policy
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              How we protect attendee identities, payment data, and digital ticket credentials.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-[#f7f7f7] hover:bg-[#ebebeb] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#6b7280] leading-relaxed">
          <section className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-5">
            <h4 className="font-bold text-base text-[#111111] mb-1.5">
              01. Zero Third-Party Advertising Trackers
            </h4>
            <p>
              eventhub enforces strict zero third-party ad tracking. All transactions and reservations operate over encrypted TLS 1.3 connections directly with our security cluster.
            </p>
          </section>

          <section className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-5">
            <h4 className="font-bold text-base text-[#111111] mb-1.5">
              02. Cryptographic Ticket Validation
            </h4>
            <p>
              Each admission QR token is dynamically generated and cryptographically signed. Offline turnstiles verify public signatures without transmitting your private identity across public networks.
            </p>
          </section>

          <section className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-5">
            <h4 className="font-bold text-base text-[#111111] mb-1.5">
              03. Data Retention & Right to Erasure
            </h4>
            <p>
              Attendee profile details are retained only while your account remains active. You may request immediate erasure of your credentials and transaction logs at any time.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#e5e7eb] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] px-8 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
