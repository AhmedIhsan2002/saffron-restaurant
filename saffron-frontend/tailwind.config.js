/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#183B35",
        accent: "#D58242",
        cream: "#F8F6F1",
        ink: "#21302D",
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      keyframes: {
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    slideUp: {
      "0%": { transform: "translateY(20px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    slideInRight: {
  "0%": { transform: "translateX(100%)" },
  "100%": { transform: "translateX(0)" },
},

  slideInLeft: {
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(0)" },
},
  },
  animation: {
    fadeIn: "fadeIn 150ms ease-out",
    slideUp: "slideUp 250ms ease-out",
  },
  slideInRight: "slideInRight 250ms ease-out",
    },
    slideInLeft: "slideInLeft 250ms ease-out",
  },
  plugins: [],
}