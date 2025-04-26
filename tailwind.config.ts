import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
      gridTemplateRows: {
        subgrid: "subgrid",
      },
      gridTemplateColumns: {
        subgrid: "subgrid",
      },
      gridRow: {
        "span-8": "span 8",
        "span-9": "span 9",
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
