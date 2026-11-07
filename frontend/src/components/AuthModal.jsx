import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Ticket, 
  ShieldCheck, 
  Key,
  Radio
} from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDemoFill = (type) => {
    if (type === 'customer') {
      setFormData((prev) => ({
        ...prev,
        email: 'customer@eventhub.com',
        password: 'Customer@123'
      }));
      showToast('DEMO ATTENDEE CREDENTIALS POPULATED', 'info');
    } else if (type === 'admin') {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@eventhub.com',
        password: 'Admin@123'
      }));
      showToast('DEMO ADMIN CREDENTIALS POPULATED', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const user = response.user || {
          email: formData.email,
          firstName: response.email ? response.email.split('@')[0] : 'User',
          role: response.role || 'CUSTOMER'
        };
        setAuthSession(response.token, response.refreshToken, user);
        showToast('SIGN-IN SUCCESSFUL // ACCESS GRANTED', 'success');
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
      } else if (mode === 'register') {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        const user = response.user || {
          email: formData.email,
          firstName: formData.firstName || 'User',
          role: formData.role || 'CUSTOMER'
        };
        if (response.token) {
          setAuthSession(response.token, response.refreshToken, user);
          showToast('ACCREDITATION APPROVED! WELCOME TO EVENTHUB.', 'success');
          if (onAuthSuccess) onAuthSuccess(user);
          onClose();
        } else {
          showToast('REGISTRATION SUCCESSFUL! PLEASE SIGN IN.', 'success');
          setMode('login');
        }
      } else if (mode === 'forgot') {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        });
        showToast('PASSWORD RESET LINK DISPATCHED TO YOUR EMAIL', 'info');
        setMode('login');
      }
    } catch (err) {
      showToast(err.message || 'AUTHENTICATION FAILED: CHECK CREDENTIALS', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt-black/85 backdrop-blur-md" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-asphalt-surface border-2 border-grit-white shadow-[8px_8px_0px_#E2F13C] relative overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hazard Warning Tape */}
        <div className="hazard-tape h-2.5 w-full"></div>

        {/* Modal Header */}
        <div className="p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card/60">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-[10px] px-1.5 py-0.2 uppercase">
                ACCREDITATION
              </span>
              <span className="font-ticker text-[9px] text-grit-dim uppercase tracking-widest">
                VERIFIED ADMISSION // SECURE CHECKOUT
              </span>
            </div>
            <h3 className="font-display text-3xl uppercase tracking-tight text-grit-white leading-none">
              {mode === 'login' && 'ACCOUNT SIGN-IN'}
              {mode === 'register' && 'ISSUE VIP PASS'}
              {mode === 'forgot' && 'RESET PASSWORD'}
            </h3>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 bg-asphalt-card border border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 border-b-2 border-asphalt-border bg-asphalt-black">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 px-3 font-impact text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-acid-yellow text-asphalt-black'
                : 'text-grit-dim hover:text-grit-white'
            }`}
          >
            <Key size={13} />
            <span>01 // SIGN IN</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 px-3 font-impact text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-neon-magenta text-grit-white'
                : 'text-grit-dim hover:text-grit-white'
            }`}
          >
            <Ticket size={13} />
            <span>02 // REGISTER</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Register: Account Type Mini Selector */}
            {mode === 'register' && (
              <div>
                <label className="block font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider mb-1.5">
                  ACCOUNT TYPE:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'CUSTOMER' }))}
                    className={`py-1.5 px-2 border font-impact text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      formData.role === 'CUSTOMER'
                        ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[2px_2px_0px_#ffffff]'
                        : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-dim'
                    }`}
                  >
                    <Ticket size={13} />
                    <span>ATTENDEE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'ORGANIZER' }))}
                    className={`py-1.5 px-2 border font-impact text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      formData.role === 'ORGANIZER'
                        ? 'bg-neon-magenta text-grit-white border-asphalt-black shadow-[2px_2px_0px_#ffffff]'
                        : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-dim'
                    }`}
                  >
                    <Radio size={13} />
                    <span>ORGANIZER</span>
                  </button>
                </div>
              </div>
            )}

            {/* Register: First & Last Name */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider mb-1">
                    FIRST NAME <span className="text-neon-magenta">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-8 pr-2.5 py-2 text-xs outline-none placeholder:text-grit-dim/40"
                    />
                    <User size={13} className="absolute left-2.5 top-2.5 text-grit-dim" />
                  </div>
                </div>

                <div>
                  <label className="block font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider mb-1">
                    LAST NAME <span className="text-neon-magenta">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-8 pr-2.5 py-2 text-xs outline-none placeholder:text-grit-dim/40"
                    />
                    <User size={13} className="absolute left-2.5 top-2.5 text-grit-dim" />
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider mb-1">
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
                  className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-8 pr-2.5 py-2 text-xs outline-none placeholder:text-grit-dim/40"
                />
                <Mail size={13} className="absolute left-2.5 top-2.5 text-grit-dim" />
              </div>
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider">
                    PASSWORD <span className="text-neon-magenta">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="font-mono-zine text-[10px] text-acid-yellow hover:text-grit-white uppercase underline cursor-pointer"
                    >
                      FORGOT?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-8 pr-8 py-2 text-xs outline-none placeholder:text-grit-dim/40"
                  />
                  <Lock size={13} className="absolute left-2.5 top-2.5 text-grit-dim" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-grit-dim hover:text-grit-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Autofill (Login Mode) */}
            {mode === 'login' && (
              <div className="pt-1">
                <div className="flex items-center justify-between text-[9px] font-ticker text-grit-dim uppercase mb-1">
                  <span>QUICK TEST:</span>
                  <span className="text-acid-yellow font-bold">1-CLICK LOGIN</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoFill('customer')}
                    className="py-1 px-2 bg-asphalt-card border border-asphalt-border hover:border-acid-yellow font-ticker text-[9px] text-grit-dim hover:text-acid-yellow uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Ticket size={11} className="text-acid-yellow" />
                    DEMO ATTENDEE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('admin')}
                    className="py-1 px-2 bg-asphalt-card border border-asphalt-border hover:border-neon-magenta font-ticker text-[9px] text-grit-dim hover:text-neon-magenta uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck size={11} className="text-neon-magenta" />
                    DEMO ADMIN
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 font-impact tracking-wider text-base uppercase py-3 border-2 border-asphalt-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5 ${
                mode === 'register'
                  ? 'bg-neon-magenta text-grit-white hover:bg-acid-yellow hover:text-asphalt-black shadow-[3px_3px_0px_#E2F13C]'
                  : 'bg-acid-yellow text-asphalt-black hover:bg-neon-magenta hover:text-grit-white shadow-[3px_3px_0px_#ffffff]'
              }`}
            >
              {loading ? (
                <span className="animate-pulse text-xs tracking-widest">AUTHENTICATING...</span>
              ) : mode === 'forgot' ? (
                <>
                  <span>SEND RESET LINK</span>
                  <ArrowRight size={14} />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>CLAIM PASS & SIGN IN</span>
                  <ArrowRight size={14} />
                </>
              ) : (
                <>
                  <span>SIGN IN TO EVENTHUB</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-4 pt-3 border-t border-asphalt-border text-center font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider">
            {mode === 'forgot' ? (
              <button 
                type="button"
                onClick={() => setMode('login')} 
                className="text-acid-yellow hover:text-grit-white font-bold underline cursor-pointer"
              >
                ← BACK TO SIGN IN
              </button>
            ) : mode === 'login' ? (
              <div>
                NO ACCOUNT?{' '}
                <button 
                  type="button"
                  onClick={() => setMode('register')} 
                  className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
              </div>
            ) : (
              <div>
                HAVE AN ACCOUNT?{' '}
                <button 
                  type="button"
                  onClick={() => setMode('login')} 
                  className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer"
                >
                  SIGN IN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
