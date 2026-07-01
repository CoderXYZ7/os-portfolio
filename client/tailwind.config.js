/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#2a2d2f',
        'dirty-white': '#e4e1d8',
        'accent-orange': '#ff6a00',
        'accent-blue': '#3aa0ff',
        'accent-amber': '#d9a441',
        'accent-red': '#c4453a',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        display: ['"Big Shoulders"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
