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
          DEFAULT: "#34C759",
          dark: "#24A94B",
          deep: "#157A36",
          light: "#CFF5DA",
          faint: "#E4FBEA",
        },
        accent: { DEFAULT: "#FB923C", light: "#FED7AA" },
        amber: { DEFAULT: "#F5B400", light: "#FEF3C7" },
        danger: { DEFAULT: "#DC2626", light: "#FECACA" },
        "text-primary": "#18181B",
        "text-secondary": "#52525B",
        "text-tertiary": "#71717A",
        "border-default": "#E4E4E7",
        "bg-warm": "#FAFAFA",
        ink: "#3F3F46",
        subtle: "#A1A1AA",
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
