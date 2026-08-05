/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#2D1F1A",
          brown: "#5A4A42",
          accent: "#8C5E47",
          gold: "#C5924E",
          cream: "#F9F6F0",
          card: "#EFEAE1",
        },
      },
    },
  },
  plugins: [],
};
