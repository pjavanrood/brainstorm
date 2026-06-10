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
        base: "#f5f5f0",
        ink: "#1a1a18",
        hairline: "#e0e0d8",
        accent: "#5b5bd6",
        muted: "#8a8a82",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
};
export default config;
