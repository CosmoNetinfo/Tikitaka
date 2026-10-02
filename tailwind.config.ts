import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#14213D",
          50: "#E8EBF0",
          100: "#D1D6E1",
          200: "#A3ADC3",
          300: "#7584A5",
          400: "#475B87",
          500: "#14213D",
          600: "#101A31",
          700: "#0C1425",
          800: "#080D18",
          900: "#04070C",
        },
        gold: {
          DEFAULT: "#FFC300",
          50: "#FFF8E0",
          100: "#FFF1C2",
          200: "#FFE385",
          300: "#FFD647",
          400: "#FFC300",
          500: "#D4A200",
          600: "#AA8200",
          700: "#7F6100",
          800: "#554100",
          900: "#2A2000",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
