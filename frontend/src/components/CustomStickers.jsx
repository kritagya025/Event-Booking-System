import React from 'react';

/**
 * Authentic Neo-Memphis Vinyl Sticker Assets
 * High-voltage, chunky toy-black line art with pop colors, die-cut white rims, and hard 3D offset shadows.
 * Replaces default system OS emojis with brand-aligned graphic design assets.
 */

// 1. Neo-Memphis Die-Cut Balloon Sticker
export function BalloonSticker({ size = 60, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 120" 
      width={size} 
      height={Math.round(size * 1.2)} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      {/* Hard 3D Shadow */}
      <g transform="translate(5, 5)">
        <path d="M 47 70 Q 32 80 44 95 Q 52 105 38 114" fill="none" stroke="#1E1B2E" strokeWidth="7" strokeLinecap="round" />
        <path d="M 50 12 C 28 12 16 32 16 52 C 16 68 34 72 45 72 L 43 77 L 57 77 L 55 72 C 66 72 84 68 84 52 C 84 32 72 12 50 12 Z" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <path d="M 47 70 Q 32 80 44 95 Q 52 105 38 114" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
      <path 
        d="M 50 12 C 28 12 16 32 16 52 C 16 68 34 72 45 72 L 43 77 L 57 77 L 55 72 C 66 72 84 68 84 52 C 84 32 72 12 50 12 Z" 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />

      {/* Blue Wavy Ribbon String with Chunky Black Border */}
      <path d="M 47 70 Q 32 80 44 95 Q 52 105 38 114" fill="none" stroke="#1E1B2E" strokeWidth="5" strokeLinecap="round" />
      <path d="M 47 70 Q 32 80 44 95 Q 52 105 38 114" fill="none" stroke="#00E5FF" strokeWidth="2.8" strokeLinecap="round" />

      {/* Balloon Base: Vibrant Bubble Pink with Chunky 3.5px Toy-Black Border */}
      <path 
        d="M 50 14 C 30 14 18 33 18 52 C 18 67 36 70 46 70 L 44 76 L 56 76 L 54 70 C 64 70 82 67 82 52 C 82 33 70 14 50 14 Z" 
        fill="#FF4081" 
        stroke="#1E1B2E" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />

      {/* Tied Knot Accent */}
      <ellipse cx="50" cy="74" rx="5" ry="3" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />

      {/* Retro Comic Crescent Reflection (White Shine) */}
      <path d="M 68 28 C 76 37 76 52 69 60 C 67 56 68 44 63 36 C 61 32 64 29 68 28 Z" fill="#FFFFFF" />

      {/* Cute Micro Star Pin on Balloon */}
      <path d="M 36 28 Q 36 33 41 35 Q 36 37 36 42 Q 36 37 31 35 Q 36 33 36 28 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.8" />
    </svg>
  );
}

// 2. Neo-Memphis Pop-Art Disco Ball Sticker
export function DiscoBallSticker({ size = 60, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 110 110" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      {/* Hard 3D Offset Shadow */}
      <g transform="translate(5, 5)">
        <rect x="44" y="6" width="12" height="10" rx="3" fill="#1E1B2E" />
        <circle cx="50" cy="54" r="38" fill="#1E1B2E" />
        <path d="M 78 16 Q 78 28 90 28 Q 78 28 78 40 Q 78 28 66 28 Q 78 28 78 16 Z" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <circle cx="50" cy="54" r="41" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="4" />
      <rect x="42" y="4" width="16" height="14" rx="4" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" />
      <path 
        d="M 78 16 Q 78 28 90 28 Q 78 28 78 40 Q 78 28 66 28 Q 78 28 78 16 Z" 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />

      {/* Hanging Loop & Ring */}
      <circle cx="50" cy="9" r="6" fill="none" stroke="#1E1B2E" strokeWidth="3.5" />
      <rect x="44" y="10" width="12" height="8" rx="2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="3" />

      {/* Main Ball Body: Soft Lavender Base with 3.5px Chunky Toy-Black Border */}
      <circle cx="50" cy="54" r="38" fill="#F3EEFF" stroke="#1E1B2E" strokeWidth="3.5" />

      {/* Mirrored Facet Grid with Vibrant Neo-Memphis Pastel Blocks */}
      <g>
        {/* Row 1 */}
        <rect x="30" y="24" width="10" height="8" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="40" y="24" width="10" height="8" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="50" y="24" width="10" height="8" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="60" y="24" width="10" height="8" fill="#FF4081" stroke="#1E1B2E" strokeWidth="2.5" />

        {/* Row 2 */}
        <rect x="22" y="32" width="10" height="10" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="32" y="32" width="10" height="10" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="42" y="32" width="10" height="10" fill="#05FFA1" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="52" y="32" width="10" height="10" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="62" y="32" width="10" height="10" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="72" y="32" width="8" height="10" fill="#FF4081" stroke="#1E1B2E" strokeWidth="2.5" />

        {/* Row 3 */}
        <rect x="18" y="42" width="10" height="12" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="28" y="42" width="11" height="12" fill="#FF4081" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="39" y="42" width="11" height="12" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="50" y="42" width="11" height="12" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="61" y="42" width="11" height="12" fill="#05FFA1" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="72" y="42" width="10" height="12" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />

        {/* Row 4 */}
        <rect x="18" y="54" width="10" height="12" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="28" y="54" width="11" height="12" fill="#05FFA1" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="39" y="54" width="11" height="12" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="50" y="54" width="11" height="12" fill="#FF4081" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="61" y="54" width="11" height="12" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="72" y="54" width="10" height="12" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />

        {/* Row 5 */}
        <rect x="22" y="66" width="10" height="10" fill="#FF4081" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="32" y="66" width="10" height="10" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="42" y="66" width="10" height="10" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="52" y="66" width="10" height="10" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="62" y="66" width="10" height="10" fill="#05FFA1" stroke="#1E1B2E" strokeWidth="2.5" />

        {/* Row 6 */}
        <rect x="30" y="76" width="10" height="8" fill="#05FFA1" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="40" y="76" width="10" height="8" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="50" y="76" width="10" height="8" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
        <rect x="60" y="76" width="10" height="8" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.5" />
      </g>

      {/* Big Comic Starburst Glint */}
      <path 
        d="M 78 16 Q 78 28 90 28 Q 78 28 78 40 Q 78 28 66 28 Q 78 28 78 16 Z" 
        fill="#FFE142" 
        stroke="#1E1B2E" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      <circle cx="78" cy="28" r="3" fill="#FFFFFF" />
    </svg>
  );
}

