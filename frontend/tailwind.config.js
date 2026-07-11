/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'app-bg': 'rgb(var(--app-bg-rgb) / <alpha-value>)',
        'app-surface': 'rgb(var(--app-surface-rgb) / <alpha-value>)',
        'app-text': 'rgb(var(--app-text-rgb) / <alpha-value>)',
        'app-text-secondary': 'rgb(var(--app-text-secondary-rgb) / <alpha-value>)',
        'app-border': 'rgb(var(--app-border-rgb) / <alpha-value>)',
        brand: {
          primary: '#0D1B2A',
          secondary: '#1B263B',
          accent: '#415A77',
          muted: '#778DA9',
          bg: '#E0E1DD',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(13,27,42,0.06), 0 8px 24px rgba(13,27,42,0.06)',
        'card-hover': '0 4px 12px rgba(13,27,42,0.10), 0 12px 32px rgba(13,27,42,0.10)',
        glass: '0 8px 32px rgba(13,27,42,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
