import React, { useState } from 'react';
import { X, Cookie, ShieldCheck } from 'lucide-react';

export default function CookiesModal({ isOpen, onClose, showToast }) {
  const [preferences, setPreferences] = useState({
    essential: true, // Always required for HttpOnly auth
    analytics: true,
    functional: true
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (showToast) showToast('Cookie preferences saved successfully', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white rounded-[28px] border border-[#e5e7eb] text-[#111111] shadow-2xl flex flex-col relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#111111] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Privacy Settings
              </span>
              <span className="text-xs text-[#6b7280] font-medium">
                Browser Storage
              </span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Cookie & Storage Settings
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Choose your cookie and local storage preferences on eventhub.
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

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Essential Cookies */}
          <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#e5e7eb]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0000ee]" />
                <span className="text-sm font-bold text-[#111111]">Strictly Essential Cookies</span>
              </div>
              <span className="text-xs font-semibold text-[#0000ee] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Required
              </span>
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Mandatory for authenticating sessions, keeping your 10-minute seat lock active, and preventing fraud.
            </p>
          </div>

          {/* Functional Cookies */}
          <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#e5e7eb]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Cookie size={18} className="text-[#111111]" />
                <span className="text-sm font-bold text-[#111111]">Functional Preferences</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="w-5 h-5 accent-[#0000ee] rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Remembers your selected currency, audio preview settings, and theater seating filters.
            </p>
          </div>

          {/* Analytics Cookies */}
          <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#e5e7eb]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Cookie size={18} className="text-[#111111]" />
                <span className="text-sm font-bold text-[#111111]">Analytics & Performance</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-5 h-5 accent-[#0000ee] rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Helps us measure ticket demand latency, WebSocket connection speed, and peak event volume.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#e5e7eb] bg-white flex items-center justify-between gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="h-[44px] px-5 rounded-full border border-[#e5e7eb] hover:bg-[#f7f7f7] text-xs font-semibold text-[#111111] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-[44px] px-7 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