// 3. Neo-Memphis Pop-Art Sparkles Burst Sticker
export function SparklesSticker({ size = 60, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      {/* Hard 3D Offset Shadow in Toy Black */}
      <g transform="translate(5, 5)">
        <path d="M 38 12 Q 38 20 46 22 Q 38 24 38 32 Q 38 24 30 22 Q 38 20 38 12 Z" fill="#1E1B2E" />
        <path d="M 22 42 Q 22 52 32 55 Q 22 58 22 68 Q 22 58 12 55 Q 22 52 22 42 Z" fill="#1E1B2E" />
        <path d="M 60 22 Q 60 46 84 50 Q 60 54 60 78 Q 60 54 36 50 Q 60 46 60 22 Z" fill="#1E1B2E" />
        <circle cx="78" cy="28" r="4" fill="#1E1B2E" />
        <circle cx="28" cy="28" r="3" fill="#1E1B2E" />
        <circle cx="76" cy="74" r="3.5" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <path 
        d="M 38 12 Q 38 20 46 22 Q 38 24 38 32 Q 38 24 30 22 Q 38 20 38 12 Z" 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 22 42 Q 22 52 32 55 Q 22 58 22 68 Q 22 58 12 55 Q 22 52 22 42 Z" 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 60 22 Q 60 46 84 50 Q 60 54 60 78 Q 60 54 36 50 Q 60 46 60 22 Z" 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="8" 
        strokeLinejoin="round" 
      />

      {/* Small Star Top: Mint Pop */}
      <path 
        d="M 38 12 Q 38 20 46 22 Q 38 24 38 32 Q 38 24 30 22 Q 38 20 38 12 Z" 
        fill="#05FFA1" 
        stroke="#1E1B2E" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      <circle cx="38" cy="22" r="2" fill="#FFFFFF" />

      {/* Medium Star Bottom: Bubble Pink */}
      <path 
        d="M 22 42 Q 22 52 32 55 Q 22 58 22 68 Q 22 58 12 55 Q 22 52 22 42 Z" 
        fill="#FF4081" 
        stroke="#1E1B2E" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      <circle cx="22" cy="55" r="2.5" fill="#FFFFFF" />

      {/* Big Center Star: Sun Yellow with Center Core */}
      <path 
        d="M 60 22 Q 60 46 84 50 Q 60 54 60 78 Q 60 54 36 50 Q 60 46 60 22 Z" 
        fill="#FFE142" 
        stroke="#1E1B2E" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />
      <circle cx="60" cy="50" r="5" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="2" />

      {/* Pop Accent Dots */}
      <circle cx="78" cy="28" r="4" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.5" />
      <circle cx="28" cy="28" r="3" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2" />
      <circle cx="76" cy="74" r="3.5" fill="#FF4081" stroke="#1E1B2E" strokeWidth="2" />
    </svg>
  );
}

// 4. Neo-Memphis Bespoke Admission Ticket Sticker
export function TicketSticker({ size = 32, className = '', style = {}, tilted = true }) {
  const ticketPath = "M 16 10 L 32 10 A 4 4 0 0 0 40 10 L 84 10 A 6 6 0 0 1 90 16 L 90 28 A 7 7 0 0 0 90 42 L 90 54 A 6 6 0 0 1 84 60 L 40 60 A 4 4 0 0 0 32 60 L 16 60 A 6 6 0 0 1 10 54 L 10 42 A 7 7 0 0 0 10 28 L 10 16 A 6 6 0 0 1 16 10 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 104 76" 
      width={size} 
      height={Math.round(size * 0.73)} 
      className={`inline-block select-none overflow-visible ${className}`}
      style={style}
    >
      <defs>
        {/* Vibrant Candy Pink Gradient */}
        <linearGradient id="ticketPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF66A6" />
          <stop offset="50%" stopColor="#FF3385" />
          <stop offset="100%" stopColor="#E60067" />
        </linearGradient>

        {/* Golden VIP Star Gradient */}
        <linearGradient id="starGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="100%" stopColor="#FFD000" />
        </linearGradient>
      </defs>

      <g transform={tilted ? "rotate(-7 52 35)" : undefined}>
        {/* Hard 3D Offset Shadow in Toy Black */}
        <g transform="translate(4, 4)">
          <path d={ticketPath} fill="#1E1B2E" />
        </g>

        {/* White Die-Cut Vinyl Sticker Border */}
        <path 
          d={ticketPath} 
          fill="#FFFFFF" 
          stroke="#FFFFFF" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />

        {/* Main Ticket Base: Bubble Pink with Chunky 3.2px Toy-Black Border */}
        <path 
          d={ticketPath} 
          fill="url(#ticketPinkGrad)" 
          stroke="#1E1B2E" 
          strokeWidth="3.2" 
          strokeLinejoin="round" 
        />

        {/* Perforation Punchline */}
        <line 
          x1="36" y1="12" 
          x2="36" y2="58" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          strokeDasharray="3 2.5" 
          strokeLinecap="round" 
          opacity="0.95" 
        />

        {/* Stub Details (Left Side): Barcode Stripe Lines */}
        <line x1="20" y1="21" x2="20" y2="49" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
        <line x1="25" y1="25" x2="25" y2="45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="29" y1="20" x2="29" y2="50" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />

        {/* Main Body (Right Side): Golden VIP Four-Point Star */}
        <path 
          d="M 63 21 Q 63 35 77 35 Q 63 35 63 49 Q 63 35 49 35 Q 63 35 63 21 Z" 
          fill="url(#starGoldGrad)" 
          stroke="#1E1B2E" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />

        {/* Center Star Core Sparkle */}
        <circle cx="63" cy="35" r="3" fill="#FFFFFF" />

        {/* Retro High-Gloss Specular Shine Arc */}
        <path 
          d="M 18 13 L 82 13 C 84 13 85 14 85 16 C 85 17 84 18 82 18 L 18 18 C 16 18 15 17 15 16 C 15 14 16 13 18 13 Z" 
          fill="#FFFFFF" 
          opacity="0.75" 
        />

        {/* Cute Micro Accents */}
        <circle cx="80" cy="24" r="1.8" fill="#FFFFFF" opacity="0.85" />
        <circle cx="80" cy="46" r="1.8" fill="#FFFFFF" opacity="0.85" />
      </g>
    </svg>
  );
}

// 5. Neo-Memphis Custom Arcade Joystick Sticker (High-Level Vector Asset)
export function ArcadeJoystickSticker({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Ball Knob Gradient */}
        <radialGradient id="joystickKnobGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FF77A9" />
          <stop offset="45%" stopColor="#FF4081" />
          <stop offset="100%" stopColor="#C2185B" />
        </radialGradient>
        {/* Chrome Shaft Gradient */}
        <linearGradient id="joystickShaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B0BEC5" />
          <stop offset="35%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#ECEFF1" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
        {/* Base Rim Gradient */}
        <linearGradient id="joystickBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE142" />
          <stop offset="100%" stopColor="#F5B700" />
        </linearGradient>
      </defs>

      {/* 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        {/* Base Plate Shadow */}
        <ellipse cx="50" cy="78" rx="36" ry="14" fill="#1E1B2E" />
        <path d="M 44 45 L 47 70 L 53 70 L 56 45 Z" fill="#1E1B2E" />
        <circle cx="50" cy="32" r="22" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <ellipse cx="50" cy="78" rx="38" ry="16" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M 42 42 L 45 74 L 55 74 L 58 42 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="50" cy="32" r="24" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="4" />

      {/* Mounting Bezel Base */}
      <ellipse cx="50" cy="78" rx="34" ry="13" fill="url(#joystickBaseGrad)" stroke="#1E1B2E" strokeWidth="3.5" />
      
      {/* Base Inner Ring / Dust Washer */}
      <ellipse cx="50" cy="76" rx="20" ry="7" fill="#1E1B2E" />
      <ellipse cx="50" cy="75" rx="14" ry="4.5" fill="#37474F" />

      {/* Chrome Shaft */}
      <path 
        d="M 46 36 L 47 72 L 53 72 L 54 36 Z" 
        fill="url(#joystickShaftGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />

      {/* Ball-Top Knob */}
      <circle 
        cx="50" 
        cy="32" 
        r="20" 
        fill="url(#joystickKnobGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.5" 
      />

      {/* High-Gloss Specular Highlight */}
      <ellipse cx="44" cy="24" rx="6.5" ry="4" transform="rotate(-25 44 24)" fill="#FFFFFF" opacity="0.9" />
      <circle cx="54" cy="36" r="2.2" fill="#FFFFFF" opacity="0.6" />

      {/* Dynamic Action / Motion Accent Rays */}
      <path d="M 22 20 Q 28 26 25 35" fill="none" stroke="#FFE142" strokeWidth="3" strokeLinecap="round" />
      <path d="M 78 20 Q 72 26 75 35" fill="none" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
      
      {/* Micro Star Accent */}
      <path d="M 80 14 Q 80 18 84 20 Q 80 22 80 26 Q 80 22 76 20 Q 80 18 80 14 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.5" />
    </svg>
  );
}

