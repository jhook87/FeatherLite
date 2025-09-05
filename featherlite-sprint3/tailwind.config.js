/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D6D1D1',
        accent: '#3DA212',
        background: '#FFFFFF',
        text: '#000000',
      },
      fontFamily: {
        heading: ['\'Crimson Pro\'', 'serif'],
        body: ['\'Josefin Sans\'', 'sans-serif'],
      },
    },
  },
  plugins: [],
};