import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0B0B0D",
        glass: "rgba(255, 255, 255, 0.04)",
        border: "rgba(255, 255, 255, 0.08)",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A7A7B2",
        "text-muted": "#6F7282",
        "accent-blue": "#4F7CFF",
        "accent-purple": "#8B5CF6",
        "accent-cyan": "#22D3EE",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        button: "14px",
        input: "16px",
        card: "24px",
        dialog: "28px",
      },
      maxWidth: {
        page: "1440px",
        dashboard: "1280px",
        hero: "1200px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
