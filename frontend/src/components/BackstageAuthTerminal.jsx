import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Ticket, 
  Radio, 
  CheckCircle2, 
  Key,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';
import { BalloonSticker, DiscoBallSticker, SparklesSticker, TicketSticker } from './CustomStickers';

export default function BackstageAuthTerminal({ 
  initialMode = 'login', 
  onAuthSuccess, 
  onNavigate, 
  showToast 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER' // 'CUSTOMER' | 'ORGANIZER'
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Password strength calculation
  const passwordStats = useMemo(() => {
    const pwd = formData.password || '';
    if (!pwd) return { score: 0, label: 'Password required', color: 'text-toy-black/50', pct: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Weak', color: 'text-bubble-pink', pct: 33, barColor: 'bg-bubble-pink' };
    }
    if (score <= 4) {
      return { score: 2, label: 'Good', color: 'text-sun-yellow', pct: 66, barColor: 'bg-sun-yellow' };
    }
    return { score: 3, label: 'Super Strong', color: 'text-mint-pop', pct: 100, barColor: 'bg-mint-pop' };
  }, [formData.password]);

  // Dynamic ticket serial code
  const ticketSerial = useMemo(() => {
    const fn = (formData.firstName || 'HUB').slice(0, 3).toUpperCase();
    const ln = (formData.lastName || 'PASS').slice(0, 3).toUpperCase();
    return `EVENTHUB-${fn}${ln}-2026`;
  }, [formData.firstName, formData.lastName]);

  // Attendee initials for the pass
  const attendeeInitials = useMemo(() => {
    const fn = (formData.firstName || '').trim().charAt(0).toUpperCase();
    const ln = (formData.lastName || '').trim().charAt(0).toUpperCase();
    return (fn + ln) || 'EH';
  }, [formData.firstName, formData.lastName]);

  const handleDemoFill = (type) => {
    if (type === 'customer') {
      setFormData((prev) => ({
        ...prev,
        email: 'customer@eventhub.com',
        password: 'Customer@123'
      }));
      showToast('Demo party animal credentials filled', 'info');
    } else if (type === 'admin') {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@eventhub.com',
        password: 'Admin@123'
      }));
      showToast('Demo admin credentials filled', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        showToast(`Reset code dispatched to ${formData.email}! Please check your SMS/inbox`, 'info');
        setMode('login');
        return;
      }

      if (mode === 'login') {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const user = response.user || {
          email: formData.email,
          firstName: response.email ? response.email.split('@')[0] : 'EventHub Member',
          role: response.role || 'CUSTOMER'
        };
        setAuthSession(response.token, response.refreshToken, user);
        showToast('Signed in successfully! Welcome to EventHub!', 'success');
        if (onAuthSuccess) {
          onAuthSuccess(user);
        } else if (onNavigate) {
          onNavigate('home');
        }
      } else if (mode === 'register') {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        const user = response.user || {
          email: formData.email,
          firstName: formData.firstName || 'EventHub Member',
          role: formData.role || 'CUSTOMER'
        };
        if (response.token) {
          setAuthSession(response.token, response.refreshToken, user);
          showToast('Account created! Welcome to EventHub', 'success');
          if (onAuthSuccess) {
            onAuthSuccess(user);
          } else if (onNavigate) {
            onNavigate('home');
          }
        } else {
          showToast('Live pass ready! Sign in to enter the box office', 'success');
          setMode('login');
        }
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-buttercream text-toy-black flex flex-col justify-between items-center relative overflow-hidden select-none font-body">
      {/* Floating Confetti Decorative Custom Stickers */}
      <div className="fixed top-36 left-6 lg:left-12 z-0 pointer-events-none float-slow hidden md:block select-none">
        <BalloonSticker size={64} />
      </div>
      <div className="fixed top-48 right-6 lg:right-12 z-0 pointer-events-none float-slow hidden md:block select-none" style={{ animationDelay: '1.2s' }}>
        <SparklesSticker size={66} />
      </div>
      <div className="fixed bottom-24 left-6 lg:left-12 z-0 pointer-events-none float-slow hidden md:block select-none" style={{ animationDelay: '0.7s' }}>
        <DiscoBallSticker size={62} />
      </div>

      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between relative z-20">
        <button 
          type="button"
          onClick={() => (onNavigate ? onNavigate('home') : window.history.back())} 
          className="inline-flex items-center gap-2 bg-white hover:bg-lilac-wash text-toy-black rounded-full px-5 py-2.5 font-display font-black text-sm transition-all cursor-pointer border-2 border-toy-black shadow-toy hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 bg-sun-yellow border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] px-4 py-1.5 rounded-full text-xs text-toy-black font-display font-black">
            <TicketSticker size={16} tilted={false} />
            <span>Box Office Active</span>
          </div>
          <div className="bg-bubble-pink text-white text-xs font-display font-black uppercase px-4 py-1.5 rounded-full border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]">
            LVL 99
          </div>
        </div>
      </header>

      {/* Main Dual-Column Accreditation Terminal */}
      <main className="w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* ══════════════════════════════════════════════════════════════
              LEFT COLUMN: NEO-MEMPHIS SOCIAL PASS PREVIEW
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-center w-full">
            
            {/* The EventHub VIP Pass Card */}
            <div className="w-full max-w-sm rounded-[32px] bg-white border-[3.5px] border-toy-black p-6 sm:p-7 text-toy-black shadow-toy-xl relative overflow-hidden group">
              
              {/* Pass Header */}
              <div className="flex items-center justify-between border-b-2 border-toy-black/20 pb-4 mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl tracking-tight text-toy-black">
                    EventHub
                  </span>
                  <span className="text-[10px] font-display font-black uppercase tracking-wider bg-sun-yellow text-toy-black border border-toy-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1E1B2E]">
                    {formData.role === 'ORGANIZER' ? 'Host Pass' : 'VIP Guest'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-candy-purple font-display font-black text-xs">
                  <TicketSticker size={16} tilted={false} />
                  <span>2026</span>
                </div>
              </div>

              {/* Attendee Info Cluster */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-sun-yellow text-toy-black flex items-center justify-center text-2xl font-display font-black shadow-[2px_2px_0px_#1E1B2E] border-2 border-toy-black shrink-0">
                  {attendeeInitials}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-candy-purple font-display font-black block">
                    Verified Attendee
                  </span>
                  <h3 className="text-xl font-display font-black text-toy-black truncate leading-snug">
                    {formData.firstName || formData.lastName 
                      ? `${formData.firstName} ${formData.lastName}`.trim() 
                      : 'Special Guest'}
                  </h3>
                  <span className="text-xs text-toy-black/60 truncate block font-body font-semibold">
                    {formData.email || 'guest@eventhub.com'}
                  </span>
                </div>
              </div>

              {/* Dynamic Ticket Serial & QR Block */}
              <div className="bg-buttercream border-2 border-toy-black rounded-2xl p-4 mb-5 flex items-center justify-between gap-3 relative z-10 shadow-[2px_2px_0px_#1E1B2E]">
                <div>
                  <span className="text-[10px] uppercase font-display font-black text-toy-black/70 tracking-wider block">
                    Pass Reference
                  </span>
                  <span className="font-mono text-xs font-bold text-toy-black tracking-wider block">
                    {ticketSerial}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-mint-pop border border-toy-black animate-pulse"></span>
                    <span className="text-[11px] text-toy-black font-display font-bold">Party Ready</span>
                  </div>
                </div>

                {/* Minimal QR Code Box */}
                <div className="w-14 h-14 bg-white rounded-xl border-2 border-toy-black p-1 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ticketSerial)}`} 
                    alt="Ticket QR" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Guarantees List */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-dashed border-toy-black/20 text-xs font-display font-bold text-toy-black/80 relative z-10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-mint-pop stroke-[2.5]" />
                  <span>100% Free Invite</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-mint-pop stroke-[2.5]" />
                  <span>Zero Boring Emails</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-mint-pop stroke-[2.5]" />
                  <span>Shared Photo Roll</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-sun-yellow stroke-[2.5]" />
                  <span>Snack Coin Split</span>
                </div>
              </div>

            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: NEO-MEMPHIS AUTHENTICATION CARD
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 order-1 lg:order-2 w-full">
            <div className="bg-white text-toy-black rounded-[32px] p-6 sm:p-10 border-[3.5px] border-toy-black shadow-toy-xl relative">
              
              {/* Mode Switcher Tabs */}
              <div className="flex p-1.5 bg-lilac-wash rounded-full max-w-sm mb-6 border-2 border-toy-black">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-display font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]'
                      : 'text-toy-black/70 hover:text-toy-black'
                  }`}
                >
                  <Key size={14} />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-display font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]'
                      : 'text-toy-black/70 hover:text-toy-black'
                  }`}
                >
                  <Ticket size={14} />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-toy-black">
                  {mode === 'login' && 'Welcome Back to EventHub!'}
                  {mode === 'register' && 'Create Your EventHub Account'}
                  {mode === 'forgot' && 'Reset Your Passcode'}
                </h1>
                <p className="text-sm font-body font-semibold text-toy-black/70 mt-1">
                  {mode === 'login' && 'Enter your details to manage event bookings, real-time seats, and QR passes.'}
                  {mode === 'register' && 'Join EventHub to reserve favorite seats, manage live passes, and drop instant invitations.'}
                  {mode === 'forgot' && 'Drop your email address and we will dispatch a magic link.'}
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Sign-Up: Account Type Selection Cards */}
                {mode === 'register' && (
                  <div className="mb-5">
                    <label className="block text-xs font-display font-black text-toy-black/80 uppercase tracking-wider mb-2">
                      Who Are You?
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Customer / Attendee Card */}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: 'CUSTOMER' }))}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                          formData.role === 'CUSTOMER'
                            ? 'border-toy-black bg-mint-pop/30 shadow-toy'
                            : 'border-toy-black/40 bg-buttercream/40 hover:border-toy-black'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-display font-black text-toy-black flex items-center gap-2">
                            <Ticket size={16} className="text-candy-purple" />
                            Party Guest
                          </span>
                          {formData.role === 'CUSTOMER' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-mint-pop border border-toy-black"></span>
                          )}
                        </div>
                        <p className="text-xs font-body font-semibold text-toy-black/70 leading-relaxed">
                          Discover bashes, RSVP in one click, and chip into split pots.
                        </p>
                      </button>

                      {/* Organizer Card */}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: 'ORGANIZER' }))}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                          formData.role === 'ORGANIZER'
                            ? 'border-toy-black bg-sun-yellow/40 shadow-toy'
                            : 'border-toy-black/40 bg-buttercream/40 hover:border-toy-black'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-display font-black text-toy-black flex items-center gap-2">
                            <Radio size={16} className="text-bubble-pink" />
                            Party Host
                          </span>
                          {formData.role === 'ORGANIZER' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-sun-yellow border border-toy-black"></span>
                          )}
                        </div>
                        <p className="text-xs font-body font-semibold text-toy-black/70 leading-relaxed">
                          Host legendary parties, blast texts, and pool coins for snacks.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign-Up: First & Last Name */}
                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-display font-black text-toy-black uppercase tracking-wider mb-1.5">
                        First Name <span className="text-bubble-pink">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Maya"
                          className="w-full bg-buttercream border-2 border-toy-black focus:bg-white text-toy-black rounded-full pl-10 pr-4 h-[51px] text-sm font-bold outline-none transition-all placeholder:text-toy-black/40"
                        />
                        <User size={16} className="absolute left-3.5 top-4 text-toy-black/50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-display font-black text-toy-black uppercase tracking-wider mb-1.5">
                        Last Name <span className="text-bubble-pink">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Theo"
                          className="w-full bg-buttercream border-2 border-toy-black focus:bg-white text-toy-black rounded-full pl-10 pr-4 h-[51px] text-sm font-bold outline-none transition-all placeholder:text-toy-black/40"
                        />
                        <User size={16} className="absolute left-3.5 top-4 text-toy-black/50" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-display font-black text-toy-black uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-bubble-pink">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@eventhub.com"
                      className="w-full bg-buttercream border-2 border-toy-black focus:bg-white text-toy-black rounded-full pl-10 pr-4 h-[51px] text-sm font-bold outline-none transition-all placeholder:text-toy-black/40"
                    />
                    <Mail size={16} className="absolute left-3.5 top-4 text-toy-black/50" />
                  </div>
                </div>

                {/* Sign-Up: Optional Phone Number */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-display font-black text-toy-black uppercase tracking-wider mb-1.5">
                      Phone Number (For Text Blast)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-buttercream border-2 border-toy-black focus:bg-white text-toy-black rounded-full pl-10 pr-4 h-[51px] text-sm font-bold outline-none transition-all placeholder:text-toy-black/40"
                      />
                      <Phone size={16} className="absolute left-3.5 top-4 text-toy-black/50" />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-display font-black text-toy-black uppercase tracking-wider">
                        Passcode <span className="text-bubble-pink">*</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs font-display font-bold text-candy-purple hover:underline cursor-pointer"
                        >
                          Forgot passcode?
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
                        className="w-full bg-buttercream border-2 border-toy-black focus:bg-white text-toy-black rounded-full pl-10 pr-12 h-[51px] text-sm font-bold outline-none transition-all placeholder:text-toy-black/40"
                      />
                      <Lock size={16} className="absolute left-3.5 top-4 text-toy-black/50" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 p-2 text-toy-black/60 hover:text-toy-black cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {mode === 'register' && formData.password && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-lilac-wash border border-toy-black h-2 rounded-full overflow-hidden p-0.5">
                          <div 
                            className={`h-full ${passwordStats.barColor} rounded-full transition-all duration-300`} 
                            style={{ width: `${passwordStats.pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-display font-black ${passwordStats.color}`}>
                          {passwordStats.label}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Demo Credentials Autofill */}
                {mode === 'login' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-display font-black text-toy-black/70 mb-2">
                      <span>Quick Demo Logins</span>
                      <span className="text-candy-purple">1-Click Fill</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoFill('customer')}
                        className="py-2.5 px-3 rounded-full bg-buttercream hover:bg-white border-2 border-toy-black text-xs font-display font-black text-toy-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1E1B2E]"
                      >
                        <span>Demo Guest</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoFill('admin')}
                        className="py-2.5 px-3 rounded-full bg-buttercream hover:bg-white border-2 border-toy-black text-xs font-display font-black text-toy-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1E1B2E]"
                      >
                        <span>Demo Admin</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 h-[51px] rounded-full bg-bubble-pink hover:bg-[#ff2a73] text-white text-base font-display font-black border-2 border-toy-black shadow-toy hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">
                      {mode === 'register' ? 'Creating Pass...' : 'Signing in...'}
                    </span>
                  ) : mode === 'forgot' ? (
                    <>
                      <span>Send Magic Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <span>Create Account & Join Bash</span>
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <span>Sign In to EventHub</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Quick-Switch Links */}
              <div className="mt-6 pt-5 border-t-2 border-dashed border-toy-black/20 text-center text-xs font-display font-bold text-toy-black/70">
                {mode === 'forgot' ? (
                  <button 
                    type="button"
                    onClick={() => setMode('login')} 
                    className="text-candy-purple hover:underline font-black cursor-pointer"
                  >
                    ← Return to sign in
                  </button>
                ) : mode === 'login' ? (
                  <div>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('register')} 
                      className="text-bubble-pink hover:underline font-black ml-1 cursor-pointer"
                    >
                      Create one now
                    </button>
                  </div>
                ) : (
                  <div>
                    Already registered?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('login')} 
                      className="text-candy-purple hover:underline font-black ml-1 cursor-pointer"
                    >
                      Sign in here ➔
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="w-full py-4 text-center text-xs font-display font-semibold text-toy-black/60">
        <span>© 2026 EventHub · Built for live events & unforgettable moments</span>
      </footer>
    </div>
  );
}
