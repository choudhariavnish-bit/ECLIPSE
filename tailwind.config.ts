import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          first: "#e0ffcd",   // Mint Green
          second: "#fdffcd",  // Cream / Pastel Lemon
          third: "#ffebbb",   // Soft Peach / Custard
          fourth: "#ffcab0",  // Warm Coral Peach
        },
        first: "#e0ffcd",
        second: "#fdffcd",
        third: "#ffebbb",
        fourth: "#ffcab0",
        brand: {
          50: "#fdffcd",
          100: "#ffebbb",
          200: "#ffcab0",
          300: "#fca07a",
          400: "#f87c4f",
          500: "#eb5d2a",
          600: "#c84518",
          700: "#a23310",
          800: "#7c270d",
          900: "#541908",
          950: "#320e03",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
