/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: "#0F3D2E", dark: "#0A2B20" },
        parchment: { DEFAULT: "#EFE8D6", 2: "#E5DCC4" },
        ink: "#1C2620",
        gold: "#B9872F",
        clay: "#8A4B2E",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
