/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          950: '#030712', // Pure obsidian midnight
          900: '#070d1e', // Panel background
          850: '#0c142b', // Card background
          800: '#111c38', // Elevated surface
          border: '#1a2744',
          borderActive: '#2563eb',
        },
        neon: {
          blue: '#00d4ff',
          deep: '#3b82f6',
          indigo: '#6366f1',
          purple: '#b55fe6',
          emerald: '#00ff9d',
          rose: '#ff2a5f',
          amber: '#ffb700',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.35)',
        'neon-glow': '0 0 30px rgba(59, 130, 246, 0.25)',
        'neon-rose': '0 0 20px rgba(255, 42, 95, 0.4)',
        'neon-emerald': '0 0 20px rgba(0, 255, 157, 0.35)',
      }
    },
  },
  plugins: [],
}
