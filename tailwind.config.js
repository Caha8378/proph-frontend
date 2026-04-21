/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        'proph-yellow': '#FFEC3C',
        'proph-black': '#0A0A0A',
        'proph-grey': '#1f1f28',
        'proph-grey-logo': '#8e99a2',
        'proph-white': '#FFFFFF',
        
        // Accent Colors
        'proph-purple': '#8B5CF6',
        'proph-purple-dark': '#6D28D9',
        
        // Semantic Colors
        'proph-success': '#10B981',
        'proph-error': '#EF4444',
        
        // Derived Shades
        'proph-grey-light': '#2C2C2E',
        'proph-grey-text': '#A1A1A6',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