// 6. Neo-Memphis Custom Airborne / Booster Sticker (High-Level Vector Asset)
export function AirborneBoosterSticker({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Rocket Body Gradient */}
        <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#05FFA1" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        {/* Flame Gradient */}
        <linearGradient id="rocketFlameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FFE142" />
          <stop offset="70%" stopColor="#FF9100" />
          <stop offset="100%" stopColor="#FF4081" />
        </linearGradient>
      </defs>

      {/* 3D Offset Shadow (Rotated 45 degrees for launch trajectory) */}
      <g transform="translate(4, 4)">
        {/* Exhaust Flame Shadow */}
        <path d="M 28 72 Q 18 88 12 94 Q 26 86 36 78 Z" fill="#1E1B2E" />
        {/* Fin Shadows */}
        <path d="M 32 52 L 20 68 L 38 66 Z" fill="#1E1B2E" />
        <path d="M 54 34 L 70 48 L 50 52 Z" fill="#1E1B2E" />
        {/* Main Fuselage Shadow */}
        <path d="M 78 18 C 66 32 44 48 34 68 C 30 72 38 78 44 74 C 64 64 80 42 88 28 C 90 20 86 16 78 18 Z" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <g stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="#FFFFFF">
        <path d="M 28 72 Q 16 88 10 94 Q 26 86 38 76 Z" />
        <path d="M 32 52 L 18 70 L 40 68 Z" />
        <path d="M 54 34 L 72 50 L 50 54 Z" />
        <path d="M 78 18 C 66 32 44 48 34 68 C 30 72 38 78 44 74 C 64 64 80 42 88 28 C 90 20 86 16 78 18 Z" />
      </g>

      {/* Rocket Booster Flame */}
      <path 
        d="M 34 68 Q 18 84 10 94 Q 24 82 38 74 Z" 
        fill="url(#rocketFlameGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      {/* Inner Hot Core Flame */}
      <path d="M 31 70 Q 22 80 18 86 Q 26 78 35 72 Z" fill="#FFFFFF" />

      {/* Left Stabilizer Wing (Bubble Pink) */}
      <path 
        d="M 33 54 L 18 69 L 39 67 Z" 
        fill="#FF4081" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />
      
      {/* Right Stabilizer Wing (Bubble Pink) */}
      <path 
        d="M 53 34 L 71 49 L 51 53 Z" 
        fill="#FF4081" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />

      {/* Rocket Fuselage Body */}
      <path 
        d="M 76 18 C 64 32 43 49 34 67 C 31 71 38 76 43 73 C 63 63 80 43 86 28 C 88 21 83 16 76 18 Z" 
        fill="url(#rocketBodyGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />

      {/* Nose Cone Cap (Sun Yellow) */}
      <path 
        d="M 76 18 C 73 21 78 28 86 28 C 88 21 83 16 76 18 Z" 
        fill="#FFE142" 
        stroke="#1E1B2E" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />

      {/* Astronaut Porthole Window */}
      <circle cx="58" cy="42" r="8" fill="#1E1B2E" />
      <circle cx="58" cy="42" r="6" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M 55 39 Q 58 37 61 39" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

      {/* Speed Motion Lines */}
      <line x1="88" y1="46" x2="96" y2="52" stroke="#FFE142" strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="62" x2="88" y2="70" stroke="#05FFA1" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Propulsion Star Burst */}
      <path d="M 12 70 Q 12 73 15 74 Q 12 75 12 78 Q 12 75 9 74 Q 12 73 12 70 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.2" />
    </svg>
  );
}

// 7. Neo-Memphis Custom Super Spring Jump Sticker (High-Level Vector Asset)
export function SpringJumpSticker({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="springCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FFE142" />
        </linearGradient>
        <linearGradient id="springCoilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#05FFA1" />
          <stop offset="100%" stopColor="#00B0FF" />
        </linearGradient>
      </defs>

      {/* 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        {/* Base plate shadow */}
        <ellipse cx="50" cy="84" rx="34" ry="9" fill="#1E1B2E" />
        {/* Coils shadow */}
        <path d="M 28 50 Q 50 42 72 50 Q 50 60 28 68 Q 50 78 72 78" fill="none" stroke="#1E1B2E" strokeWidth="8" strokeLinecap="round" />
        {/* Cap shadow */}
        <ellipse cx="50" cy="32" rx="32" ry="11" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <ellipse cx="50" cy="84" rx="36" ry="11" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" />
      <path d="M 28 50 Q 50 42 72 50 Q 50 60 28 68 Q 50 78 72 78" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
      <ellipse cx="50" cy="32" rx="34" ry="13" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" />

      {/* Heavy Base Anchor Plate */}
      <ellipse cx="50" cy="84" rx="32" ry="8" fill="#1E1B2E" />
      <ellipse cx="50" cy="82" rx="28" ry="6" fill="#37474F" stroke="#1E1B2E" strokeWidth="2.5" />

      {/* Coiled Heavy Compression Spring */}
      <path 
        d="M 28 50 Q 50 42 72 50 Q 50 58 28 66 Q 50 74 72 80" 
        fill="none" 
        stroke="#1E1B2E" 
        strokeWidth="9" 
        strokeLinecap="round" 
      />
      <path 
        d="M 28 50 Q 50 42 72 50 Q 50 58 28 66 Q 50 74 72 80" 
        fill="none" 
        stroke="url(#springCoilGrad)" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
      />

      {/* Top Bouncing Launch Platform */}
      <ellipse cx="50" cy="34" rx="30" ry="10" fill="#F59E0B" />
      <ellipse cx="50" cy="30" rx="30" ry="10" fill="url(#springCapGrad)" stroke="#1E1B2E" strokeWidth="3.5" />

      {/* Upward Thrust Chevron Accent */}
      <path d="M 40 32 L 50 25 L 60 32" fill="none" stroke="#FF4081" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 43 36 L 50 31 L 57 36" fill="none" stroke="#1E1B2E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Kinetic Blast Motion Lines & Star */}
      <line x1="20" y1="20" x2="24" y2="12" stroke="#FFE142" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="16" x2="50" y2="8" stroke="#05FFA1" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="80" y1="20" x2="76" y2="12" stroke="#FF4081" strokeWidth="3" strokeLinecap="round" />

      {/* Micro Star Flare */}
      <path d="M 78 8 Q 78 12 82 13 Q 78 14 78 18 Q 78 14 74 13 Q 78 12 78 8 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.2" />
    </svg>
  );
}

