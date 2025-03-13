/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Urbanist', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: '#162F3B',
        secondary: '#1D9B5E',
        flowkeySecondary: '#D2F801',
        active: '#DAF8E6',
        tableHeader: '#DBDEDF',
      },
    },
  },
  plugins: [],
};
