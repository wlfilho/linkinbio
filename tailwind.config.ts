import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#177245",
        background: "#212020",
        card: "#2a2727",
        text: "#F1FFFA",
        border: "#3a3737",
      },
      fontFamily: {
        heading: ["var(--font-fira-sans-condensed)", "sans-serif"],
        body: ["var(--font-fira-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

