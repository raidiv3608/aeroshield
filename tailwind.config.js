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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        smog: {
          good: '#10b981',       // 0-50
          moderate: '#f59e0b',   // 51-100
          unhealthyS: '#f97316', // 101-150
          unhealthy: '#ef4444',  // 151-200
          severe: '#8b5cf6',     // 201-300
          hazardous: '#7f1d1d',  // 300+
        }
      },
    },
  },
  plugins: [],
}
