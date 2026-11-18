import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const CONSTELLATION_CARDS = [
  // ── TOP PERIMETER ROW ──
  {
    id: 1,
    title: 'Skyline Cocktail Gala',
    image: '/images/events/cocktail-hour.jpg',
    className: 'left-[3%] top-[3%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '0s',
    rotate: '-rotate-2',
    exitX: '-280px', exitY: '-200px', exitRotate: '-15deg',
    shadowHover: 'hover:shadow-pop-pink',
  },
  {
    id: 2,
    title: 'Global AI Hackathon',
    image: '/images/events/hackathon-dev.jpg',
    className: 'left-[23%] top-[1%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '1.2s',
    rotate: 'rotate-2',
    exitX: '-120px', exitY: '-280px', exitRotate: '10deg',
    shadowHover: 'hover:shadow-pop-azure',
  },
  {
    id: 3,
    title: 'Comedy Cellar Live',
    image: '/images/events/standup-comedy.jpg',
    className: 'right-[23%] top-[1%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '0.6s',
    rotate: '-rotate-1',
    exitX: '120px', exitY: '-280px', exitRotate: '-10deg',
    shadowHover: 'hover:shadow-toy-lg',
  },
  {
    id: 4,
    title: 'Tuscany Food & Wine',
    image: '/images/events/artisan-food-fest.jpg',
    className: 'right-[3%] top-[3%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '1.8s',
    rotate: 'rotate-3',
    exitX: '280px', exitY: '-200px', exitRotate: '15deg',
    shadowHover: 'hover:shadow-pop-mint',
  },

  // ── LEFT PERIMETER COLUMN ──
  {
    id: 5,
    title: 'London City Marathon',
    image: '/images/events/marathon-run-club.jpg',
    className: 'left-[2%] top-[28%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '0.4s',
    rotate: 'rotate-2',
    exitX: '-280px', exitY: '-40px', exitRotate: '-18deg',
    shadowHover: 'hover:shadow-pop-mint',
  },
  {
    id: 6,
    title: 'Phantom of the Opera',
    image: '/images/events/phantom-opera.jpg',
    className: 'left-[3%] top-[52%] w-32 h-36 md:w-36 md:h-40 lg:w-40 lg:h-46 xl:w-44 xl:h-50 animate-luma-float-delayed',
    delay: '2.1s',
    rotate: '-rotate-3',
    exitX: '-280px', exitY: '160px', exitRotate: '-14deg',
    shadowHover: 'hover:shadow-pop-pink',
  },

  // ── RIGHT PERIMETER COLUMN ──
  {
    id: 7,
    title: 'Cyberpunk 2099 IMAX',
    image: '/images/events/cyberpunk-imax.jpg',
    className: 'right-[3%] top-[24%] w-32 h-38 md:w-36 md:h-42 lg:w-40 lg:h-48 xl:w-44 xl:h-52 animate-luma-float',
    delay: '1.4s',
    rotate: 'rotate-2',
    isMorph: true,
    shadowHover: 'hover:shadow-pop-azure',
  },
  {
    id: 8,
    title: 'Sunburn Goa Festival',
    image: '/images/events/beach-party.jpg',
    className: 'right-[2%] top-[50%] w-32 h-36 md:w-36 md:h-40 lg:w-40 lg:h-46 xl:w-44 xl:h-50 animate-luma-float-delayed',
    delay: '0.8s',
    rotate: '-rotate-2',
    exitX: '280px', exitY: '140px', exitRotate: '-14deg',
    shadowHover: 'hover:shadow-pop-purple',
  },

  // ── BOTTOM PERIMETER ROW ──
  {
    id: 9,
    title: 'Art Basel Modern Gala',
    image: '/images/events/modern-art-gala.jpg',
    className: 'left-[2.5%] bottom-[3%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float',
    delay: '1.6s',
    rotate: 'rotate-2',
    exitX: '-260px', exitY: '260px', exitRotate: '16deg',
    shadowHover: 'hover:shadow-pop-purple',
  },
  {
    id: 10,
    title: 'Interstellar in 70mm',
    image: '/images/events/interstellar-70mm.jpg',
    className: 'left-[21%] bottom-[2%] w-32 h-36 md:w-36 md:h-40 lg:w-40 lg:h-44 xl:w-44 xl:h-48 animate-luma-float-delayed',
    delay: '0.7s',
    rotate: '-rotate-2',
    exitX: '-120px', exitY: '280px', exitRotate: '-10deg',
    shadowHover: 'hover:shadow-toy-lg',
  },
  {
    id: 11,
    title: 'Blue Note Jazz Club',
    image: '/images/events/jazz-blues-night.jpg',
    className: 'right-[21%] bottom-[2%] w-32 h-36 md:w-36 md:h-40 lg:w-40 lg:h-44 xl:w-44 xl:h-48 animate-luma-float',
    delay: '2.4s',
    rotate: 'rotate-2',
    exitX: '120px', exitY: '280px', exitRotate: '10deg',
    shadowHover: 'hover:shadow-pop-azure',
  },
  {
    id: 12,
    title: 'Coachella Sunset Live',
    image: '/images/events/indie-acoustic.jpg',
    className: 'right-[2.5%] bottom-[3%] w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 animate-luma-float-delayed',
    delay: '1.1s',
    rotate: '-rotate-2',
    exitX: '260px', exitY: '260px', exitRotate: '-16deg',
    shadowHover: 'hover:shadow-pop-pink',
  },
];

