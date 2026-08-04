import React, { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';

const GREETINGS = [
  { text: 'नमस्ते', lang: 'Hindi (India)', flag: '🇮🇳' },
  { text: 'こんにちは', lang: 'Japanese (Japan)', flag: '🇯🇵' },
  { text: 'Bonjour', lang: 'French (France)', flag: '🇫🇷' },
  { text: '¡Hola!', lang: 'Spanish (Spain)', flag: '🇪🇸' },
  { text: 'Ciao', lang: 'Italian (Italy)', flag: '🇮🇹' },
];

export default function IntroSplashScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < GREETINGS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setFadingOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 450);
          }, 450);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999,
        background: '#060913',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: fadingOut ? 'none' : 'auto'
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px' }}>
        {/* Clean Centered Multilingual Greeting */}
        <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 
            key={currentIndex}
            style={{
              fontSize: '4.8rem',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'greetingPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {GREETINGS[currentIndex].text}
          </h1>
        </div>
      </div>

      <style>{`
        @keyframes greetingPop {
          0% { opacity: 0; transform: translateY(12px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