// 8. Neo-Memphis Custom Popcorn Bucket Sticker (High-Level Vector Asset)
export function PopcornBucketSticker({ size = 32, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 110" 
      width={size} 
      height={Math.round(size * 1.1)} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="popcornButterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="50%" stopColor="#FFE142" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        {/* Bucket Shadow */}
        <path d="M 22 45 L 30 92 L 70 92 L 78 45 Z" fill="#1E1B2E" />
        {/* Puffed Popcorn Mound Shadow */}
        <path d="M 20 46 C 14 38 18 22 30 20 C 34 10 50 8 60 16 C 72 10 86 24 82 40 C 86 46 78 52 70 48 Z" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Sticker Outline */}
      <g stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="#FFFFFF">
        <path d="M 22 45 L 30 92 L 70 92 L 78 45 Z" />
        <path d="M 20 46 C 14 36 18 20 30 18 C 34 8 50 6 60 14 C 72 8 86 22 82 38 C 86 44 78 50 70 46 Z" />
      </g>

      {/* Popcorn Tub Body (White Base with Heavy 3.2px Toy-Black Border) */}
      <path 
        d="M 22 45 L 30 92 L 70 92 L 78 45 Z" 
        fill="#FFFFFF" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />

      {/* Bold Bubble-Pink / Crimson Vertical Stripes */}
      {/* Stripe 1 */}
      <path d="M 33 45 L 38 92 L 44 92 L 41 45 Z" fill="#FF4081" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Stripe 2 (Center) */}
      <path d="M 47 45 L 48 92 L 53 92 L 54 45 Z" fill="#FF4081" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Stripe 3 */}
      <path d="M 60 45 L 58 92 L 64 92 L 68 45 Z" fill="#FF4081" stroke="#1E1B2E" strokeWidth="1.8" />

      {/* Yellow Rim Collar Band */}
      <path 
        d="M 20 43 L 80 43 L 78 49 L 22 49 Z" 
        fill="#FFE142" 
        stroke="#1E1B2E" 
        strokeWidth="2.8" 
        strokeLinejoin="round" 
      />

      {/* Center Golden Star Badge on Bucket Rim */}
      <circle cx="50" cy="46" r="3.5" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.5" />
      <path d="M 50 43.5 L 51 45 L 52.5 45 L 51.2 46 L 51.8 47.5 L 50 46.5 L 48.2 47.5 L 48.8 46 L 47.5 45 L 49 45 Z" fill="#FF4081" />

      {/* Fluffy Overflowing Buttered Popcorn Mound */}
      <g stroke="#1E1B2E" strokeWidth="2.8" strokeLinejoin="round" fill="url(#popcornButterGrad)">
        {/* Left Kernels */}
        <circle cx="26" cy="38" r="9" />
        <circle cx="34" cy="28" r="9.5" />
        {/* Center High Puffs */}
        <circle cx="48" cy="20" r="11" />
        <circle cx="62" cy="25" r="10" />
        {/* Right Kernels */}
        <circle cx="74" cy="36" r="9" />
        {/* Front Spill Kernel */}
        <circle cx="42" cy="34" r="8.5" />
        <circle cx="58" cy="35" r="8" />
      </g>

      {/* Popcorn Fluff Indentation & Butter Accents */}
      <path d="M 23 38 Q 26 34 29 38" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 44 20 Q 48 16 52 20" fill="none" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 58 24 Q 62 21 66 25" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 70 35 Q 74 32 77 36" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

      {/* Butter Gloss Specular Glints */}
      <circle cx="45" cy="16" r="2.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="31" cy="24" r="1.8" fill="#FFFFFF" opacity="0.9" />
      <circle cx="65" cy="21" r="1.8" fill="#FFFFFF" opacity="0.9" />

      {/* Floating Sparkle Micro-Star */}
      <path d="M 86 16 Q 86 19 89 20 Q 86 21 86 24 Q 86 21 83 20 Q 86 19 86 16 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.2" />
    </svg>
  );
}

