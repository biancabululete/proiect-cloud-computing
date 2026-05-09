import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#002F34",
          accent: "#23E5DB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
