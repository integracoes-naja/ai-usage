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
    },
  },
  plugins: [],
} satisfies Config;
