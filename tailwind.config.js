/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F6ECEF',
        accent: '#7C5CFC',
        background: '#FFFBF6',
        surface: '#FFFFFF',
        text: '#2B1D33',
        muted: '#6C5D72',
        highlight: '#FCDAD5',
        border: '#E4D9EB',
      },
      fontFamily: {
        heading: ['\'Crimson Pro\'', 'serif'],
        body: ['\'Josefin Sans\'', 'sans-serif'],
      },
    },
  },
  plugins: [],
};