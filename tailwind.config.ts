import type { Config } from "tailwindcss";
import { colors, fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        foreground: "rgb(var(--foreground-rgb))",
        background: "rgb(var(--background-rgb))",
      },
      fontFamily: {
        brush: [
          "Free HK Kai",
          "tw-kai",
          "STKaiti",
          "SimKai",
          "KaiTi",
          "KaiU",
          "DFKai-SB",
          "BiauKai",
          "Han-Nom Khai",
          "kaisho",
          "yukyokasho",
          "uc digi kyokasho",
          "kyokasho",
          ...fontFamily.sans,
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
