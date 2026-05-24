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
        // Expedition palette
        'forest-deep':    'var(--forest-deep)',
        'forest-mid':     'var(--forest-mid)',
        'forest-light':   'var(--forest-light)',
        amber:            'var(--amber)',
        'amber-warm':     'var(--amber-warm)',
        'amber-glow':     'var(--amber-glow)',
        parchment:        'var(--parchment)',
        'parchment-mid':  'var(--parchment-mid)',
        charcoal:         'var(--charcoal)',
        'charcoal-mid':   'var(--charcoal-mid)',
        'charcoal-light': 'var(--charcoal-light)',
        'charcoal-soft':  'var(--charcoal-soft)',
        bone:             'var(--bone)',
        cream:            'var(--cream-text)',
        'cream-dim':      'var(--cream-dim)',
        danger:           'var(--danger)',
        // Legacy aliases for compat
        rausch: 'var(--amber)',
        kazan: 'var(--amber-warm)',
        babu: 'var(--forest-light)',
        hof: 'var(--cream-text)',
        foggy: 'var(--cream-dim)',
        border: 'var(--charcoal-light)',
        'bg-light': 'var(--charcoal-soft)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '4px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.35)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.55), 0 12px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