export default function WelcomeDiscoveryPortal({ onDiscover, onExiting }) {
  const [isExiting, setIsExiting] = useState(false);
  const [morphTransform, setMorphTransform] = useState(null);
  const cardMorphRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleDiscoverClick = () => {
    if (isExiting) return;

    if (onExiting) onExiting();

    // Dynamically calculate exact morph coordinates to the hero card image on desktop
    try {
      const heroImg = document.querySelector("img[alt='Cyberpunk 2099 IMAX Premiere']");
      if (heroImg && cardMorphRef.current && window.innerWidth >= 1024) {
        const heroRect = heroImg.getBoundingClientRect();
        const cardRect = cardMorphRef.current.getBoundingClientRect();

        const heroCenterX = heroRect.left + heroRect.width / 2;
        const heroCenterY = heroRect.top + heroRect.height / 2;
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const dx = heroCenterX - cardCenterX;
        const dy = heroCenterY - cardCenterY;
        const scale = heroRect.width / cardRect.width;

        setMorphTransform({
          transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0px) scale(${scale.toFixed(3)})`,
          transition: 'transform 920ms cubic-bezier(0.16, 1, 0.3, 1)',
        });
      }
    } catch (e) {
      console.warn('Morph calculation error:', e);
    }

    setIsExiting(true);
    document.body.style.overflow = '';
    setTimeout(() => {
      onDiscover();
    }, 920);
  };

  return (
    <div
      className="fixed inset-0 z-[100] w-full min-h-screen bg-buttercream text-toy-black font-sans overflow-y-auto overflow-x-hidden selection:bg-bubble-pink selection:text-white"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity',
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

        {/* Playful Floating Neo-Memphis Micro-Decors in Negative Space */}
        <div className="hidden lg:block absolute left-[15%] top-[34%] pointer-events-none animate-pulse-slow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD200">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#1E1B2E" strokeWidth="2" />
          </svg>
        </div>
        <div className="hidden lg:block absolute right-[15%] top-[36%] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.2s' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF4081">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#1E1B2E" strokeWidth="2" />
          </svg>
        </div>
        <div className="hidden lg:block absolute left-[35%] bottom-[16%] pointer-events-none opacity-80 rotate-12">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#7928CA">
            <polygon points="10,0 12.5,7.5 20,10 12.5,12.5 10,20 7.5,12.5 0,10 7.5,7.5" stroke="#1E1B2E" strokeWidth="2" />
          </svg>
        </div>
        <div className="hidden lg:block absolute right-[35%] bottom-[16%] pointer-events-none opacity-80 -rotate-12">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#2EE59D">
            <polygon points="10,0 12.5,7.5 20,10 12.5,12.5 10,20 7.5,12.5 0,10 7.5,7.5" stroke="#1E1B2E" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* ─── MAIN HERO AREA ─── */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        
        {/* ── SCATTERED FLOATING POSTER CARDS (Desktop Constellation) ── */}
        <div className="absolute inset-0 pointer-events-none select-none hidden lg:block overflow-hidden">
          {CONSTELLATION_CARDS.map((card) => {
            const isLgMorph = card.isMorph;

            let cardExitStyle = {};
            if (isExiting) {
              if (isLgMorph) {
                cardExitStyle = {
                  transform: morphTransform ? morphTransform.transform : 'translate3d(-460px, -140px, 0px) scale(2.7)',
                  opacity: 1,
                  zIndex: 50,
                  transition: morphTransform ? morphTransform.transition : 'transform 920ms cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                  pointerEvents: 'none',
                };
              } else {
                cardExitStyle = {
                  transform: `translate3d(${card.exitX}, ${card.exitY}, 0px) rotate(${card.exitRotate}) scale(0.85)`,
                  opacity: 0,
                  transition: 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease-out',
                  willChange: 'transform, opacity',
                  pointerEvents: 'none',
                };
              }
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
                ref={isLgMorph ? cardMorphRef : undefined}
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
            transform: isExiting ? 'translate3d(0, -32px, 0) scale(1.02)' : 'translate3d(0, 0, 0) scale(1)',
            opacity: isExiting ? 0 : 1,
            transition: 'transform 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 550ms ease-out',
            willChange: 'transform, opacity',
            pointerEvents: isExiting ? 'none' : 'auto',
          }}
        >
          
          {/* Logo Minimalist Wordmark: eventhub */}
          <div className="inline-flex items-center gap-1 mb-2 select-none">
            <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-toy-black">
              eventhub
            </span>
          </div>

          {/* Social Proof Live Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-lilac-wash border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] mb-3 select-none hover:scale-105 transition-transform">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-pop opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-pop border border-toy-black"></span>
            </span>
            <span className="font-display font-black text-[10px] sm:text-xs text-toy-black uppercase tracking-wider">
              50,000+ Verified Passes Booked
            </span>
          </div>

          {/* Headline with Floating Decorative Stickers */}
          <div className="relative">
            {/* Left floating sticker */}
            <div className="hidden xl:flex absolute -left-20 top-8 items-center gap-1.5 px-3 py-1 rounded-2xl bg-sun-yellow border-2 border-toy-black shadow-toy rotate-[-7deg] pointer-events-none select-none float-balloon">
              <span className="text-xs">⚡</span>
              <span className="font-display font-black text-[10px] text-toy-black uppercase tracking-wide whitespace-nowrap">10-Min Hold</span>
            </div>

            {/* Right floating sticker */}
            <div className="hidden xl:flex absolute -right-20 top-10 items-center gap-1.5 px-3 py-1 rounded-2xl bg-bubble-pink text-white border-2 border-toy-black shadow-toy rotate-[6deg] pointer-events-none select-none float-sparkle">
              <span className="text-xs">🎟️</span>
              <span className="font-display font-black text-[10px] uppercase tracking-wide whitespace-nowrap">Instant QR</span>
            </div>

            <h1 className="font-display font-black text-5xl xs:text-6xl sm:text-7xl md:text-8xl text-toy-black tracking-tight leading-[1.04] text-center">
              Unforgettable <br />
              live moments <br />
              <span className="bg-gradient-to-r from-candy-purple via-bubble-pink to-sun-yellow bg-clip-text text-transparent">
                start here
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base md:text-lg font-body font-semibold text-toy-black/80 max-w-md sm:max-w-lg mx-auto leading-relaxed">
            Discover concerts, festivals, comedy, and cinema. Pick your exact seats in seconds and breeze through the gates.
          </p>

          {/* Primary Action Button */}
          <div className="mt-7 flex flex-col items-center w-full relative">
            <button
              type="button"
              onClick={handleDiscoverClick}
              className={`px-10 sm:px-12 py-3.5 sm:py-4 rounded-full font-display font-black text-base sm:text-lg border-[3px] border-toy-black shadow-toy-lg cursor-pointer flex items-center justify-center gap-2.5 select-none relative z-20 bg-sun-yellow hover:bg-[#FFE043] text-toy-black hover:shadow-pop-pink hover:scale-105 active:scale-95 transition-transform duration-200 ${
                isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
              }`}
              style={{
                transition: isExiting ? 'opacity 60ms ease-out, transform 60ms ease-out' : undefined,
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
                  transform: isExiting ? 'translate3d(0, -24px, 0) scale(0.85)' : 'translate3d(0, 0, 0) scale(1)',
                  opacity: isExiting ? 0 : 1,
                  transition: 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms ease-out',
                  willChange: 'transform, opacity',
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
    </div>
  );
}
