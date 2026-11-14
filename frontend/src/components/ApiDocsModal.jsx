import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, Ticket, RotateCcw, QrCode, Code } from 'lucide-react';

export default function ApiDocsModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const faqs = [
    {
      category: 'Ticket Passes',
      icon: Ticket,
      title: 'How do I access and download my passes?',
      answer: 'Upon completing your booking, your digital pass is created immediately with a verified QR code. You can view, save to your device, or print an admission pass anytime from your "My Wallet" dashboard.'
    },
    {
      category: 'Seat Holds',
      icon: ShieldCheck,
      title: 'What is the 10-minute temporary seat hold?',
      answer: 'When you select seats on a venue or cinema layout, those seats are locked exclusively for you for 10 minutes. During this window, no other guest can select those seats, preventing double-bookings.'
    },
    {
      category: 'Gate Admission',
      icon: QrCode,
      title: 'How does optical gate admission work?',
      answer: 'Simply present your QR code pass on your phone screen or printed ticket at the venue door. Gate staff scan the pass using the eventhub gate scanner for instant check-in.'
    },
    {
      category: 'Refunds & Help',
      icon: RotateCcw,
      title: 'What is the cancellation and refund policy?',
      answer: 'If an event is rescheduled or cancelled by the host, 100% full refunds are automatically credited back to your original payment method. Self-service cancellations are accessible from your dashboard.'
    },
    {
      category: 'API & Developers',
      icon: Code,
      title: 'Developer REST API documentation',
      answer: 'eventhub provides RESTful JSON endpoints for third-party ticket validation, external box office feeds, and promoter analytics via /api/events, /api/bookings, /api/tickets, and /api/checkin.'
    }
  ];

  const categories = ['All', 'Ticket Passes', 'Seat Holds', 'Gate Admission', 'Refunds & Help', 'API & Developers'];
  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

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
                Help & Docs
              </span>
              <span className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
                <HelpCircle size={13} className="text-[#0000ee]" />
                Knowledge Base & API Reference
              </span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Help Center & API Docs
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Frequently asked questions, ticketing protocols, and developer API reference.
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

        {/* Category Filter Capsule Pills */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#f7f7f7] text-[#6b7280] hover:text-[#111111] border border-[#e5e7eb]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Body FAQs List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredFaqs.map((faq, idx) => {
            const IconComp = faq.icon;
            return (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-[#f7f7f7] border border-[#e5e7eb] space-y-2 transition-all hover:border-[#0000ee]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0000ee] border border-[#e5e7eb] shadow-sm shrink-0">
                      <IconComp size={16} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-[#6b7280]">
                      {faq.category}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-base text-[#111111] leading-snug">
                  {faq.title}
                </h4>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#e5e7eb] bg-white flex items-center justify-between">
          <span className="text-xs text-[#6b7280]">
            Need developer credentials? Email developers@eventhub.com
          </span>
          <button 
            onClick={onClose} 
            className="h-[44px] px-8 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
