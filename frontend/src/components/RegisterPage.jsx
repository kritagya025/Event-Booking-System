import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function RegisterPage({ onNavigate, showToast }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('ACCOUNT CREATED SUCCESSFULLY! CHECK YOUR EMAIL TO VERIFY.', 'success');
      onNavigate('login');
    } catch (err) {
      showToast(err.message || 'REGISTRATION FAILED: PLEASE CHECK YOUR INPUTS', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-asphalt-black text-grit-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Top Hazard Warning Tape */}
      <div className="fixed top-0 left-0 w-full hazard-tape h-4 z-50"></div>

      {/* Background Graphic Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center select-none overflow-hidden">
        <span className="font-display text-[22vw] leading-none tracking-tighter text-grit-white font-black">EVENTHUB</span>
      </div>

      <button 
        onClick={() => onNavigate('home')} 
        className="absolute top-8 left-6 z-20 flex items-center gap-2 bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-acid-yellow hover:text-asphalt-black px-4 py-2 font-mono-zine text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#0e0e11] transition-all cursor-pointer"
      >
        <span className="text-acid-yellow hover:text-asphalt-black font-bold">←</span> RETURN TO EVENTS
      </button>

      <div className="w-full max-w-lg relative z-10 my-12">
        {/* Slanted Tape Badges */}
        <div className="absolute -top-4 -right-3 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-20">
          USER ONBOARDING // REAL-TIME PASSES
        </div>

        <div className="bg-asphalt-surface border-4 border-grit-white p-6 md:p-8 shadow-[8px_8px_0px_#ff1f6d] relative">
          
          {/* Header */}
          <div className="border-b-2 border-asphalt-border pb-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                REGISTER_PORTAL
              </span>
              <span className="text-[10px] font-ticker text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-neon-magenta animate-pulse"></span>
                SLOT STATUS: AVAILABLE
              </span>
            </div>
            <h1 className="font-display text-4xl uppercase tracking-tight text-grit-white leading-none mt-2">
              CREATE AN ACCOUNT
            </h1>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
              REGISTER TO RESERVE SEATS, SECURE VERIFIED QR CODE PASSES, AND TRACK LIVE EVENTS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                  FIRST NAME <span className="text-neon-magenta">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                  LAST NAME <span className="text-neon-magenta">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                EMAIL ADDRESS <span className="text-neon-magenta">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                PASSWORD <span className="text-neon-magenta">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                  ACCOUNT TYPE <span className="text-neon-magenta">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none transition-colors uppercase"
                >
                  <option value="CUSTOMER">ATTENDEE / CUSTOMER</option>
                  <option value="ORGANIZER">EVENT ORGANIZER</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-neon-magenta text-grit-white font-impact tracking-wider text-xl uppercase py-3 border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black transition-all shadow-[4px_4px_0px_#eefc54] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">CREATING ACCOUNT...</span>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Switch */}
          <div className="mt-6 pt-4 border-t border-asphalt-border text-center font-mono-zine text-xs text-grit-dim uppercase tracking-wider">
            ALREADY HAVE AN ACCOUNT?{' '}
            <button 
              onClick={() => onNavigate('login')} 
              className="text-acid-yellow hover:text-grit-white font-bold underline ml-1 cursor-pointer"
            >
              SIGN IN HERE
            </button>
          </div>

          {/* Barcode Watermark Footer */}
          <div className="mt-6 pt-3 flex justify-between items-center opacity-40 select-none">
            <span className="font-ticker text-[9px] text-grit-dim uppercase">SEC_REGISTER // EVENTHUB</span>
            <svg className="h-6 w-36" viewBox="0 0 144 24" fill="currentColor">
              <rect x="0" y="0" width="4" height="24"/>
              <rect x="6" y="0" width="2" height="24"/>
              <rect x="10" y="0" width="5" height="24"/>
              <rect x="18" y="0" width="2" height="24"/>
              <rect x="22" y="0" width="3" height="24"/>
              <rect x="28" y="0" width="6" height="24"/>
              <rect x="36" y="0" width="2" height="24"/>
              <rect x="42" y="0" width="4" height="24"/>
              <rect x="50" y="0" width="1" height="24"/>
              <rect x="55" y="0" width="5" height="24"/>
              <rect x="63" y="0" width="3" height="24"/>
              <rect x="70" y="0" width="2" height="24"/>
              <rect x="75" y="0" width="6" height="24"/>
              <rect x="85" y="0" width="2" height="24"/>
              <rect x="90" y="0" width="4" height="24"/>
              <rect x="98" y="0" width="3" height="24"/>
              <rect x="104" y="0" width="5" height="24"/>
              <rect x="112" y="0" width="1" height="24"/>
              <rect x="116" y="0" width="6" height="24"/>
              <rect x="125" y="0" width="2" height="24"/>
              <rect x="130" y="0" width="4" height="24"/>
              <rect x="138" y="0" width="3" height="24"/>
            </svg>
          </div>

        </div>
      </div>

      {/* Bottom Hazard Warning Tape */}
      <div className="fixed bottom-0 left-0 w-full hazard-tape h-3 z-50"></div>
    </div>
  );
}
