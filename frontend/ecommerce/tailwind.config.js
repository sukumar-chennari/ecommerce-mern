export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        primary: "#2563EB",
        secondary: "#0F172A",
        accent: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        textPrimary: "#0F172A",
        textMuted: "#64748B",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};