/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'brand-primary': '#007bff',
          'brand-secondary': '#6c757d'
        }
      },
    },
        plugins: [],
    };