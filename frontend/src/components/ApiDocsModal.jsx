import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, Ticket, RotateCcw, QrCode, Code } from 'lucide-react';

export default function ApiDocsModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const faqs = [
    {
      category: 'Ticket Passes',
      icon: Ticket,
      title: 'HOW DO I RECEIVE & ACCESS MY TICKETS?',
      answer: 'Upon completing your reservation, your admission pass is generated immediately with a verified cryptographic QR code. You can view, save to your wallet, or download a printable PDF invoice stub anytime from your "MY PASSES" dashboard.'
    },
    {
      category: 'Seat Holds',
      icon: ShieldCheck,
      title: 'WHAT IS THE 10-MINUTE SEAT HOLD GUARANTEE?',
      answer: 'When you select seats on an arena, concert amphitheater, or cinema layout, those seats are instantly held exclusively for you for 10 minutes. During this window, no other customer can book those seats, guaranteeing zero double-bookings.'
    },
    {
      category: 'Gate Admission',
      icon: QrCode,
      title: 'HOW DOES GATE ADMISSION & QR CHECK-IN WORK?',
      answer: 'Simply present your QR code ticket on your mobile phone screen or a printed ticket stub at the venue entrance. Venue door staff scan the code using the EventHub Gate Scanner for sub-second admission.'
    },
    {
      category: 'Refunds & Help',
      icon: RotateCcw,
      title: 'WHAT IS THE CANCELLATION & REFUND POLICY?',
      answer: 'If an event is rescheduled or cancelled by the promoter, 100% full refunds are automatically credited back to your original payment method. Self-service ticket cancellations are available from your profile before the event deadline.'
    },
    {
      category: 'API & Developers',
      icon: Code,
      title: 'DEVELOPER & BOX OFFICE API INTEGRATION',
      answer: 'EventHub provides standardized RESTful JSON endpoints for third-party ticket validation, external box office feeds, and promoter analytics. Accessible via /api/events, /api/bookings, /api/tickets, and /api/checkin.'
    }
  ];

  const categories = ['All', 'Ticket Passes', 'Seat Holds', 'Gate Admission', 'Refunds & Help', 'API & Developers'];
  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-mono-zine safe-pb touch-scroll select-none" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[6px_6px_0px_#E2F13C] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB://HELP_CENTER
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                SUPPORT_DESK
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
                OFFICIAL BOX OFFICE KNOWLEDGE BASE
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-grit-white leading-none">
              HELP CENTER & TICKET POLICIES
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              TICKETING GUIDES, SEAT HOLD GUARANTEES, ADMISSION RULES & FAQS
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-1.5 transition-colors cursor-pointer touch-manipulation"
            aria-label="Close help modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="bg-asphalt-black border-b border-asphalt-border px-3 sm:px-4 py-2 sm:py-2.5 flex gap-2 overflow-x-auto touch-scroll scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-impact tracking-wider uppercase border transition-all cursor-pointer whitespace-nowrap ${
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
          {filteredFaqs.map((faq) => {
            const Icon = faq.icon || HelpCircle;
            return (
              <div key={faq.title} className="bg-asphalt-card border-2 border-asphalt-border p-4 space-y-2">
                <div className="flex items-center gap-2 text-acid-yellow font-impact text-sm tracking-wider uppercase">
                  <Icon size={16} className="text-neon-magenta flex-shrink-0" />
                  <span>{faq.title}</span>
                </div>
                <p className="text-xs text-grit-white/90 uppercase leading-relaxed font-mono-zine pl-6">
                  {faq.answer}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-asphalt-card border-t-2 border-asphalt-border flex items-center justify-between">
          <span className="font-ticker text-[10px] text-grit-dim uppercase">
            24/7 CUSTOMER CONCIERGE: SUPPORT@EVENTHUB.COM
          </span>
          <button 
            type="button"
            onClick={onClose} 
            className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-sm uppercase px-6 py-2 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[2px_2px_0px_#ffffff] cursor-pointer"
          >
            CLOSE HELP CENTER
          </button>
        </div>
      </div>
    </div>
  );
}
