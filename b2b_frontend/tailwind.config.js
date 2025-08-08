/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode:'class',
  theme: {
    extend: {
      colors: {
        "primary" : "#5d87ff",
        "primary-bg": "#5d87ff",
        "lightinfo" : "#ebf3fe",
        "darkinfo" : "#202136",
        "lightgray" : "#f1f1f1",
        "darkgray" : "f6f6f6"
      }
    },
  },
  plugins: [],
}
