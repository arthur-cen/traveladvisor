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
        rausch: '#FF5A5F',
        kazan: '#FF7A59',
        babu: '#00A699',
        hof: '#484848',
        foggy: '#767676',
        border: '#EBEBEB',
        'bg-light': '#F7F7F7',
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
