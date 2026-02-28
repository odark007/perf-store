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
        brand: {
          deep: '#1a0a2e',   // primary dark background
          mid: '#2d1554',   // secondary purple
          light: '#4a2080',   // accent purple
          gold: '#c9a84c',   // primary gold
          'gold-light': '#e8c97a',
          'gold-pale': '#f5e6b8',
          cream: '#fdf8f0',   // page background
          border: 'rgba(201,168,76,0.25)',
          muted: '#8a7a9e',
          subtle: '#c4b8d4',
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