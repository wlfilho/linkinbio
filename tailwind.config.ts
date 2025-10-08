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
        primary: "#0891B2",
        background: "#F3F4F6",
        card: "#FFFFFF",
        text: "#1F2937",
        border: "#E5E7EB",
      },
    },
  },
  plugins: [],
};
export default config;

