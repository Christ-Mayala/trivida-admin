/**
 * Tailwind Config — Trivida Admin Panel
 * 
 * Dark mode natif + palette de couleurs admin
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette admin Trivida (basée sur les couleurs de l'app mobile)
        // Vert émeraude = couleur principale Trivida
        trivida: {
          50: '#E8F5F1',
          100: '#C6E8DD',
          200: '#93D4BF',
          300: '#5FC0A0',
          400: '#3EC29A',
          500: '#006B4D',
          600: '#005A41',
          700: '#004A35',
          800: '#003A29',
          900: '#002A1E',
          950: '#001A12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
