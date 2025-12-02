import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6366f1", 500: "#6366f1", 900: "#312e81" },
        secondary: { DEFAULT: "#8b5cf6", 500: "#8b5cf6" },
        accent: { DEFAULT: "#06b6d4" },
      },
      boxShadow: {
        card: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 4px 6px -2px rgba(0,0,0,0.05)",
        tile: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [animate],
}