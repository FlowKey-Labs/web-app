/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Urbanist', 'sans-serif'],
      spaceGrotesk: ['Space Grotesk', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: '#162F3B',
        secondary: '#1D9B5E',
        flowkeySecondary: '#EAFCF3',
        active: '#DAF8E6',
        tableHeader: '#DBDEDF',
        cardsBg: '#F8F7F7',
      },
    },
  },
  plugins: [],
};
