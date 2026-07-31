/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-yellow': '#FFCC00',
        'gov-red': '#CC0000',
        'gov-purple': '#660099',
        'gov-black': '#000000',
        'gov-white': '#FFFFFF',
      },
      borderRadius: {
        'none': '0px',
        'sm': '0px',
        DEFAULT: '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '0px',
      }
    },
  },
  plugins: [],
}
