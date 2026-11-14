import React from 'react';
import { X, FileText } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
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
                Legal
              </span>
              <span className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
                <FileText size={13} className="text-[#0000ee]" />
                Terms of Service · Rev 2026
              </span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Terms of Service
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Guidelines and policies governing event passes, host publishing, and venue attendance.
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
              01. Verified Admission & Digital Passes
            </h4>
            <p>
              All passes issued through eventhub are digitally validated. Attendees must present their unique optical QR token at venue gate entry. Passes cannot be resold via predatory third-party secondary scalpers.
            </p>
          </section>

          <section className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-5">
            <h4 className="font-bold text-base text-[#111111] mb-1.5">
              02. 10-Minute Cart Lock & Fair Access
            </h4>
            <p>
              When an attendee selects seats, those seats are locked for exactly 10 minutes to prevent race conditions. If checkout is not completed within 10 minutes, seats return to live inventory automatically.
            </p>
          </section>

          <section className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-5">
            <h4 className="font-bold text-base text-[#111111] mb-1.5">
              03. Cancellations & Venue Protocol
            </h4>
            <p>
              Organizers reserve the right to establish individual event refund terms. In the event of a promoter cancellation, ticket amounts are automatically refunded to the original payment method.
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
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
