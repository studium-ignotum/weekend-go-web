/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.src.html",
    "./partials/**/*.html",
    "./partials/**/*.svg",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        heading: ["Nunito", "system-ui", "sans-serif"],
        hand: ["Dancing Script", "cursive"],
      },
      fontSize: {
        "3xs": "10px",
        "2xs": "11px",
        md: "15px",
      },
      colors: {
        primary: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
          light: "#86efac",
        },
        accent: {
          DEFAULT: "#fb923c",
          light: "#fed7aa",
        },
        "bg-warm": "#F9FAFB",
        "text-primary": "#111827",
        "text-secondary": "#4B5563",
        "text-tertiary": "#6B7280",
        "border-default": "#E5E7EB",
        "footer-bg": "#292524",
      },
      borderRadius: {
        button: "999px",
        card: "16px",
      },
    },
  },
  plugins: [],
};
