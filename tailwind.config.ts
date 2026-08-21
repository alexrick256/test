import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        line: "var(--color-border)",
        "line-strong": "var(--color-border-strong)",
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-faint": "var(--color-fg-faint)",
        ink: {
          950: "#0b0c0e",
          900: "#111318",
          800: "#1a1d24",
          700: "#272b34",
          600: "#3a3f4b",
          500: "#565c6b",
          400: "#7b8191",
          300: "#a4a9b5",
          200: "#cfd2d9",
          100: "#e9eaee",
          50: "#f6f7f9",
        },
        accent: {
          50: "#eef4ff",
          100: "#dbe7fe",
          200: "#bcd3fd",
          300: "#8db6fb",
          400: "#5890f6",
          500: "#3468ef",
          600: "#2450e3",
          700: "#1f3fc4",
          800: "#1f379e",
          900: "#1e327d",
        },
        positive: "#1a9e6f",
        negative: "#e0432b",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 18, 24, 0.04), 0 4px 16px rgba(15, 18, 24, 0.04)",
        popover: "0 8px 30px rgba(15, 18, 24, 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
