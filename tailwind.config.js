/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['Cinzel', 'serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        schola: {
          bg: '#fbf9f5',
          panel: '#f5f1ea',
          subtle: '#eee8dc',
          border: '#e3dcce',
          borderDark: '#cfc4b2',
          text: '#22201d',
          muted: '#71695f',
          lightMuted: '#9e9588',
          arc: '#3d5a49',
          arcHover: '#324b3c',
          arcLight: '#eef3ef',
          accent: '#8f6b48',
        },
      },
    },
  },
  plugins: [],
}
