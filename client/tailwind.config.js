/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          navy: {
            50: '#E7E9EF',
            100: '#C2C9D6',
            200: '#9BA5BB',
            300: '#7481A0',
            400: '#576686',
            500: '#384766', // 기본 네이비 색상
            600: '#313E59',
            700: '#2A354B',
            800: '#232C3E',
            900: '#1C2331',
          },
        },
      },
    },
    plugins: [],
  }