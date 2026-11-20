import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const CONSTELLATION_CARDS = [
  // ── TOP PERIMETER ROW (4 cards across top) ──
  {
    id: 1,
    title: 'Skyline Cocktail Gala',
    image: '/images/events/cocktail-hour.jpg',
    className: 'left-[3%] top-[4%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '0s',
    rotate: '-rotate-2',
    exitX: '-280px', exitY: '-200px', exitRotate: '-15deg',
    shadowHover: 'hover:shadow-pop-pink',
  },
  {
    id: 2,
    title: 'Global AI Hackathon',
    image: '/images/events/hackathon-dev.jpg',
    className: 'left-[22%] top-[3%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '1.2s',
    rotate: 'rotate-2',
    exitX: '-120px', exitY: '-280px', exitRotate: '10deg',
    shadowHover: 'hover:shadow-pop-azure',
  },
  {
    id: 3,
    title: 'Comedy Cellar Live',
    image: '/images/events/standup-comedy.jpg',
    className: 'right-[22%] top-[3%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '0.6s',
    rotate: '-rotate-1',
    exitX: '120px', exitY: '-280px', exitRotate: '-10deg',
    shadowHover: 'hover:shadow-toy-lg',
  },
  {
    id: 4,
    title: 'Tuscany Food & Wine',
    image: '/images/events/artisan-food-fest.jpg',
    className: 'right-[3%] top-[4%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '1.8s',
    rotate: 'rotate-3',
    exitX: '280px', exitY: '-200px', exitRotate: '15deg',
    shadowHover: 'hover:shadow-pop-mint',
  },

  // ── SIDES (MID-SCREEN) ──
  {
    id: 5,
    title: 'Phantom of the Opera',
    image: '/images/events/phantom-opera.jpg',
    className: 'left-[2.5%] top-[40%] w-32 h-36 md:w-36 md:h-40 lg:w-40 lg:h-44 xl:w-44 xl:h-48 animate-luma-float',
    delay: '2.1s',
    rotate: '-rotate-2',
    exitX: '-280px', exitY: '0px', exitRotate: '-14deg',
    shadowHover: 'hover:shadow-pop-pink',
  },
  {
    id: 6,
    title: 'Cyberpunk 2099 IMAX',
    image: '/images/events/cyberpunk-imax.jpg',
    className: 'right-[2.5%] top-[40%] w-32 h-36 md:w-36 md:h-40 lg:w-40 lg:h-44 xl:w-44 xl:h-48 animate-luma-float',
    delay: '1.4s',
    rotate: 'rotate-2',
    exitX: '280px', exitY: '0px', exitRotate: '14deg',
    shadowHover: 'hover:shadow-pop-azure',
  },

  // ── BOTTOM PERIMETER ROW (4 cards across bottom) ──
  {
    id: 7,
    title: 'Art Basel Modern Gala',
    image: '/images/events/modern-art-gala.jpg',
    className: 'left-[4%] bottom-[7%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '1.6s',
    rotate: 'rotate-2',
    exitX: '-260px', exitY: '260px', exitRotate: '16deg',
    shadowHover: 'hover:shadow-pop-purple',
  },
  {
    id: 8,
    title: 'Interstellar in 70mm',
    image: '/images/events/interstellar-70mm.jpg',
    className: 'left-[22%] bottom-[4%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '0.7s',
    rotate: '-rotate-2',
    exitX: '-120px', exitY: '280px', exitRotate: '-10deg',
    shadowHover: 'hover:shadow-toy-lg',
  },
  {
    id: 9,
    title: 'Blue Note Jazz Club',
    image: '/images/events/jazz-blues-night.jpg',
    className: 'right-[22%] bottom-[4%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '2.4s',
    rotate: 'rotate-2',
    exitX: '120px', exitY: '280px', exitRotate: '10deg',
    shadowHover: 'hover:shadow-pop-azure',
  },
  {
    id: 10,
    title: 'Coachella Sunset Live',
    image: '/images/events/indie-acoustic.jpg',
    className: 'right-[4%] bottom-[7%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '1.1s',
    rotate: '-rotate-2',
    exitX: '260px', exitY: '260px', exitRotate: '-16deg',
    shadowHover: 'hover:shadow-pop-pink',
  },
];

