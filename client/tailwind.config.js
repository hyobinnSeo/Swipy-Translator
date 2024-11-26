/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
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
          gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        },
      },
    },
    plugins: [],
  }