// 9. Neo-Memphis Bespoke Circus / Festival Big Top Tent Sticker (High-Level Vector Asset)
export function CircusTentSticker({ size = 32, className = '', style = {} }) {
  // Outline paths for 3D shadow and die-cut border
  const tentOutline = "M 50 20 C 50 20 40 34 18 50 L 22 86 L 78 86 L 82 50 C 60 34 50 20 50 20 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none overflow-visible ${className}`}
      style={style}
    >
      <defs>
        {/* Candy Pink Roof Gradient */}
        <linearGradient id="tentPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF66A6" />
          <stop offset="50%" stopColor="#FF3385" />
          <stop offset="100%" stopColor="#D8005A" />
        </linearGradient>

        {/* Golden Pennant & Accent Gradient */}
        <linearGradient id="tentGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FFE142" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>

        {/* Soft Lilac White Gradient for White Stripes */}
        <linearGradient id="tentWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0EBF8" />
        </linearGradient>

        {/* Doorway Interior Stage Light */}
        <linearGradient id="tentDoorGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FFE142" />
          <stop offset="30%" stopColor="#FF4081" />
          <stop offset="75%" stopColor="#1E1B2E" />
        </linearGradient>
      </defs>

      {/* 3D Offset Hard Shadow in Toy Black */}
      <g transform="translate(4, 4)">
        {/* Tent Body Shadow */}
        <path d={tentOutline} fill="#1E1B2E" />
        {/* Flag Pole Shadow */}
        <polygon points="50,7 67,12 50,18" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Vinyl Sticker Border */}
      <g stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="#FFFFFF">
        <path d={tentOutline} />
        <polygon points="50,7 67,12 50,18" />
        <line x1="50" y1="6" x2="50" y2="22" stroke="#FFFFFF" strokeWidth="6" />
      </g>

      {/* ─── TENT LOWER BASE / WALLS ─── */}
      {/* Wall Baseplate */}
      <path 
        d="M 21 50 L 23 86 L 77 86 L 79 50 Z" 
        fill="#FFFFFF" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />

      {/* Vertical Wall Stripes (Candy Pink and Buttercream White) */}
      {/* Left Wall Pink Stripe */}
      <polygon points="21,50 23,86 35,86 34,50" fill="url(#tentPinkGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Mid-Left Wall White Stripe */}
      <polygon points="34,50 35,86 43,86 43,50" fill="url(#tentWhiteGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Mid-Right Wall White Stripe */}
      <polygon points="57,50 57,86 65,86 66,50" fill="url(#tentWhiteGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Right Wall Pink Stripe */}
      <polygon points="66,50 65,86 77,86 79,50" fill="url(#tentPinkGrad)" stroke="#1E1B2E" strokeWidth="1.8" />

      {/* Ground Foundation Rim in Sun-Yellow */}
      <rect x="20" y="84" width="60" height="4" rx="2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.2" />

      {/* ─── ARCHED ENTRANCE PORTAL / BIG TOP GATE ─── */}
      {/* Deep Stage Void */}
      <path 
        d="M 41 86 L 41 68 C 41 62 59 62 59 68 L 59 86 Z" 
        fill="url(#tentDoorGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="2.6" 
      />

      {/* VIP Entrance Red Carpet Runner leading out */}
      <polygon points="45,86 43,90 57,90 55,86" fill="#FF4081" stroke="#1E1B2E" strokeWidth="1.5" />

      {/* Draped Curtains Tied Back with Golden Tassels */}
      {/* Left Curtain */}
      <path d="M 41 68 Q 45 74 39 82 L 41 86 Q 47 78 43 68 Z" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="1.6" />
      <circle cx="40" cy="77" r="2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1" />

      {/* Right Curtain */}
      <path d="M 59 68 Q 55 74 61 82 L 59 86 Q 53 78 57 68 Z" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="1.6" />
      <circle cx="60" cy="77" r="2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1" />

      {/* ─── BIG TOP CANOPY / CONICAL STRIPED ROOF ─── */}
      {/* Conical Roof Base */}
      <path 
        d="M 50 20 C 50 20 38 34 17 50 Q 50 54 83 50 C 62 34 50 20 50 20 Z" 
        fill="#FFFFFF" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />

      {/* Roof Wedge Stripes */}
      {/* Outer Left Pink Wedge */}
      <path d="M 50 20 C 42 28 30 38 17 50 Q 24 52 30 52 C 40 38 48 24 50 20 Z" fill="url(#tentPinkGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Mid Left White Wedge */}
      <path d="M 50 20 C 48 24 40 38 30 52 Q 37 53 43 53 C 48 40 50 22 50 20 Z" fill="url(#tentWhiteGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Center Pink Crown Wedge */}
      <path d="M 50 20 C 50 22 43 40 43 53 Q 50 54 57 53 C 57 40 50 22 50 20 Z" fill="url(#tentPinkGrad)" stroke="#1E1B2E" strokeWidth="2" />
      {/* Mid Right White Wedge */}
      <path d="M 50 20 C 50 22 52 40 57 53 Q 63 53 70 52 C 60 38 52 24 50 20 Z" fill="url(#tentWhiteGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Outer Right Pink Wedge */}
      <path d="M 50 20 C 52 24 60 38 70 52 Q 76 52 83 50 C 70 38 58 28 50 20 Z" fill="url(#tentPinkGrad)" stroke="#1E1B2E" strokeWidth="1.8" />

      {/* ─── SCALLOPED AWNING FLOUNDER / RUFFLED EAVES ─── */}
      <g stroke="#1E1B2E" strokeWidth="2.2" strokeLinejoin="round">
        {/* Scallop 1 (Leftmost) */}
        <path d="M 17 50 Q 23.5 57 30 52" fill="#FFE142" />
        {/* Scallop 2 */}
        <path d="M 30 52 Q 36.5 58 43 53" fill="#FFFFFF" />
        {/* Scallop 3 (Center) */}
        <path d="M 43 53 Q 50 59 57 53" fill="#FFE142" />
        {/* Scallop 4 */}
        <path d="M 57 53 Q 63.5 58 70 52" fill="#FFFFFF" />
        {/* Scallop 5 (Rightmost) */}
        <path d="M 70 52 Q 76.5 57 83 50" fill="#FFE142" />
      </g>

      {/* ─── TOP PEAK FLAGPOLE & GOLDEN PENNANT ─── */}
      {/* Flagpole Mast in Toy Black */}
      <line x1="50" y1="6" x2="50" y2="22" stroke="#1E1B2E" strokeWidth="2.8" strokeLinecap="round" />
      {/* Golden Ball Finial */}
      <circle cx="50" cy="6" r="3" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.8" />

      {/* Waving Golden VIP Pennant */}
      <path 
        d="M 50 7 Q 60 10 67 12 Q 58 15 50 18 Z" 
        fill="url(#tentGoldGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />

      {/* Specular Highlights & Glints on Roof */}
      <circle cx="48" cy="24" r="1.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="46" cy="32" r="1.8" fill="#FFFFFF" opacity="0.8" />

      {/* Floating Sparkle Micro-Stars */}
      <path d="M 12 36 Q 12 38 14 39 Q 12 40 12 42 Q 12 40 10 39 Q 12 38 12 36 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1" />
      <path d="M 86 32 Q 86 34 88 35 Q 86 36 86 38 Q 86 36 84 35 Q 86 34 86 32 Z" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1" />
    </svg>
  );
}

// 10. Neo-Memphis VIP Cinema Seat Sticker
export function CinemaSeatSticker({ size = 36, className = '', style = {} }) {
  const seatOutline = "M 32 8 C 32 6 36 4 42 4 L 58 4 C 64 4 68 6 68 8 L 68 18 C 74 18 78 22 78 28 L 78 44 C 84 44 88 47 88 52 L 88 64 C 88 68 84 72 78 72 L 78 74 C 78 77 75 80 71 80 L 58 80 L 58 84 L 70 84 C 73 84 75 86 75 89 C 75 92 73 94 70 94 L 30 94 C 27 94 25 92 25 89 C 25 86 27 84 30 84 L 42 84 L 42 80 L 29 80 C 25 80 22 77 22 74 L 22 72 C 16 72 12 68 12 64 L 12 52 C 12 47 16 44 22 44 L 22 28 C 22 22 26 18 32 18 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="seatBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF70A6" />
          <stop offset="100%" stopColor="#FF1475" />
        </linearGradient>
        <linearGradient id="seatCushionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF85B3" />
          <stop offset="100%" stopColor="#E60067" />
        </linearGradient>
        <linearGradient id="seatHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#00B4D8" />
        </linearGradient>
        <linearGradient id="seatGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
      </defs>

      {/* Hard 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        <path d={seatOutline} fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Vinyl Outline */}
      <path 
        d={seatOutline} 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />

      {/* ─── BASE PEDESTAL ─── */}
      <rect x="29" y="85" width="42" height="7" rx="3.5" fill="#FFE142" stroke="#1E1B2E" strokeWidth="2.8" />
      <rect x="44" y="74" width="12" height="13" rx="2" fill="#1E1B2E" />

      {/* ─── HIGH BACKREST ─── */}
      <rect x="27" y="16" width="46" height="42" rx="9" fill="url(#seatBackGrad)" stroke="#1E1B2E" strokeWidth="3" />
      {/* Quilted Fluting Seams */}
      <line x1="42" y1="18" x2="42" y2="54" stroke="#1E1B2E" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="58" y1="18" x2="58" y2="54" stroke="#1E1B2E" strokeWidth="2.2" strokeLinecap="round" />

      {/* ─── PLUSH ERGONOMIC HEADREST ─── */}
      <rect x="31" y="6" width="38" height="14" rx="7" fill="url(#seatHeadGrad)" stroke="#1E1B2E" strokeWidth="2.8" />
      {/* Specular Glint on Headrest */}
      <rect x="36" y="8" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.85" />
      {/* VIP Star on Headrest */}
      <polygon points="59,10 60,12 62,12 60.5,13.5 61,15.5 59,14 57,15.5 57.5,13.5 56,12 58,12" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />

      {/* ─── SEAT BUCKET / BOTTOM CUSHION ─── */}
      <path 
        d="M 23 54 C 23 52 25 50 28 50 L 72 50 C 75 50 77 52 77 54 L 75 68 C 74 72 70 75 66 75 L 34 75 C 30 75 26 72 25 68 Z" 
        fill="url(#seatCushionGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />
      {/* Front Cushion Roll */}
      <path d="M 27 65 Q 50 72 73 65" fill="none" stroke="#1E1B2E" strokeWidth="2" strokeLinecap="round" />

      {/* ─── LEFT ARMREST ─── */}
      <rect x="15" y="44" width="8" height="22" rx="4" fill="#1E1B2E" />
      <rect x="13" y="41" width="13" height="6" rx="3" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.2" />

      {/* ─── RIGHT ARMREST & SODA CUP HOLDER ─── */}
      <rect x="77" y="44" width="8" height="22" rx="4" fill="#1E1B2E" />
      <rect x="74" y="41" width="13" height="6" rx="3" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="2.2" />

      {/* Popcorn-Theater Soda Cup */}
      <polygon points="81,33 91,33 89,45 83,45" fill="url(#seatGoldGrad)" stroke="#1E1B2E" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="82,37 90,37 89,41 83,41" fill="#FF1475" />
      <ellipse cx="86" cy="33" rx="5" ry="1.8" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="1.8" />
      {/* Bent Straw */}
      <path d="M 86 33 L 87 25 L 92 23" fill="none" stroke="#FF1475" strokeWidth="2.2" strokeLinecap="round" />

      {/* ─── SPECULAR GLOSS & SPARKLES ─── */}
      <circle cx="33" cy="24" r="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="30" cy="32" r="1.5" fill="#FFFFFF" opacity="0.6" />
      <polygon points="18,18 19.5,21 22,22 19.5,23 18,26 16.5,23 14,22 16.5,21" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
    </svg>
  );
}

