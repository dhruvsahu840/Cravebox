/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(20, 83, 45, 0.08)',
        'card-hover': '0 12px 40px -8px rgba(20, 83, 45, 0.18)',
        glow: '0 0 40px -10px rgba(34, 197, 94, 0.35)',
      },
      backgroundImage: {
        'food-pattern': "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')",
        'hero-food': "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80')",
      },
    },
  },
  plugins: [],
}
