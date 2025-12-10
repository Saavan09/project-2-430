/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        pastelBlue: '#a3c4f3',
      },
    },
  },
  plugins: [require('daisyui')],
};