// 11. Neo-Memphis Cryptographic Security Shield Sticker
export function SecurityShieldSticker({ size = 36, className = '', style = {} }) {
  const shieldOutline = "M 50 6 C 74 6 88 13 88 22 C 88 58 70 84 50 94 C 30 84 12 58 12 22 C 12 13 26 6 50 6 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="shieldPurpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9B72FC" />
          <stop offset="100%" stopColor="#6C2DE8" />
        </linearGradient>
        <linearGradient id="shieldCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#0099C6" />
        </linearGradient>
        <linearGradient id="shieldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
      </defs>

      {/* Hard 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        <path d={shieldOutline} fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Vinyl Outline */}
      <path 
        d={shieldOutline} 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />

      {/* ─── DUAL SPLIT SHIELD BODY ─── */}
      {/* Left Purple Half */}
      <path 
        d="M 50 9 C 30 9 16 15 16 23 C 16 55 33 79 50 89 L 50 9 Z" 
        fill="url(#shieldPurpleGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />
      {/* Right Cyan Half */}
      <path 
        d="M 50 9 C 70 9 84 15 84 23 C 84 55 67 79 50 89 L 50 9 Z" 
        fill="url(#shieldCyanGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />
      {/* Center Dividing Toy-Black Spine */}
      <line x1="50" y1="9" x2="50" y2="89" stroke="#1E1B2E" strokeWidth="2.6" />

      {/* Translucent Glossy Slashed Highlights */}
      <polygon points="20,24 35,13 26,45 18,42" fill="#FFFFFF" opacity="0.32" />
      <polygon points="50,13 65,13 54,34 50,34" fill="#FFFFFF" opacity="0.22" />

      {/* Golden Rivet Studs */}
      <circle cx="25" cy="22" r="3.2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.6" />
      <circle cx="75" cy="22" r="3.2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.6" />
      <circle cx="23" cy="46" r="3.2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.6" />
      <circle cx="77" cy="46" r="3.2" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.6" />

      {/* ─── CENTRAL CRYPTOGRAPHIC EMBLEM: GOLDEN PADLOCK ─── */}
      <path 
        d="M 40 44 C 40 33 60 33 60 44 L 60 51 L 40 51 Z" 
        fill="#FFFFFF" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
      />
      <rect x="33" y="49" width="34" height="26" rx="7" fill="url(#shieldGoldGrad)" stroke="#1E1B2E" strokeWidth="3" />
      <circle cx="50" cy="58" r="3.5" fill="#1E1B2E" />
      <polygon points="48,58 52,58 53.5,67 46.5,67" fill="#1E1B2E" />
      <rect x="38" y="52" width="10" height="3" rx="1.5" fill="#FFFFFF" opacity="0.8" />

      {/* Floating Sparkle Micro-Stars */}
      <polygon points="85,10 86.5,13 89,14 86.5,15 85,18 83.5,15 81,14 83.5,13" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
      <polygon points="13,70 14.5,72 17,73 14.5,74 13,76 11.5,74 9,73 11.5,72" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
    </svg>
  );
}

// 12. Neo-Memphis Instant UPI & Rupee Payment Card Sticker
export function PaymentCardSticker({ size = 36, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="cardMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#05FFA1" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>
        <linearGradient id="cardChipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
        <linearGradient id="cardBadgePink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4081" />
          <stop offset="100%" stopColor="#D81B60" />
        </linearGradient>
      </defs>

      {/* Hard 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        <rect x="13" y="18" width="74" height="64" rx="12" fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Vinyl Outline */}
      <rect 
        x="13" 
        y="18" 
        width="74" 
        height="64" 
        rx="12" 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />

      {/* Card Body in Mint-Cyan Gradient */}
      <rect 
        x="13" 
        y="18" 
        width="74" 
        height="64" 
        rx="12" 
        fill="url(#cardMintGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
      />

      {/* Translucent Neo Wave Banner */}
      <path d="M 13 46 Q 50 36 87 50 L 87 64 Q 50 50 13 60 Z" fill="#00B8D4" opacity="0.35" />

      {/* ─── GOLDEN EMV SMART CHIP ─── */}
      <rect x="22" y="32" width="18" height="15" rx="3.5" fill="url(#cardChipGrad)" stroke="#1E1B2E" strokeWidth="2.2" />
      <line x1="22" y1="39.5" x2="40" y2="39.5" stroke="#1E1B2E" strokeWidth="1.6" />
      <line x1="31" y1="32" x2="31" y2="47" stroke="#1E1B2E" strokeWidth="1.6" />
      <rect x="26.5" y="36.5" width="9" height="6" rx="1.5" fill="none" stroke="#1E1B2E" strokeWidth="1.4" />

      {/* ─── CONTACTLESS NFC WAVES ─── */}
      <path d="M 45 35 A 7 7 0 0 1 45 45" fill="none" stroke="#1E1B2E" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 49 31 A 12 12 0 0 1 49 49" fill="none" stroke="#1E1B2E" strokeWidth="2.2" strokeLinecap="round" />

      {/* ─── INDIAN RUPEE HOLOGRAM SEAL ─── */}
      <circle cx="73" cy="33" r="9.5" fill="url(#cardBadgePink)" stroke="#1E1B2E" strokeWidth="2.2" />
      <path 
        d="M 69 28 L 77 28 M 69 31 L 76 31 M 70 28 C 74 28 75 35 70.5 35 L 69 35 L 76 40" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* ─── EMBOSSED CARD NUMBER DOTS ─── */}
      <circle cx="23" cy="57" r="2" fill="#1E1B2E" />
      <circle cx="29" cy="57" r="2" fill="#1E1B2E" />
      <circle cx="35" cy="57" r="2" fill="#1E1B2E" />
      <circle cx="45" cy="57" r="2" fill="#1E1B2E" />
      <circle cx="51" cy="57" r="2" fill="#1E1B2E" />
      <circle cx="57" cy="57" r="2" fill="#1E1B2E" />
      <rect x="67" y="55" width="13" height="4" rx="2" fill="#1E1B2E" />

      {/* ─── BOTTOM DETAILS / CARDHOLDER & EXPIRY ─── */}
      <rect x="22" y="67" width="28" height="4" rx="2" fill="#1E1B2E" />
      <rect x="58" y="67" width="14" height="4" rx="2" fill="#1E1B2E" />

      {/* Specular Diagonal Sheen */}
      <polygon points="15,20 46,20 22,70 15,70" fill="#FFFFFF" opacity="0.3" />

      {/* Floating Sparkle Micro-Stars */}
      <polygon points="9,14 10.5,17 13,18 10.5,19 9,22 7.5,19 5,18 7.5,17" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
      <polygon points="90,75 91.5,77 94,78 91.5,79 90,81 88.5,79 86,78 88.5,77" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
    </svg>
  );
}

