/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#7b294e',
          light: '#b2455e',
          pale: '#f8e9ef',
          dark: '#3a1c32',
        },
      },
    },
  },
  plugins: [],
};
