/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'xs': '380px',
      },
      colors: {
        // Joyful Neo-Memphis Palette
        "buttercream": "#FFF8E7",
        "bubble-pink": "#FF4081",
        "candy-purple": "#8B5CF6",
        "sky-azure": "#00D2FF",
        "mint-pop": "#2EE59D",
        "sun-yellow": "#FFD200",
        "coral-peach": "#FF7E67",
        "toy-black": "#1E1B2E",
        "lilac-wash": "#F3EBFF",

        // Palette mapping for existing components
        primary: "#1E1B2E",
        secondary: "#FFF8E7",
        tertiary: "#8B5CF6",
        neutral: "#ffffff",
        surface: "#FFF8E7",
        "on-surface": "#1E1B2E",
        error: "#FF4081",
        border: "#1E1B2E",
        muted: "#6B6580",
        "pill-nav": "#F3EBFF",

        "acid-yellow": "#FFD200",
        "acid-yellow-hover": "#ffe142",
        "neon-magenta": "#FF4081",
        "neon-magenta-dark": "#ff2a73",
        "electric-cobalt": "#8B5CF6",
        "asphalt-black": "#1E1B2E",
        "asphalt-surface": "#FFF8E7",
        "asphalt-card": "#ffffff",
        "asphalt-border": "#1E1B2E",
        "grit-white": "#ffffff",
        "grit-dim": "#6B6580",
        "danger-red": "#FF4081",
      },
      fontFamily: {
        display: ['"Fredoka"', '"Outfit"', 'sans-serif'],
        body: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        bubble: ['"Fredoka"', 'cursive'],
        sans: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        "headline-display": ['"Fredoka"', '"Outfit"', 'sans-serif'],
        "headline-lg": ['"Fredoka"', '"Outfit"', 'sans-serif'],
        "headline-md": ['"Outfit"', 'sans-serif'],
        "headline-sm": ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'toy': '4px 4px 0px #1E1B2E',
        'toy-lg': '8px 8px 0px #1E1B2E',
        'toy-xl': '12px 12px 0px #1E1B2E',
        'pop-pink': '6px 6px 0px #FF4081',
        'pop-purple': '6px 6px 0px #8B5CF6',
        'pop-mint': '6px 6px 0px #2EE59D',
        'pop-azure': '6px 6px 0px #00D2FF',
        'squishy': 'inset 0 4px 8px rgba(255,255,255,0.7), 0 8px 24px rgba(139,92,246,0.18)'
      },
      borderRadius: {
        'blob': '40px',
        'pill': '9999px',
        'toy': '28px'
      }
    },
  },
  plugins: [],
}
