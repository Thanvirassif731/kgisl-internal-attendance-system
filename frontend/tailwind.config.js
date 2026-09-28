/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a1024',
          sidebar: '#0b132b',
          sidebarHover: '#152042',
          sidebarActive: '#1c2954',
          blue: '#2563eb',
          blueHover: '#1d4ed8',
          lightBlue: '#eff6ff',
          badgeBlue: '#dbeafe',
          card: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
}