// 13. Neo-Memphis Hourglass Waitlist Sticker
export function HourglassWaitlistSticker({ size = 36, className = '', style = {} }) {
  const hgOutline = "M 22 10 C 22 7 25 5 29 5 L 71 5 C 75 5 78 7 78 10 L 78 22 C 78 24 76 26 73 26 L 68 26 C 68 38 57 48 55 50 C 57 52 68 62 68 74 L 73 74 C 76 74 78 76 78 78 L 78 90 C 78 93 75 95 71 95 L 29 95 C 25 95 22 93 22 90 L 22 78 C 22 76 24 74 27 74 L 32 74 C 32 62 43 52 45 50 C 43 48 32 38 32 26 L 27 26 C 24 26 22 24 22 22 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="hgGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
        <linearGradient id="hgGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E1F5FE" />
          <stop offset="100%" stopColor="#B3E5FC" />
        </linearGradient>
        <linearGradient id="hgSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>

      {/* Hard 3D Offset Shadow */}
      <g transform="translate(4, 4)">
        <path d={hgOutline} fill="#1E1B2E" />
      </g>

      {/* White Die-Cut Vinyl Outline */}
      <path 
        d={hgOutline} 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />

      {/* ─── DOUBLE GLASS BULBS ─── */}
      <path 
        d="M 33 22 L 67 22 C 67 22 66 38 56 47 C 54 49 54 51 56 53 C 66 62 67 78 67 78 L 33 78 C 33 78 34 62 44 53 C 46 51 46 49 44 47 C 34 38 33 22 33 22 Z" 
        fill="url(#hgGlassGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.2" 
        strokeLinejoin="round" 
      />

      {/* ─── FLOWING GOLDEN SAND ─── */}
      <path 
        d="M 37 32 C 45 37 55 37 63 32 C 61 40 55 46 50 48 C 45 46 39 40 37 32 Z" 
        fill="url(#hgSandGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="1.8" 
      />
      <path 
        d="M 34 77 C 36 67 44 61 50 60 C 56 61 64 67 66 77 Z" 
        fill="url(#hgSandGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="2" 
      />
      <line x1="50" y1="48" x2="50" y2="61" stroke="#FF8F00" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="50" cy="54" r="1.5" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />

      {/* ─── SIDE SUPPORT PILLARS ─── */}
      <rect x="25" y="21" width="5.5" height="58" rx="2.5" fill="#1E1B2E" />
      <rect x="69.5" y="21" width="5.5" height="58" rx="2.5" fill="#1E1B2E" />

      {/* ─── TOP HORIZONTAL CAP / END-PLATE ─── */}
      <rect x="22" y="11" width="56" height="11" rx="5" fill="url(#hgGoldGrad)" stroke="#1E1B2E" strokeWidth="3" />
      <rect x="27" y="13" width="46" height="3" rx="1.5" fill="#FFFFFF" opacity="0.65" />
      <circle cx="50" cy="9" r="3" fill="#FF4081" stroke="#1E1B2E" strokeWidth="1.8" />

      {/* ─── BOTTOM HORIZONTAL CAP / END-PLATE ─── */}
      <rect x="22" y="78" width="56" height="11" rx="5" fill="url(#hgGoldGrad)" stroke="#1E1B2E" strokeWidth="3" />
      <rect x="27" y="80" width="46" height="3" rx="1.5" fill="#FFFFFF" opacity="0.65" />
      <circle cx="50" cy="91" r="3" fill="#FF4081" stroke="#1E1B2E" strokeWidth="1.8" />

      {/* Specular Curved Reflections on Glass Bulbs */}
      <path d="M 36 24 C 38 31 43 38 46 43" stroke="#FFFFFF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 64 57 C 61 63 58 70 56 75" stroke="#FFFFFF" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* Floating Sparkle Micro-Stars */}
      <polygon points="14,30 15.5,33 18,34 15.5,35 14,38 12.5,35 10,34 12.5,33" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="0.8" />
      <polygon points="86,66 87.5,69 90,70 87.5,71 86,74 84.5,71 82,70 84.5,69" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
    </svg>
  );
}

