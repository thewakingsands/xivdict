const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{svelte,ts,js,css}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.blueGray,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
