import type { Config } from 'tailwindcss'

export default {
  content: [],
  darkMode: ["class", '[data-mode="dark"]'],
  purge: ["./src/**/*.{js,ts,jsx,tsx}"],
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
  safelist: [
    {
      pattern: /^line-clamp-/
    }
  ],
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
