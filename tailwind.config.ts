import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        ink: 'hsl(var(--ink) / <alpha-value>)',
        paper: 'hsl(var(--paper) / <alpha-value>)',
        stone: 'hsl(var(--stone) / <alpha-value>)',
        line: 'hsl(var(--line) / <alpha-value>)',
        terracotta: 'hsl(var(--terracotta) / <alpha-value>)',
        moss: 'hsl(var(--moss) / <alpha-value>)',
        gold: 'hsl(var(--gold) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 16px 50px -28px hsl(var(--ink) / 0.28)',
        float: '0 24px 70px -32px hsl(var(--ink) / 0.42)',
        inset: 'inset 0 1px 0 hsl(0 0% 100% / 0.35)',
      },
      borderRadius: {
        editorial: '1.125rem',
        panel: '1.5rem',
      },
      keyframes: {
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -8px, 0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 hsl(var(--gold) / .5)' },
          '70%': { boxShadow: '0 0 0 12px hsl(var(--gold) / 0)' },
          '100%': { boxShadow: '0 0 0 0 hsl(var(--gold) / 0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        drift: 'drift 6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}

export default config

