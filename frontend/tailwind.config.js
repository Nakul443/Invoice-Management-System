/** @type {import('tailwindcss').Config} */
export default {
  // Add these paths so Tailwind knows to scan your HTML and TSX files
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Optional: Add the specific indigo from the Dribbble shot
      colors: {
        indigo: {
          600: '#4F46E5', 
        },
      },
    },
  },
  plugins: [],
}