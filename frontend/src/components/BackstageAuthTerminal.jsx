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
  Key,
  Wifi,
  Fingerprint,
  Activity
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

  // Dynamic gate cryptographic authentication hash
  const gateHash = useMemo(() => {
    const raw = (formData.email || 'guest@eventhub.com').toLowerCase();
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `0x${hex}`;
  }, [formData.email]);

  // Attendee initials for the tactical security badge
  const attendeeInitials = useMemo(() => {
    const fn = (formData.firstName || '').trim().charAt(0).toUpperCase();
    const ln = (formData.lastName || '').trim().charAt(0).toUpperCase();
    return (fn + ln) || 'VP';
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
              OFFICIAL BOX OFFICE // LIVE SEAT INVENTORY
            </span>
          </div>
          <div className="bg-neon-magenta text-grit-white font-impact tracking-wider px-2.5 py-1 text-xs border border-asphalt-black">
            OFFICIAL ADMISSION GATE
          </div>
        </div>
      </header>

      {/* Main Dual-Column Accreditation Terminal */}
      <main className="w-full max-w-6xl px-3 sm:px-4 py-4 sm:py-6 relative z-10 flex-1 flex items-center justify-center safe-pb">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">

          {/* ══════════════════════════════════════════════════════════════
              LEFT COLUMN: THE LIVE HOLOGRAPHIC VIP BACKSTAGE PASS
              (Order 2 on mobile so form inputs are immediately visible)
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-center w-full">
            
            {/* Realistic Lanyard Strap & Industrial Swivel Hook Hardware */}
            <div className="w-full flex flex-col items-center select-none pointer-events-none">
              {/* Heavy-duty woven ribbon strap with branded micro-typography */}
              <div className="w-20 sm:w-24 h-10 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-x-2 border-acid-yellow/60 relative overflow-hidden flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#000_0px,#000_2px,transparent_2px,transparent_6px)]"></div>
                <span className="font-ticker text-[8px] text-acid-yellow font-bold uppercase tracking-widest rotate-90 scale-90 whitespace-nowrap">
                  EVENTHUB VIP
                </span>
              </div>

              {/* Metal Swivel Ring & Carabiner Clasp */}
              <div className="flex flex-col items-center mb-[-16px] z-30">
                {/* Brushed steel swivel ring */}
                <div className="w-7 h-7 rounded-full border-[3px] border-stone-400 bg-gradient-to-b from-stone-600 via-stone-400 to-stone-700 shadow-md flex items-center justify-center -mb-2">
                  <div className="w-2.5 h-2.5 bg-stone-900 rounded-full border border-stone-500"></div>
                </div>
                {/* Swivel mechanical pivot block */}
                <div className="w-4 h-2.5 bg-stone-400 border border-stone-600 shadow-sm z-20"></div>
                {/* Lobster claw / spring carabiner latch */}
                <div className="w-6 h-6 border-2 border-stone-300 bg-gradient-to-b from-stone-500 to-stone-700 rounded-t-sm rounded-b-md shadow-lg flex items-center justify-center relative z-20">
                  <div className="w-1.5 h-3 bg-stone-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* The Physical VIP Pass Card */}
            <div className="w-full max-w-sm bg-asphalt-surface border-2 border-grit-white shadow-[6px_6px_0px_#E2F13C] sm:shadow-[8px_8px_0px_#E2F13C] hover:shadow-[10px_10px_0px_#ff1f6d] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              
              {/* Shimmering Hologram Foil Overlay */}
              <div className="absolute inset-0 holo-foil pointer-events-none opacity-40 group-hover:opacity-65 transition-opacity duration-500 z-10"></div>

              {/* Corner Tactical Rivets */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-stone-400 bg-stone-600 z-30 shadow-inner flex items-center justify-center">
                <div className="w-1 h-0.5 bg-stone-300"></div>
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-stone-400 bg-stone-600 z-30 shadow-inner flex items-center justify-center">
                <div className="w-1 h-0.5 bg-stone-300"></div>
              </div>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-stone-400 bg-stone-600 z-30 shadow-inner flex items-center justify-center">
                <div className="w-1 h-0.5 bg-stone-300"></div>
              </div>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-stone-400 bg-stone-600 z-30 shadow-inner flex items-center justify-center">
                <div className="w-1 h-0.5 bg-stone-300"></div>
              </div>

              {/* Pass Top Warning Header */}
              <div className="hazard-tape h-2 w-full"></div>

              {/* Laminated Badge Slot Cutout (where clip latches) */}
              <div className="w-14 h-2.5 rounded-full bg-asphalt-black border-2 border-grit-dim/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] mx-auto mt-2 mb-1 relative z-20"></div>

              <div className="p-3.5 sm:p-4 md:p-5 relative z-20 flex flex-col justify-between">
                
                {/* Header Banner with RFID Chip and EventHub Pass Brand */}
                <div className="flex items-start justify-between border-b-2 border-asphalt-border pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Simulated Gold Smart Card RFID Chip */}
                    <div className="w-10 h-7 rounded-sm bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-600 p-0.5 shadow-sm relative overflow-hidden shrink-0 flex flex-col justify-between">
                      <div className="border-b border-amber-700/60 h-1.5 flex justify-between">
                        <div className="w-1.5 h-full border-r border-amber-700/60"></div>
                        <div className="w-1.5 h-full border-l border-amber-700/60"></div>
                      </div>
                      <div className="h-1.5 border-t border-amber-700/60 flex justify-between">
                        <div className="w-1.5 h-full border-r border-amber-700/60"></div>
                        <div className="w-1.5 h-full border-l border-amber-700/60"></div>
                      </div>
                      {/* Holographic chip shine */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none"></div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xl sm:text-2xl tracking-tight text-grit-white leading-none">
                          EVENTHUB
                        </span>
                        <span className="bg-acid-yellow text-asphalt-black font-impact text-[9px] px-1 py-0.2 tracking-wider">
                          VIP PASS
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-ticker text-[8px] text-grit-dim tracking-widest uppercase">
                          ACCREDITATION 2026
                        </span>
                        <span className="inline-flex items-center text-acid-yellow">
                          <Wifi size={10} className="rotate-90" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-neon-magenta text-grit-white font-impact text-[9px] sm:text-[10px] tracking-wider px-2 py-0.5 border border-asphalt-black uppercase block shadow-sm">
                      ALL-ACCESS
                    </span>
                    <span className="font-mono-zine text-[9px] text-acid-yellow font-bold uppercase tracking-wider block mt-1">
                      {ticketSerial}
                    </span>
                  </div>
                </div>

                {/* Live Stamped Attendee Badge Box */}
                <div className="bg-asphalt-card border-2 border-asphalt-border p-3 mb-3 relative">
                  <div className="flex items-center justify-between text-[9px] font-ticker text-grit-dim uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-acid-yellow animate-ping inline-block"></span>
                      ACCREDITED HOLDER:
                    </span>
                    <span className="text-acid-yellow flex items-center gap-1 font-bold">
                      <Sparkles size={10} /> LIVE SYNCED
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Tactical ID Photo / Viewfinder Reticle */}
                    <div className="w-12 h-12 bg-asphalt-black border-2 border-asphalt-border relative flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {/* Corner HUD reticle marks */}
                      <span className="absolute top-0.5 left-0.5 text-[8px] text-acid-yellow/70 font-mono leading-none">┌</span>
                      <span className="absolute top-0.5 right-0.5 text-[8px] text-acid-yellow/70 font-mono leading-none">┐</span>
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] text-acid-yellow/70 font-mono leading-none">└</span>
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] text-acid-yellow/70 font-mono leading-none">┘</span>

                      {/* Attendee Avatar Initials or Fingerprint Graphic */}
                      {formData.firstName || formData.lastName ? (
                        <span className="font-display font-black text-lg text-grit-white tracking-wider">
                          {attendeeInitials}
                        </span>
                      ) : (
                        <Fingerprint size={22} className="text-grit-dim/70 animate-pulse" />
                      )}

                      {/* Subtle scanline */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-acid-yellow/10 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Attendee Full Name & Verified Identity */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-2xl sm:text-3xl text-grit-white uppercase tracking-tight leading-none truncate">
                        {formData.firstName || formData.lastName ? (
                          `${formData.firstName} ${formData.lastName}`.trim()
                        ) : (
                          <span className="text-grit-dim/60">GUEST ATTENDEE</span>
                        )}
                      </div>

                      <div className="font-mono-zine text-[10px] text-grit-dim uppercase tracking-wider mt-1 truncate">
                        {formData.email || 'GUEST@EVENTHUB.LOCAL'}
                      </div>
                    </div>
                  </div>

                  {/* Role Accreditation Clearance Stamp */}
                  <div className="mt-2.5 pt-2 border-t border-asphalt-border/60 flex items-center justify-between">
                    <span className="text-[9px] font-mono-zine text-grit-dim uppercase">CLEARANCE:</span>
                    {formData.role === 'ORGANIZER' ? (
                      <span className="bg-neon-magenta text-grit-white font-impact text-[11px] tracking-wider px-2 py-0.5 uppercase border border-asphalt-black flex items-center gap-1 shadow-sm">
                        <Radio size={11} /> CREW // STAGE + BOOTH
                      </span>
                    ) : (
                      <span className="bg-acid-yellow text-asphalt-black font-impact text-[11px] tracking-wider px-2 py-0.5 uppercase border border-asphalt-black flex items-center gap-1 shadow-sm">
                        <Sparkles size={11} /> LEVEL 01 // VIP PIT + LOUNGE
                      </span>
                    )}
                  </div>
                </div>

                {/* Perforated Tear Line with Semicircle Notches & Scissor Microtext */}
                <div className="relative my-1.5 py-1.5 flex items-center">
                  <div className="absolute -left-6 sm:-left-7 w-5 h-5 rounded-full bg-asphalt-black border-2 border-grit-white z-20 shadow-inner"></div>
                  <div className="w-full border-t-2 border-dashed border-asphalt-border relative flex items-center justify-center">
                    <span className="bg-asphalt-surface px-2 text-[7px] font-mono-zine text-grit-dim uppercase tracking-widest -mt-2">
                      ::: DETACH AT TURNSTILE :::
                    </span>
                  </div>
                  <div className="absolute -right-6 sm:-right-7 w-5 h-5 rounded-full bg-asphalt-black border-2 border-grit-white z-20 shadow-inner"></div>
                </div>

                {/* Interactive Dynamic QR Code & Optical Scan Sweep */}
                <div className="grid grid-cols-12 gap-3 items-center mt-1">
                  {/* Left Column: QR Code with Target Brackets and Laser Sweep */}
                  <div className="col-span-4 relative bg-grit-white p-1.5 border-2 border-asphalt-black aspect-square flex flex-col items-center justify-center overflow-hidden shadow-sm">
                    {/* Corner Targeting Marks */}
                    <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t-2 border-l-2 border-neon-magenta z-20"></div>
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-neon-magenta z-20"></div>
                    <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b-2 border-l-2 border-neon-magenta z-20"></div>
                    <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b-2 border-r-2 border-neon-magenta z-20"></div>

                    {/* Laser Scanner Beam */}
                    <div className="absolute left-0 right-0 h-1 bg-neon-magenta shadow-[0_0_10px_#ff1f6d] animate-laser-sweep z-20"></div>
                    
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

                    <span className="font-ticker text-[7px] text-asphalt-black font-bold uppercase tracking-wider mt-0.5 block">
                      SCAN GATE
                    </span>
                  </div>

                  {/* Right Column: Gate Token, Barcode & Decibel VU Meter */}
                  <div className="col-span-8 flex flex-col justify-between space-y-1.5">
                    {/* Gate Hash Token Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-impact tracking-wider text-grit-white uppercase">
                        <ShieldCheck size={13} className="text-acid-yellow" />
                        <span>GATE TOKEN</span>
                      </div>
                      <span className="font-mono-zine text-[9px] text-acid-yellow font-bold">
                        {gateHash}
                      </span>
                    </div>

                    {/* Realistic Concert Ticket Barcode Graphic */}
                    <div className="bg-grit-white/95 p-1 border border-asphalt-black flex flex-col items-center">
                      <div className="w-full h-4 flex items-stretch justify-between gap-[1px] px-0.5">
                        {[2,1,3,1,1,2,1,4,1,2,1,1,3,2,1,1,2,1,3,1,2,1,1,4,1,2,1,3,1,1,2,1].map((w, idx) => (
                          <div 
                            key={idx} 
                            className="bg-asphalt-black h-full" 
                            style={{ width: `${w * 1.5}px` }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[7px] text-asphalt-black tracking-widest font-bold mt-0.5">
                        * 8 4 9 2 0 1 7 4 3 *
                      </span>
                    </div>

                    {/* Audio VU Decibel / Password Entropy Meter */}
                    <div className="bg-asphalt-card border border-asphalt-border p-1.5">
                      <div className="flex justify-between items-center text-[8px] font-ticker uppercase mb-1">
                        <span className="text-grit-dim flex items-center gap-1">
                          <Activity size={9} className="text-acid-yellow" />
                          SECURITY VU:
                        </span>
                        <span className={`font-bold ${passwordStats.color}`}>
                          {passwordStats.db} // {passwordStats.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-10 gap-0.5 h-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full transition-all duration-200 ${
                              i < (passwordStats.bars || 0) 
                                ? (i < 4 ? 'bg-acid-yellow' : i < 8 ? 'bg-acid-yellow shadow-[0_0_4px_#E2F13C]' : 'bg-neon-magenta shadow-[0_0_6px_#ff1f6d] animate-vu-pulse') 
                                : 'bg-asphalt-border/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admission Guarantees Checklist */}
                <div className="mt-3 pt-2.5 border-t border-asphalt-border/60 grid grid-cols-2 gap-1.5 font-ticker text-[8px] sm:text-[9px] text-grit-dim uppercase tracking-wider">
                  <div className="flex items-center gap-1 text-grit-white">
                    <CheckCircle2 size={10} className="text-acid-yellow shrink-0" />
                    <span>10-MIN CART LOCK</span>
                  </div>
                  <div className="flex items-center gap-1 text-grit-white">
                    <CheckCircle2 size={10} className="text-acid-yellow shrink-0" />
                    <span>ZERO OVERBOOKING</span>
                  </div>
                  <div className="flex items-center gap-1 text-grit-white">
                    <CheckCircle2 size={10} className="text-acid-yellow shrink-0" />
                    <span>OFFLINE QR TOKEN</span>
                  </div>
                  <div className="flex items-center gap-1 text-acid-yellow font-bold">
                    <Zap size={10} className="text-neon-magenta shrink-0" />
                    <span>INSTANT STUB PDF</span>
                  </div>
                </div>

                {/* Microprint Security Ribbon */}
                <div className="mt-2.5 pt-1.5 border-t border-asphalt-border/40 text-center">
                  <span className="font-mono-zine text-[7px] text-grit-dim/70 uppercase tracking-widest block truncate">
                    AUTHENTICATED GATE SYSTEM // EHB-SEC-2026 // NON-TRANSFERABLE
                  </span>
                </div>

              </div>

              {/* Pass Bottom Warning Footer */}
              <div className="hazard-tape h-2 w-full"></div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: THE BRUTALIST DISPATCH TERMINAL CONSOLE
              (Order 1 on mobile for immediate access to inputs)
              ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 order-1 lg:order-2 w-full">
            <div className="bg-asphalt-surface border-2 border-grit-white p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_#F43F5E] sm:shadow-[8px_8px_0px_#F43F5E] relative">
              
              {/* Slanted Tape Stamp Badge */}
              <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-20">
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
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-grit-white leading-none">
                  {mode === 'login' && 'ACCESS YOUR PASSES'}
                  {mode === 'register' && 'ISSUE VIP ACCREDITATION'}
                  {mode === 'forgot' && 'CREDENTIAL RECOVERY'}
                </h1>
                <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1.5">
                  {mode === 'login' && 'ENTER YOUR CREDENTIALS TO RETRIEVE BOOKINGS & TICKETS'}
                  {mode === 'register' && 'JOIN EVENTHUB TO RESERVE SEATS, SECURE QR PASSES & TRACK LIVE EVENTS'}
                  {mode === 'forgot' && 'ENTER YOUR EMAIL ADDRESS TO RECEIVE A SECURE PASSWORD RESET LINK'}
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
                        className="absolute right-1.5 top-1 p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-grit-dim hover:text-grit-white cursor-pointer touch-manipulation"
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
                        className="py-2 px-2 min-h-[36px] bg-asphalt-card border border-asphalt-border hover:border-acid-yellow font-ticker text-[10px] text-grit-dim hover:text-acid-yellow uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                      >
                        <Ticket size={12} className="text-acid-yellow" />
                        DEMO ATTENDEE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoFill('admin')}
                        className="py-2 px-2 min-h-[36px] bg-asphalt-card border border-asphalt-border hover:border-neon-magenta font-ticker text-[10px] text-grit-dim hover:text-neon-magenta uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
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
                    className="text-acid-yellow hover:text-grit-white font-bold underline cursor-pointer py-1.5 inline-block touch-manipulation"
                  >
                    ← RETURN TO SIGN IN
                  </button>
                ) : mode === 'login' ? (
                  <div>
                    NEW TO EVENTHUB?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('register')} 
                      className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer py-1.5 inline-block touch-manipulation"
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
                      className="text-acid-yellow hover:text-neon-magenta font-bold underline ml-1 cursor-pointer py-1.5 inline-block touch-manipulation"
                    >
                      SIGN IN HERE
                    </button>
                  </div>
                )}
              </div>

              {/* Barcode Watermark Footer */}
              <div className="mt-5 pt-3 border-t border-asphalt-border/40 flex justify-between items-center opacity-40 select-none">
                <span className="font-ticker text-[8px] text-grit-dim uppercase">OFFICIAL EVENTHUB BOX OFFICE // VERIFIED PASS</span>
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

