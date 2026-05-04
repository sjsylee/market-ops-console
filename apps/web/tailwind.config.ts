import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          cardHover: 'var(--bg-card-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
      },
      borderColor: {
        subtle: 'var(--border-subtle)',
        glow: 'var(--border-glow)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-korean)', 'sans-serif'],
        body: ['var(--font-body)', 'var(--font-korean)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        aura: '0 0 24px var(--accent-glow), 0 0 60px color-mix(in srgb, var(--accent-primary) 20%, transparent)',
        panel: '0 18px 50px rgba(2, 6, 23, 0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
