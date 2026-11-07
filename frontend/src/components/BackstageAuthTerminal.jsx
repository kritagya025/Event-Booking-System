import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Ticket, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  Key
} from 'lucide-react';
import { apiFetch, setAuthSession } from '../services/api';

export default function BackstageAuthTerminal({ 
  initialMode = 'login', 
  onAuthSuccess, 
  onNavigate, 
  showToast 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Password entropy & decibel VU-meter calculation
  const passwordStats = useMemo(() => {
    const pwd = formData.password || '';
    if (!pwd) return { score: 0, label: 'INACTIVE', db: '0 dB', color: 'text-grit-dim' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, bars: 3, label: 'LOW ENTROPY', db: '-6 dB', color: 'text-danger-red', bg: 'bg-danger-red' };
    }
    if (score <= 4) {
      return { score: 2, bars: 6, label: 'NOMINAL GAIN', db: '+2 dB', color: 'text-acid-yellow', bg: 'bg-acid-yellow' };
    }
    return { score: 3, bars: 10, label: 'PEAK OVERDRIVE', db: '+12 dB', color: 'text-neon-magenta', bg: 'bg-neon-magenta' };
  }, [formData.password]);

  // Dynamic ticket serial code
  const ticketSerial = useMemo(() => {
    const fn = (formData.firstName || 'VIP').slice(0, 3).toUpperCase();
    const ln = (formData.lastName || 'PASS').slice(0, 3).toUpperCase();
    return `EHB-${fn}${ln}-2026`;
  }, [formData.firstName, formData.lastName]);

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
      if (mode === 'forgot') {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        });
        showToast('PASSWORD RESET LINK DISPATCHED TO YOUR EMAIL', 'info');
        setMode('login');
      } else if (mode === 'login') {
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
          firstName: formData.firstName || 'User',
          role: formData.role || 'CUSTOMER'
        };
        if (response.token) {
          setAuthSession(response.token, response.refreshToken, user);
          showToast('ACCREDITATION APPROVED! WELCOME TO EVENTHUB.', 'success');
          if (onAuthSuccess) {
            onAuthSuccess(user);
          } else if (onNavigate) {
            onNavigate('home');
          }
        } else {
          showToast('ACCOUNT CREATED! CHECK EMAIL OR SIGN IN TO CONTINUE.', 'success');
          setMode('login');
        }
      }
    } catch (err) {
      showToast(err.message || 'AUTHENTICATION FAILED: PLEASE CHECK YOUR CREDENTIALS', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-asphalt-black text-grit-white flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* Top Hazard Warning Tape */}
      <div className="fixed top-0 left-0 w-full hazard-tape h-3.5 z-50"></div>

      {/* Background Graphic Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center overflow-hidden">
        <span className="font-display text-[26vw] leading-none tracking-tighter text-grit-white font-black">EVENTHUB</span>
      </div>

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl px-4 pt-8 pb-4 flex items-center justify-between relative z-20">
        <button 
          type="button"
          onClick={() => (onNavigate ? onNavigate('home') : window.history.back())} 
          className="flex items-center gap-2 bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-acid-yellow hover:text-asphalt-black px-4 py-2 font-mono-zine text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#0e0e11] transition-all cursor-pointer"
        >
          <span className="text-acid-yellow hover:text-asphalt-black font-bold">←</span> RETURN TO EVENTS
        </button>

        <div className="hidden sm:flex items-center gap-3">
          <div className="bg-asphalt-card border border-asphalt-border px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-acid-yellow animate-pulse"></span>
            <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
              TERMINAL // 10-MIN MUTEX ACTIVE
            </span>
          </div>
          <div className="bg-neon-magenta text-grit-white font-impact tracking-wider px-2.5 py-1 text-xs border border-asphalt-black">
            PORT 8080 TLS 1.3
          </div>
        </div>
      </header>

      {/* Main Dual-Column Accreditation Terminal */}
      <main className="w-full max-w-6xl px-4 py-6 relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* ══════════════════════════════════════════════════════════════
              LEFT COLUMN: THE LIVE HOLOGRAPHIC VIP BACKSTAGE PASS
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Lanyard Strap & Clip Graphic */}
            <div className="w-full flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-4 border-grit-dim/40 bg-asphalt-card flex items-center justify-center shadow-inner mb-[-14px] z-20">
                <div className="w-3 h-3 bg-grit-white rounded-full"></div>
              </div>
              <div className="w-12 h-5 bg-grit-dim/70 border-2 border-asphalt-black shadow-sm mb-[-4px] z-10"></div>
            </div>

            {/* The Physical VIP Pass Card */}
            <div className="w-full max-w-sm bg-asphalt-surface border-2 border-grit-white shadow-[8px_8px_0px_#E2F13C] relative overflow-hidden transition-all duration-300">
              
              {/* Shimmering Hologram Foil Overlay */}
              <div className="absolute inset-0 holo-foil pointer-events-none opacity-40 z-10"></div>

              {/* Pass Top Warning Header */}
              <div className="hazard-tape h-2 w-full"></div>
              
              <div className="p-5 md:p-6 relative z-20 flex flex-col justify-between">
                
                {/* Header Banner */}
                <div className="flex items-start justify-between border-b-2 border-asphalt-border pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-2xl tracking-tight text-grit-white">EVENTHUB</span>
                      <span className="bg-acid-yellow text-asphalt-black font-impact text-[10px] px-1.5 py-0.2 tracking-wider">
                        PASS
                      </span>
                    </div>
                    <span className="font-ticker text-[9px] text-grit-dim tracking-widest uppercase block mt-0.5">
                      AUTHENTICATED ADMISSION
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="bg-neon-magenta text-grit-white font-impact text-[10px] tracking-wider px-2 py-0.5 border border-asphalt-black uppercase block">
                      SEASON 2026
                    </span>
                    <span className="font-ticker text-[9px] text-acid-yellow font-bold uppercase tracking-wider block mt-1">
                      {ticketSerial}
                    </span>
                  </div>
                </div>

                {/* Live Stamped Attendee Name */}
                <div className="bg-asphalt-card border-2 border-asphalt-border p-3.5 mb-4 relative">
                  <div className="flex items-center justify-between text-[10px] font-ticker text-grit-dim uppercase tracking-wider mb-1">
                    <span>ACCREDITED HOLDER:</span>
                    <span className="text-acid-yellow flex items-center gap-1 font-bold">
                      <Sparkles size={11} /> LIVE PREVIEW
                    </span>
                  </div>

                  <div className="font-display text-3xl sm:text-4xl text-grit-white uppercase tracking-tight leading-none truncate">
                    {formData.firstName || formData.lastName ? (
                      `${formData.firstName} ${formData.lastName}`.trim()
                    ) : (
                      <span className="text-grit-dim/60">GUEST ATTENDEE</span>
                    )}
                  </div>

                  <div className="font-mono-zine text-[11px] text-grit-dim uppercase tracking-wider mt-1.5 truncate">
                    {formData.email || 'IDENTIFIER: PENDING_INPUT'}
                  </div>

                  {/* Role Accreditation Stamp */}
                  <div className="mt-3 pt-2.5 border-t border-asphalt-border/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono-zine text-grit-dim uppercase">CLEARANCE:</span>
                    {formData.role === 'ORGANIZER' ? (
                      <span className="bg-neon-magenta text-grit-white font-impact text-xs tracking-wider px-2 py-0.5 uppercase border border-asphalt-black">
                        ALL-ACCESS // PRODUCTION CREW
                      </span>
                    ) : (
                      <span className="bg-acid-yellow text-asphalt-black font-impact text-xs tracking-wider px-2 py-0.5 uppercase border border-asphalt-black">
                        LEVEL 01 // VIP ATTENDEE
                      </span>
                    )}
                  </div>
                </div>

                {/* Perforated Tear Line with Half-Circle Notches */}
                <div className="relative my-2 py-2 flex items-center">
                  <div className="absolute -left-7 w-5 h-5 rounded-full bg-asphalt-black border-2 border-grit-white z-20"></div>
                  <div className="w-full border-t-2 border-dashed border-asphalt-border"></div>
                  <div className="absolute -right-7 w-5 h-5 rounded-full bg-asphalt-black border-2 border-grit-white z-20"></div>
                </div>

                {/* Interactive Dynamic QR Code & Optical Scan Sweep */}
                <div className="grid grid-cols-12 gap-3 items-center mt-2">
                  <div className="col-span-4 relative bg-grit-white p-1.5 border-2 border-asphalt-black aspect-square flex items-center justify-center overflow-hidden">
                    {/* Laser Scanner Beam */}
                    <div className="absolute left-0 right-0 h-1 bg-neon-magenta shadow-[0_0_8px_#ff1f6d] animate-laser-sweep z-20"></div>
                    
                    {/* Stylized Vector QR Pattern */}
                    <svg viewBox="0 0 45 45" className="w-full h-full text-asphalt-black" fill="currentColor">
                      <rect x="0" y="0" width="15" height="15"/>
                      <rect x="3" y="3" width="9" height="9" fill="#FFF"/>
                      <rect x="5" y="5" width="5" height="5"/>
                      <rect x="30" y="0" width="15" height="15"/>
                      <rect x="33" y="3" width="9" height="9" fill="#FFF"/>
                      <rect x="35" y="5" width="5" height="5"/>
                      <rect x="0" y="30" width="15" height="15"/>
                      <rect x="3" y="33" width="9" height="9" fill="#FFF"/>
                      <rect x="5" y="35" width="5" height="5"/>
                      <rect x="18" y="3" width="8" height="4"/>
                      <rect x="18" y="10" width="4" height="8"/>
                      <rect x="25" y="18" width="8" height="6"/>
                      <rect x="18" y="27" width="5" height="8"/>
                      <rect x="28" y="28" width="12" height="4"/>
                      <rect x="34" y="35" width="8" height="8"/>
                      <rect x="25" y="38" width="5" height="4"/>
                    </svg>
                  </div>

                  <div className="col-span-8 flex flex-col justify-between space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-impact tracking-wider text-grit-white uppercase">
                      <ShieldCheck size={14} className="text-acid-yellow" />
                      <span>CRYPTOGRAPHIC GATE TOKEN</span>
                    </div>
                    <span className="font-ticker text-[10px] text-grit-dim uppercase">
                      SCAN VIA WEBCAM OR GATE SCANNER
                    </span>

                    {/* Audio VU Decibel Meter */}
                    <div className="bg-asphalt-card border border-asphalt-border p-1.5 mt-1">
                      <div className="flex justify-between items-center text-[9px] font-ticker uppercase mb-1">
                        <span className="text-grit-dim">SECURITY VU:</span>
                        <span className={`font-bold ${passwordStats.color}`}>{passwordStats.db} // {passwordStats.label}</span>
                      </div>
                      <div className="grid grid-cols-10 gap-0.5 h-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full transition-all duration-200 ${
                              i < (passwordStats.bars || 0) 
                                ? (i < 4 ? 'bg-acid-yellow' : i < 8 ? 'bg-acid-yellow' : 'bg-neon-magenta animate-vu-pulse') 
                                : 'bg-asphalt-border/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admission Guarantees Checklist */}
                <div className="mt-4 pt-3 border-t border-asphalt-border/60 grid grid-cols-2 gap-1.5 font-ticker text-[9px] text-grit-dim uppercase tracking-wider">
                  <div className="flex items-center gap-1 text-grit-white">
                    <CheckCircle2 size={10} className="text-acid-yellow" />
                    <span>10-MIN SEAT MUTEX</span>
                  </div>
                  <div className="flex items-center gap-1 text-grit-white">
                    <CheckCircle2 size={10} className="text-acid-yellow" />
                    <span>ZERO OVERBOOKING</span>
                  </div>
                  <div className="flex items-center gap-1 text-grit-white">
                    <CheckCircle2 size={10} className="text-acid-yellow" />
                    <span>PDF INVOICE STUB</span>
                  </div>
                  <div className="flex items-center gap-1 text-acid-yellow font-bold">
                    <Zap size={10} className="text-neon-magenta" />
                    <span>OFFLINE VERIFIED</span>
                  </div>
                </div>

              </div>

              {/* Pass Bottom Warning Footer */}
              <div className="hazard-tape h-2 w-full"></div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: THE BRUTALIST DISPATCH TERMINAL CONSOLE
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7">
            <div className="bg-asphalt-surface border-2 border-grit-white p-6 md:p-8 shadow-[8px_8px_0px_#F43F5E] relative">
              
              {/* Slanted Tape Stamp Badge */}
              <div className="absolute -top-4 -right-2 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-20">
                {mode === 'register' ? 'NEW ACCREDITATION DISPATCH' : 'AUTHENTICATED GATE ACCESS'}
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 border-b-2 border-asphalt-border pb-5 mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`py-2.5 px-4 font-impact text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
                    mode === 'login'
                      ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[4px_4px_0px_#ffffff]'
                      : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:text-grit-white hover:border-grit-dim'
                  }`}
                >
                  <Key size={16} />
                  <span>01 // SIGN IN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`py-2.5 px-4 font-impact text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
                    mode === 'register'
                      ? 'bg-neon-magenta text-grit-white border-asphalt-black shadow-[4px_4px_0px_#ffffff]'
                      : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:text-grit-white hover:border-grit-dim'
                  }`}
                >
                  <Ticket size={16} />
                  <span>02 // CREATE ACCOUNT</span>
                </button>
              </div>

              {/* Form Title & Subtitle */}
              <div className="mb-5 text-left">
                <h1 className="font-display text-4xl uppercase tracking-tight text-grit-white leading-none">
                  {mode === 'login' && 'ACCESS YOUR PASSES'}
                  {mode === 'register' && 'ISSUE VIP ACCREDITATION'}
                  {mode === 'forgot' && 'CREDENTIAL RECOVERY'}
                </h1>
                <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
                  {mode === 'login' && 'ENTER YOUR CREDENTIALS TO RETRIEVE BOOKINGS & TICKETS'}
                  {mode === 'register' && 'JOIN EVENTHUB TO RESERVE SEATS WITH 10-MIN STOMP MUTEX'}
                  {mode === 'forgot' && 'ENTER REGISTERED EMAIL TO RECEIVE SECURE HMAC-256 RESET LINK'}
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Sign-Up: Account Type Selection Cards */}
                {mode === 'register' && (
                  <div className="mb-4">
                    <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-2">
                      SELECT ACCOUNT CLASS <span className="text-neon-magenta">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Customer / Attendee Card */}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: 'CUSTOMER' }))}
                        className={`p-3 text-left border-2 transition-all cursor-pointer relative ${
                          formData.role === 'CUSTOMER'
                            ? 'bg-asphalt-card border-acid-yellow shadow-[4px_4px_0px_#E2F13C]'
                            : 'bg-asphalt-card/60 border-asphalt-border hover:border-grit-dim'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-impact text-sm tracking-wider uppercase text-grit-white flex items-center gap-1.5">
                            <Ticket size={15} className="text-acid-yellow" />
                            ATTENDEE
                          </span>
                          {formData.role === 'CUSTOMER' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-acid-yellow"></span>
                          )}
                        </div>
                        <p className="font-mono-zine text-[11px] text-grit-dim leading-snug">
                          RESERVE SEATS, RECEIVE CRYPTOGRAPHIC QR PASSES & DOWNLOAD PDF INVOICES.
                        </p>
                      </button>

                      {/* Organizer Card */}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: 'ORGANIZER' }))}
                        className={`p-3 text-left border-2 transition-all cursor-pointer relative ${
                          formData.role === 'ORGANIZER'
                            ? 'bg-asphalt-card border-neon-magenta shadow-[4px_4px_0px_#F43F5E]'
                            : 'bg-asphalt-card/60 border-asphalt-border hover:border-grit-dim'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-impact text-sm tracking-wider uppercase text-grit-white flex items-center gap-1.5">
                            <Radio size={15} className="text-neon-magenta" />
                            EVENT ORGANIZER
                          </span>
                          {formData.role === 'ORGANIZER' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-neon-magenta"></span>
                          )}
                        </div>
                        <p className="font-mono-zine text-[11px] text-grit-dim leading-snug">
                          PUBLISH VENUES, CONFIGURE SEAT MAPS & TRACK REAL-TIME REVENUE TELEMETRY.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign-Up: First & Last Name */}
                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
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
                          className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                        />
                        <User size={15} className="absolute left-3 top-3 text-grit-dim" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
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
                          className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                        />
                        <User size={15} className="absolute left-3 top-3 text-grit-dim" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Address */}
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
                      className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-grit-dim" />
                  </div>
                </div>

                {/* Sign-Up: Optional Phone Number */}
                {mode === 'register' && (
                  <div>
                    <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                      PHONE NUMBER (OPTIONAL)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                      />
                      <Phone size={15} className="absolute left-3 top-3 text-grit-dim" />
                    </div>
                  </div>
                )}

                {/* Password Field (not shown in forgot password mode) */}
                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider">
                        PASSWORD <span className="text-neon-magenta">*</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="font-mono-zine text-[11px] text-acid-yellow hover:text-grit-white uppercase tracking-wider underline cursor-pointer"
                        >
                          FORGOT PASSWORD?
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
                        className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-grit-dim/40 transition-colors"
                      />
                      <Lock size={15} className="absolute left-3 top-3 text-grit-dim" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-grit-dim hover:text-grit-white cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Demo Credentials Autofill (Sign In Mode) */}
                {mode === 'login' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] font-ticker text-grit-dim uppercase tracking-wider mb-2">
                      <span>QUICK TESTING FILL:</span>
                      <span className="text-acid-yellow font-bold">1-CLICK LOGIN</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoFill('customer')}
                        className="py-1.5 px-2 bg-asphalt-card border border-asphalt-border hover:border-acid-yellow font-ticker text-[10px] text-grit-dim hover:text-acid-yellow uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Ticket size={12} className="text-acid-yellow" />
                        DEMO ATTENDEE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoFill('admin')}
                        className="py-1.5 px-2 bg-asphalt-card border border-asphalt-border hover:border-neon-magenta font-ticker text-[10px] text-grit-dim hover:text-neon-magenta uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck size={12} className="text-neon-magenta" />
                        DEMO ADMIN
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 font-impact tracking-wider text-xl uppercase py-3.5 border-2 border-asphalt-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5 ${
                    mode === 'register'
                      ? 'bg-neon-magenta text-grit-white hover:bg-acid-yellow hover:text-asphalt-black shadow-[4px_4px_0px_#E2F13C]'
                      : 'bg-acid-yellow text-asphalt-black hover:bg-neon-magenta hover:text-grit-white shadow-[4px_4px_0px_#ffffff]'
                  }`}
                >
                  {loading ? (
                    <span className="animate-pulse tracking-widest text-base">
                      {mode === 'register' ? 'ISSUING ACCREDITATION...' : 'AUTHENTICATING TOKEN...'}
                    </span>
                  ) : mode === 'forgot' ? (
                    <>
                      <span>DISPATCH RESET LINK</span>
                      <ArrowRight size={18} />
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <span>CLAIM VIP PASS & ENTER</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <span>AUTHENTICATE & ENTER EVENTHUB</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Quick-Switch Links */}
              <div className="mt-5 pt-4 border-t border-asphalt-border text-center font-mono-zine text-xs text-grit-dim uppercase tracking-wider">
                {mode === 'forgot' ? (
                  <button 
                    type="button"
                    onClick={() => setMode('login')} 
                    className="text-acid-yellow hover:text-grit-white font-bold underline cursor-pointer"
                  >
                    ← RETURN TO SIGN IN
                  </button>
                ) : mode === 'login' ? (
                  <div>
                    NEW TO EVENTHUB?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('register')} 
                      className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer"
                    >
                      ISSUE A NEW PASS HERE
                    </button>
                  </div>
                ) : (
                  <div>
                    ALREADY HOLD AN ACCREDITATION?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('login')} 
                      className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer"
                    >
                      SIGN IN HERE
                    </button>
                  </div>
                )}
              </div>

              {/* Barcode Watermark Footer */}
              <div className="mt-5 pt-3 border-t border-asphalt-border/40 flex justify-between items-center opacity-40 select-none">
                <span className="font-ticker text-[8px] text-grit-dim uppercase">SYS_AUTH // EVENTHUB_VAULT_2026</span>
                <svg className="h-5 w-32" viewBox="0 0 144 24" fill="currentColor">
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

        </div>
      </main>

      {/* Bottom Hazard Warning Tape */}
      <footer className="w-full">
        <div className="w-full hazard-tape h-3 z-50"></div>
      </footer>
    </div>
  );
}
