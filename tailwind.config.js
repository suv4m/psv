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
        graphite: {
          950: '#090a0f', // Obsidian graphite background
          900: '#0f1117', // Panel surface
          850: '#161922', // Card surface
          800: '#1e222e', // Elevated element
          border: '#2a3040', // Base border
          borderLight: '#3b4358', // Highlight border
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        mint: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        amethyst: {
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        },
        ruby: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 24px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.15)',
        'mint-glow': '0 0 24px rgba(16, 185, 129, 0.4), inset 0 0 10px rgba(16, 185, 129, 0.15)',
        'ruby-glow': '0 0 24px rgba(244, 63, 94, 0.45), inset 0 0 10px rgba(244, 63, 94, 0.15)',
        'amethyst-glow': '0 0 24px rgba(168, 85, 247, 0.4)',
      }
    },
  },
  plugins: [],
}
