/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#00b4d8",
          dim: "rgba(0, 180, 216, 0.15)",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
      },
      borderRadius: {
        glass: "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};