export default function WelcomeDiscoveryPortal({ onDiscover, onExiting }) {
  const [isExiting, setIsExiting] = useState(false);
  const [gateStage, setGateStage] = useState('idle'); // 'idle' | 'closing' | 'sealed' | 'opening' | 'done'

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const handleDiscoverClick = () => {
    if (gateStage !== 'idle' || isExiting) return;

    // 1. Gates close in from the sides with high energy
    setGateStage('closing');
    setIsExiting(true);

    // 2. Gates meet in center, seal the VIP ticket pass, and swap the scene
    setTimeout(() => {
      setGateStage('sealed');
      if (onExiting) onExiting();
    }, 320);

    // 3. Gates fling wide open like festival stage curtains
    setTimeout(() => {
      setGateStage('opening');
    }, 450);

    // 4. Transition complete, unmount portal
    setTimeout(() => {
      setGateStage('done');
      onDiscover();
    }, 920);
  };

  return (
    <div
      className="fixed inset-0 z-[100] w-full h-full max-h-screen bg-buttercream text-toy-black font-sans overflow-y-auto lg:overflow-hidden select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden selection:bg-bubble-pink selection:text-white"
      style={{
        opacity: gateStage === 'opening' || gateStage === 'done' ? 0 : 1,
        transition: gateStage === 'opening' ? 'opacity 300ms ease-out' : undefined,
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      
      {/* ─── AMBIENT ATMOSPHERIC LIGHTING ─── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[660px] bg-gradient-to-tr from-bubble-pink/10 via-candy-purple/10 to-sun-yellow/15 blur-[130px] rounded-full opacity-70" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-sun-yellow/15 blur-[110px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-bubble-pink/12 blur-[110px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #1E1B2E 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* ─── MAIN HERO AREA ─── */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 overflow-hidden">
        
        {/* ── SCATTERED FLOATING POSTER CARDS (Desktop Constellation) ── */}
        <div className="absolute inset-0 pointer-events-none select-none hidden lg:block overflow-hidden">
          {CONSTELLATION_CARDS.map((card) => {
            let cardExitStyle = {};
            if (isExiting) {
              cardExitStyle = {
                transform: `translate3d(${card.exitX}, ${card.exitY}, 0px) rotate(${card.exitRotate})`,
                opacity: 0,
                transition: 'transform 300ms ease-out, opacity 300ms ease-out',
                pointerEvents: 'none',
              };
            } else {
              cardExitStyle = {
                transform: 'translate3d(0, 0, 0) scale(1)',
                opacity: 1,
                transition: 'transform 300ms ease, opacity 300ms ease',
              };
            }

            return (
              <div
                key={card.id}
                className={`absolute ${card.className} pointer-events-auto hover:z-50 group`}
                style={{ animationDelay: card.delay }}
              >
                <div
                  onClick={handleDiscoverClick}
                  className={`w-full h-full relative rounded-2xl overflow-hidden border-[2.5px] border-toy-black shadow-toy ${card.shadowHover} cursor-pointer select-none bg-toy-black group ${
                    !isExiting ? `${card.rotate} group-hover:rotate-0 group-hover:scale-110 transition-transform duration-300` : ''
                  }`}
                  style={cardExitStyle}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Glossy light sheen sweep on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none z-10" />

                  {/* Vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-toy-black/75 via-toy-black/20 to-transparent pointer-events-none" />

                  {/* Title sticker badge - fades out immediately on morph exit */}
                  <div 
                    className="absolute inset-x-1.5 bottom-1.5 z-20 flex justify-center pointer-events-none transition-opacity duration-200"
                    style={{ opacity: isExiting ? 0 : 1 }}
                  >
                    <div className="max-w-full bg-white/95 px-2.5 py-1 rounded-full border-[1.5px] border-toy-black shadow-[2px_2px_0px_#1E1B2E]">
                      <h3 className="font-display font-black text-[9.5px] xl:text-[10.5px] text-toy-black tracking-tight leading-none truncate whitespace-nowrap">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CENTER HERO CONTENT ── */}
        <div
          className="relative z-30 max-w-xl sm:max-w-2xl mx-auto text-center flex flex-col items-center px-4"
          style={{
            opacity: isExiting ? 0 : 1,
            transition: 'opacity 250ms ease-out',
            pointerEvents: isExiting ? 'none' : 'auto',
          }}
        >
          
          {/* Logo Minimalist Wordmark: eventhub */}
          <div className="inline-flex items-center gap-1 mb-3 select-none">
            <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-toy-black">
              eventhub
            </span>
          </div>

          <h1 className="font-display font-black text-5xl xs:text-6xl sm:text-7xl md:text-8xl text-toy-black tracking-tight leading-[1.04] text-center">
            Unforgettable <br />
            live moments <br />
            <span className="bg-gradient-to-r from-candy-purple via-bubble-pink to-sun-yellow bg-clip-text text-transparent">
              start here
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base md:text-lg font-body font-semibold text-toy-black/80 max-w-md sm:max-w-lg mx-auto leading-relaxed">
            Discover concerts, festivals, comedy, and cinema. Pick your exact seats in seconds and breeze through the gates.
          </p>

          {/* Primary Action Button */}
          <div className="mt-7 flex flex-col items-center w-full relative">
            <button
              type="button"
              onClick={handleDiscoverClick}
              className={`px-10 sm:px-12 py-3.5 sm:py-4 rounded-full font-display font-black text-base sm:text-lg border-[3px] border-toy-black shadow-toy-lg cursor-pointer flex items-center justify-center gap-2.5 select-none relative z-20 bg-sun-yellow hover:bg-[#FFE043] text-toy-black hover:shadow-pop-pink hover:scale-105 active:scale-95 transition-all duration-300 ${
                isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
              }`}
              style={{
                transition: isExiting ? 'opacity 200ms ease-out, transform 200ms ease-out' : undefined,
              }}
            >
              <span>Discover</span>
              <ArrowRight size={18} className="stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* ─── MOBILE CAROUSEL OF EVENT CARDS (< lg screens) ─── */}
        <div className="lg:hidden mt-10 w-full max-w-md mx-auto">
          <div className="text-center mb-3">
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-toy-black/60">
              LIVE EVENTS
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
            {CONSTELLATION_CARDS.slice(0, 10).map((card) => (
              <div 
                key={`mobile-${card.id}`}
                onClick={handleDiscoverClick}
                className="shrink-0 w-32 h-36 rounded-2xl overflow-hidden border-2 border-toy-black shadow-toy cursor-pointer relative bg-toy-black"
                style={{
                  opacity: isExiting ? 0 : 1,
                  transition: 'opacity 250ms ease-out',
                }}
              >
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                />
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-toy-black/70 to-transparent pointer-events-none" />
                <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex justify-center pointer-events-none">
                  <div className="max-w-full bg-white/95 px-2 py-0.5 rounded-full border border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E]">
                    <span className="text-[9.5px] font-display font-black text-toy-black leading-tight truncate block">
                      {card.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ══════════════════════════════════════════════════════════════
          NEO-MEMPHIS THEME TRANSITION: FESTIVAL VIP ADMISSION GATES
          ══════════════════════════════════════════════════════════════ */}
      {gateStage !== 'idle' && (
        <div className="fixed inset-0 z-[200] pointer-events-none select-none overflow-hidden">
          {/* Left Curtain Gate Panel: Sun Yellow with Retro Dots & Toy-Black Border */}
          <div
            className="fixed inset-y-0 left-0 w-1/2 bg-sun-yellow border-r-[4px] border-toy-black flex items-center justify-end overflow-hidden"
            style={{
              transform:
                gateStage === 'closing' || gateStage === 'sealed'
                  ? 'translate3d(0%, 0, 0)'
                  : 'translate3d(-102%, 0, 0)',
              transition:
                gateStage === 'closing'
                  ? 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                  : 'transform 470ms cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '10px 0px 0px rgba(30, 27, 46, 0.18)',
            }}
          >
            {/* Pop Halftone Dot Texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #1E1B2E 1.5px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Decorative angled festival ribbon */}
            <div className="absolute -left-8 top-24 -rotate-12 bg-white px-8 py-2.5 rounded-xl border-[2.5px] border-toy-black shadow-toy text-toy-black font-display font-black text-xs uppercase tracking-widest hidden sm:block">
              ✦ LIVE STAGE ✦
            </div>
          </div>

          {/* Right Curtain Gate Panel: Bubble Pink with Playful Dots & Toy-Black Border */}
          <div
            className="fixed inset-y-0 right-0 w-1/2 bg-bubble-pink border-l-[4px] border-toy-black flex items-center justify-start overflow-hidden"
            style={{
              transform:
                gateStage === 'closing' || gateStage === 'sealed'
                  ? 'translate3d(0%, 0, 0)'
                  : 'translate3d(102%, 0, 0)',
              transition:
                gateStage === 'closing'
                  ? 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                  : 'transform 470ms cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '-10px 0px 0px rgba(30, 27, 46, 0.18)',
            }}
          >
            {/* Pop Diagonal Grid Texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1.5px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Decorative angled festival ribbon */}
            <div className="absolute -right-8 bottom-28 rotate-12 bg-sun-yellow px-8 py-2.5 rounded-xl border-[2.5px] border-toy-black shadow-toy text-toy-black font-display font-black text-xs uppercase tracking-widest hidden sm:block">
              ✦ BOX OFFICE ✦
            </div>
          </div>

          {/* Center VIP Ticket Clasp Badge */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] pointer-events-none select-none"
            style={{
              transform:
                gateStage === 'opening'
                  ? 'translate3d(-50%, -50%, 0) scale(1.18)'
                  : gateStage === 'sealed'
                  ? 'translate3d(-50%, -50%, 0) scale(1.05)'
                  : 'translate3d(-50%, -50%, 0) scale(0.85)',
              opacity: gateStage === 'opening' ? 0 : 1,
              transition:
                gateStage === 'opening'
                  ? 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease-out'
                  : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl bg-white border-[3.5px] border-toy-black shadow-toy-xl">
              <div className="w-10 h-10 rounded-2xl bg-sun-yellow border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] flex items-center justify-center text-xl shrink-0">
                🎟️
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm sm:text-base text-toy-black tracking-wider uppercase">
                    ADMIT ONE
                  </span>
                  <span className="bg-bubble-pink text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-toy-black uppercase tracking-wider">
                    VIP PASS
                  </span>
                </div>
                <span className="font-display font-extrabold text-[11px] sm:text-xs text-candy-purple uppercase tracking-widest">
                  ✦ EVENTHUB LIVE PREMIERE ✦
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