// 14. Neo-Memphis Vibe Meter Thermometer Sticker (Bespoke 45° Diagonal Asset)
export function ThermometerVibeSticker({ size = 38, className = '', style = {} }) {
  const thermoOutline = "M 40 25 C 40 14 60 14 60 25 L 60 63 C 68 67 71 73 71 79 C 71 90 62 98 50 98 C 38 98 29 90 29 79 C 29 73 32 67 40 63 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Vibrant Multi-Stop Dopamine Mercury Gradient */}
        <linearGradient id="thermoLiquidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E0005E" />
          <stop offset="35%" stopColor="#FF1475" />
          <stop offset="70%" stopColor="#FF4081" />
          <stop offset="100%" stopColor="#FFE142" />
        </linearGradient>

        {/* Crystal Glass Specular Glint Gradient */}
        <linearGradient id="thermoGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E0F7FA" />
          <stop offset="100%" stopColor="#B2EBF2" />
        </linearGradient>
      </defs>

      {/* 45-Degree Dynamic Rotation Group */}
      <g transform="rotate(-42 50 50)">
        {/* Hard 3D Offset Drop Shadow in Toy-Black */}
        <g transform="translate(4, 4)">
          <path d={thermoOutline} fill="#1E1B2E" />
        </g>

        {/* Thick White Die-Cut Vinyl Sticker Border */}
        <path 
          d={thermoOutline} 
          fill="#FFFFFF" 
          stroke="#FFFFFF" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />

        {/* Transparent Crystal Glass Chamber */}
        <path 
          d={thermoOutline} 
          fill="url(#thermoGlassGrad)" 
          stroke="#1E1B2E" 
          strokeWidth="3.2" 
          strokeLinejoin="round" 
        />

        {/* Inner Glass Vacuum Tube Track */}
        <rect x="43" y="24" width="14" height="46" rx="7" fill="#FFFFFF" opacity="0.6" />

        {/* ─── VIBRANT MERCURY LIQUID ─── */}
        <rect x="45" y="27" width="10" height="43" rx="5" fill="url(#thermoLiquidGrad)" stroke="#1E1B2E" strokeWidth="1.8" />
        <circle cx="50" cy="79" r="14" fill="url(#thermoLiquidGrad)" stroke="#1E1B2E" strokeWidth="2.8" />

        {/* Measurement Calibration Hash Marks */}
        <g stroke="#1E1B2E" strokeWidth="2.2" strokeLinecap="round">
          <line x1="56" y1="34" x2="60" y2="34" />
          <line x1="56" y1="42" x2="60" y2="42" />
          <line x1="56" y1="50" x2="60" y2="50" />
          <line x1="56" y1="58" x2="60" y2="58" />
        </g>

        {/* ─── 3D SPECULAR HIGHLIGHTS & GLOSS ─── */}
        <path d="M 43 27 L 43 60" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
        <ellipse cx="44" cy="74" rx="4.5" ry="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="54" cy="84" r="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Floating Vibe Sparkles in Canvas Space */}
      <polygon points="26,12 28,16 32,17 28,18 26,22 24,18 20,17 24,16" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1" />
      <circle cx="78" cy="22" r="3" fill="#00E5FF" stroke="#1E1B2E" strokeWidth="1.2" />
      <polygon points="84,72 85.5,75 88,76 85.5,77 84,80 82.5,77 80,76 82.5,75" fill="#FFE142" stroke="#1E1B2E" strokeWidth="0.8" />
    </svg>
  );
}

// 15. Neo-Memphis Live City Geolocation & Radar Pin Sticker (Bespoke Venue Hub Asset)
export function CityLocationSticker({ size = 48, className = '', style = {} }) {
  const pinPath = "M 50 82 C 37 67 22 51 22 35 C 22 19.5 34.5 8 50 8 C 65.5 8 78 19.5 78 35 C 78 51 63 67 50 82 Z";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Vibrant Multi-Stop Pin Gradient */}
        <linearGradient id="locPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4081" />
          <stop offset="55%" stopColor="#FF1475" />
          <stop offset="100%" stopColor="#D80056" />
        </linearGradient>

        {/* Golden Beacon Core Gradient */}
        <linearGradient id="locCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE142" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>

        {/* Cyber Cyan Ground Radar Gradient */}
        <linearGradient id="locGroundGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
      </defs>

      {/* ─── 1. HARD 3D OFFSET SHADOWS (Toy-Black) ─── */}
      <g transform="translate(4, 4)">
        {/* Ground radar ripple shadow */}
        <ellipse cx="50" cy="85" rx="34" ry="10" fill="#1E1B2E" />
        {/* Teardrop pin shadow */}
        <path d={pinPath} fill="#1E1B2E" />
      </g>

      {/* ─── 2. WHITE DIE-CUT VINYL STICKER BORDER ─── */}
      <ellipse cx="50" cy="85" rx="35" ry="11" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" />
      <path 
        d={pinPath} 
        fill="#FFFFFF" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />

      {/* ─── 3. GROUND GEOLOCATION RADAR WAVES ─── */}
      {/* Outer Ground Pulse Ring with Radar Nodes */}
      <ellipse cx="50" cy="85" rx="33" ry="9.5" fill="#E8F9FF" stroke="#1E1B2E" strokeWidth="3" />
      <ellipse cx="50" cy="85" rx="22" ry="6.2" fill="url(#locGroundGrad)" stroke="#1E1B2E" strokeWidth="2.5" />
      
      {/* Ground Target Pulse Dots */}
      <circle cx="21" cy="85" r="2.8" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.8" />
      <circle cx="79" cy="85" r="2.8" fill="#FFE142" stroke="#1E1B2E" strokeWidth="1.8" />
      <circle cx="50" cy="85" r="3.2" fill="#1E1B2E" />

      {/* ─── 4. CHUNKY 3D TEARDROP LOCATION PIN ─── */}
      <path 
        d={pinPath} 
        fill="url(#locPinGrad)" 
        stroke="#1E1B2E" 
        strokeWidth="3.6" 
        strokeLinejoin="round" 
      />

      {/* Outer Live Spotlight Aperture */}
      <circle cx="50" cy="35" r="17" fill="#FFFFFF" stroke="#1E1B2E" strokeWidth="3.2" />

      {/* Inner Glowing Beacon Lens */}
      <circle cx="50" cy="35" r="11.5" fill="url(#locCoreGrad)" stroke="#1E1B2E" strokeWidth="2.4" />

      {/* Live Stage Compass Star Core */}
      <polygon 
        points="50,26 52.6,32.4 59,35 52.6,37.6 50,44 47.4,37.6 41,35 47.4,32.4" 
        fill="#1E1B2E" 
      />
      {/* Mini Center Specular Glint */}
      <circle cx="50" cy="35" r="1.6" fill="#FFFFFF" />

      {/* ─── 5. 3D RETRO COMIC SPECULAR HIGHLIGHTS ─── */}
      <path 
        d="M 28 32 C 28 21 36.5 13 47 12" 
        stroke="#FFFFFF" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.95" 
      />
      <circle cx="34" cy="40" r="2" fill="#FFFFFF" opacity="0.9" />

      {/* ─── 6. FLOATING LIVE SOUND & SPARKLE ACCENTS ─── */}
      {/* Cyber Cyan 4-Point Sparkle (Top Right) */}
      <polygon 
        points="84,12 86,17 91,18 86,19 84,24 82,19 77,18 82,17" 
        fill="#00E5FF" 
        stroke="#1E1B2E" 
        strokeWidth="1.6" 
      />
      
      {/* Golden Mini Star (Bottom Left) */}
      <polygon 
        points="14,64 16,67.5 20,68.5 16,69.5 14,73 12,69.5 8,68.5 12,67.5" 
        fill="#FFE142" 
        stroke="#1E1B2E" 
        strokeWidth="1.2" 
      />

      {/* Live Stage Broadcast Radio Wave Arcs (Right Side) */}
      <path 
        d="M 82 32 C 86 35 86 42 82 45" 
        stroke="#1E1B2E" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path 
        d="M 87 28 C 93 33 93 45 87 50" 
        stroke="#1E1B2E" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
        fill="none" 
      />
    </svg>
  );
}

const CustomStickers = { 
  BalloonSticker, 
  DiscoBallSticker, 
  SparklesSticker, 
  TicketSticker,
  ArcadeJoystickSticker,
  AirborneBoosterSticker,
  SpringJumpSticker,
  PopcornBucketSticker,
  CircusTentSticker,
  CinemaSeatSticker,
  SecurityShieldSticker,
  PaymentCardSticker,
  HourglassWaitlistSticker,
  ThermometerVibeSticker,
  CityLocationSticker
};
export default CustomStickers;
