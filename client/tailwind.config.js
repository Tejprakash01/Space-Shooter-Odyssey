/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#070913',
          800: '#0e1224',
          700: '#161c36',
          cyan: '#00f0ff',
          neon: '#a855f7',
          gold: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.5)',
        'neon-gold': '0 0 15px rgba(245, 158, 11, 0.5)',
      }
    },
  },
  plugins: [],
}

