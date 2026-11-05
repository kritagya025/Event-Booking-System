import React, { useState } from 'react';
import { ArrowRight, KeyRound, ShieldAlert, Radio } from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';

export default function LoginPage({ onAuthSuccess, onNavigate, showToast }) {
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (forgotMode) {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        });
        showToast('PASSWORD RESET LINK DISPATCHED TO YOUR EMAIL', 'info');
        setForgotMode(false);
      } else {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const user = response.user || { email: formData.email, firstName: 'User', role: 'CUSTOMER' };
        setAuthSession(response.token, response.refreshToken, user);
        showToast('SIGN-IN SUCCESSFUL // ACCESS GRANTED', 'success');
        onAuthSuccess(user);
      }
    } catch (err) {
      showToast(err.message || 'AUTHENTICATION FAILED: INVALID CREDENTIALS', 'error');
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

      <div className="w-full max-w-md relative z-10 my-12">
        {/* Slanted Tape Badges */}
        <div className="absolute -top-4 -right-3 bg-neon-magenta text-grit-white font-impact tracking-wider px-3 py-1 rotate-3 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-20">
          SECURE TICKETING ACCESS
        </div>

        <div className="bg-asphalt-surface border-4 border-grit-white p-6 md:p-8 shadow-[8px_8px_0px_#eefc54] relative">
          
          {/* Brand Header */}
          <div className="border-b-2 border-asphalt-border pb-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                EVENTHUB_AUTH
              </span>
              <span className="text-[10px] font-ticker text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-acid-yellow animate-pulse"></span>
                PORT 8080 // SECURE TLS
              </span>
            </div>
            <h1 className="font-display text-4xl uppercase tracking-tight text-grit-white leading-none mt-2">
              {forgotMode ? 'RESET PASSWORD' : 'ACCOUNT SIGN-IN'}
            </h1>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
              {forgotMode
                ? 'ENTER YOUR REGISTERED EMAIL TO RECEIVE A SECURE RESET LINK'
                : 'SIGN IN TO ACCESS YOUR BOOKINGS, DIGITAL PASSES & SAVED EVENTS'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                EMAIL ADDRESS <span className="text-neon-magenta">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                />
              </div>
            </div>

            {!forgotMode && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider">
                    PASSWORD <span className="text-neon-magenta">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="font-mono-zine text-[11px] text-grit-dim hover:text-acid-yellow uppercase tracking-wider underline cursor-pointer"
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xl uppercase py-3 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">VERIFYING CREDENTIALS...</span>
              ) : forgotMode ? (
                <span>SEND RESET LINK</span>
              ) : (
                <>
                  <span>SIGN IN TO ACCOUNT</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Switch Links */}
          <div className="mt-6 pt-4 border-t border-asphalt-border text-center font-mono-zine text-xs text-grit-dim uppercase tracking-wider">
            {forgotMode ? (
              <button 
                onClick={() => setForgotMode(false)} 
                className="text-acid-yellow hover:text-grit-white font-bold underline cursor-pointer"
              >
                ← BACK TO SIGN IN
              </button>
            ) : (
              <div>
                DON'T HAVE AN ACCOUNT?{' '}
                <button 
                  onClick={() => onNavigate('register')} 
                  className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer"
                >
                  CREATE AN ACCOUNT
                </button>
              </div>
            )}
          </div>

          {/* Barcode Watermark Footer */}
          <div className="mt-6 pt-3 flex justify-between items-center opacity-40 select-none">
            <span className="font-ticker text-[9px] text-grit-dim uppercase">SYS_AUTH // EVENTHUB_PLATFORM</span>
            <svg className="h-6 w-36" viewBox="0 0 144 24" fill="currentColor">
              <rect x="0" y="0" width="3" height="24"/>
              <rect x="5" y="0" width="1" height="24"/>
              <rect x="8" y="0" width="4" height="24"/>
              <rect x="15" y="0" width="2" height="24"/>
              <rect x="19" y="0" width="5" height="24"/>
              <rect x="27" y="0" width="1" height="24"/>
              <rect x="30" y="0" width="3" height="24"/>
              <rect x="36" y="0" width="2" height="24"/>
              <rect x="41" y="0" width="6" height="24"/>
              <rect x="50" y="0" width="1" height="24"/>
              <rect x="53" y="0" width="4" height="24"/>
              <rect x="60" y="0" width="2" height="24"/>
              <rect x="65" y="0" width="3" height="24"/>
              <rect x="71" y="0" width="5" height="24"/>
              <rect x="78" y="0" width="2" height="24"/>
              <rect x="83" y="0" width="4" height="24"/>
              <rect x="90" y="0" width="1" height="24"/>
              <rect x="94" y="0" width="3" height="24"/>
              <rect x="100" y="0" width="2" height="24"/>
              <rect x="105" y="0" width="6" height="24"/>
              <rect x="114" y="0" width="2" height="24"/>
              <rect x="119" y="0" width="4" height="24"/>
              <rect x="126" y="0" width="1" height="24"/>
              <rect x="130" y="0" width="5" height="24"/>
              <rect x="138" y="0" width="2" height="24"/>
              <rect x="142" y="0" width="2" height="24"/>
            </svg>
          </div>

        </div>
      </div>

      {/* Bottom Hazard Warning Tape */}
      <div className="fixed bottom-0 left-0 w-full hazard-tape h-3 z-50"></div>
    </div>
  );
}
