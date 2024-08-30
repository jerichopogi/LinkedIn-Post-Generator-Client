// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using class strategy
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path to match your project structure
  ],
  theme: {
    extend: {
      colors: {
        // Customize colors here if needed
        'gray-900': '#1a1a1a',
        'gray-800': '#2d2d2d',
        'gray-700': '#3f3f3f',
        'indigo-500': '#6366F1',
        'indigo-600': '#4F46E5',
      },
    },
  },
  plugins: [],
}
