/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  purge: ["./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
      colors: (theme) => ({}),
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
