/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "acid-yellow": "var(--acid-yellow)",
        "acid-yellow-hover": "var(--acid-yellow-hover)",
        "neon-magenta": "var(--neon-magenta)",
        "neon-magenta-dark": "var(--neon-magenta-dark)",
        "electric-cobalt": "var(--electric-cobalt)",
        "asphalt-black": "var(--asphalt-black)",
        "asphalt-surface": "var(--asphalt-surface)",
        "asphalt-card": "var(--asphalt-card)",
        "asphalt-border": "var(--asphalt-border)",
        "grit-white": "var(--grit-white)",
        "grit-dim": "var(--grit-dim)",
        "danger-red": "var(--status-danger)",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        impact: ["'Oswald'", "sans-serif"],
        "mono-zine": ["'Courier Prime'", "monospace"],
        ticker: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}

