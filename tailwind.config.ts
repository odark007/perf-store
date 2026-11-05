import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colour tokens are driven by CSS variables so each store can supply its
        // own palette (see lib/stores/config.ts → getStoreThemeVars).
        // The RGB-channel format keeps Tailwind opacity modifiers working:
        //   bg-brand-gold/10 → rgb(var(--brand-gold) / 0.1)
        brand: {
          deep: 'rgb(var(--brand-deep) / <alpha-value>)',
          mid: 'rgb(var(--brand-mid) / <alpha-value>)',
          light: 'rgb(var(--brand-light) / <alpha-value>)',
          gold: 'rgb(var(--brand-gold) / <alpha-value>)',
          'gold-light': 'rgb(var(--brand-gold-light) / <alpha-value>)',
          'gold-pale': 'rgb(var(--brand-gold-pale) / <alpha-value>)',
          cream: 'rgb(var(--brand-cream) / <alpha-value>)',
          border: 'rgb(var(--brand-gold) / 0.25)',
          muted: 'rgb(var(--brand-muted))',
          subtle: 'rgb(var(--brand-subtle))',
        },
        success: '#10b981', // Emerald
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
