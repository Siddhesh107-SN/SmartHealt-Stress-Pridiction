/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#0f766e',
        'dark-navy': '#0b1f2a',
        'page-bg': '#eef3f2',
        'hero-bg': '#dce9e6',
        'tray-bg': '#f6faf9',
        'coral-accent': '#ef775f',
        'muted-text': '#718784',
        'tick-inactive': '#d8e2e0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
