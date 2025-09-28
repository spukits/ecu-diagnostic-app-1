/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ενεργοποίηση dark mode με κλάση
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#00BCD4', dark: '#06b6d4' },
        bg: { light: '#0b1220', dark: '#060a13', card: '#111827' },
        text: { light: '#e5e7eb', dim: '#9ca3af' },
      },
    },
  },
  plugins: [],
};

