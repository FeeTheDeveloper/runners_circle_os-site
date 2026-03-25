import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./actions/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        shell: "#050816",
        panel: "#0b1220",
        "panel-elevated": "#10192d",
        line: "#1e293b",
        accent: "#38bdf8",
        "accent-soft": "#0f2235",
        success: "#34d399",
        warning: "#f59e0b",
        danger: "#fb7185",
        muted: "#94a3b8"
      },
      boxShadow: {
        panel:
          "0 0 0 1px rgba(148, 163, 184, 0.08), 0 22px 60px -30px rgba(15, 23, 42, 0.95)"
      },
      backgroundImage: {
        "shell-radial":
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 32%), radial-gradient(circle at top right, rgba(245, 158, 11, 0.12), transparent 24%)"
      }
    }
  },
  plugins: []
};

export default config;
