import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        rausch: 'var(--rausch)',
        kazan: 'var(--kazan)',
        babu: 'var(--babu)',
        hof: 'var(--hof)',
        foggy: 'var(--foggy)',
        border: 'var(--border)',
        'bg-light': 'var(--bg-light)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
