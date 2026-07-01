import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f4f5f7',
        card: '#ffffff',
        ink: '#111827',
        muted: '#6b7280',
        naja: {
          50: '#fef3e8',
          100: '#fde3c8',
          200: '#fbc88f',
          400: '#f9a050',
          500: '#f58220',
          600: '#e06f10',
          700: '#b85a0d',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Sora"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(17, 24, 39, 0.04), 0 8px 24px -12px rgba(17, 24, 39, 0.08)',
        'panel-hover': '0 2px 4px rgba(17, 24, 39, 0.05), 0 16px 32px -12px rgba(17, 24, 39, 0.12)',
        glow: '0 0 0 3px rgba(245, 130, 32, 0.12)',
      },
      backgroundImage: {
        dotgrid:
          'radial-gradient(circle, rgba(17, 24, 39, 0.06) 1px, transparent 1px)',
        mesh:
          'radial-gradient(ellipse 60% 50% at 8% -10%, rgba(245, 130, 32, 0.10), transparent), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(37, 99, 235, 0.08), transparent)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        rise: 'rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
