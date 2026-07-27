/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'sans-serif'
        ]
      },
      colors: {
        reader: {
          accent: 'rgb(var(--accent) / <alpha-value>)',
          bg: 'rgb(var(--bg) / <alpha-value>)',
          card: 'rgb(var(--card) / <alpha-value>)',
          text: 'rgb(var(--text) / <alpha-value>)',
          muted: 'rgb(var(--muted) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)'
        }
      },
      boxShadow: {
        lift: '0 12px 32px rgba(37, 99, 235, 0.08)',
        darkLift: '0 16px 46px rgba(2, 6, 23, 0.35)'
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
};
