/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact Color Tokens from User Specification
        "deep-espresso": "#3B1F0F",
        "dark-roast": "#24130A",
        mocha: "#6B3515",
        caramel: "#C8752A",
        "golden-caramel": "#E5A04B",
        "warm-beige": "#F5EBDD",
        cream: "#FBF6EE",
        ivory: "#FFFDFC",
        "coffee-cream": "#EFE0CB",
        "primary-text": "#24160F",
        "secondary-text": "#765F4D",
        "beige-brown": "#DCC9B3",
        
        // Semantic Colors
        "status-success": "#4F8061",
        "status-warning": "#D99A32",
        "status-error": "#B8543E",

        // Semantic coffee scale for backwards and utility compatibility
        coffee: {
          50: "#FBF6EE", // cream
          100: "#F5EBDD", // warm-beige
          200: "#EFE0CB", // coffee-cream
          300: "#DCC9B3", // beige-brown
          400: "#C8752A", // caramel
          500: "#765F4D", // secondary-text
          600: "#6B3515", // mocha
          800: "#3B1F0F", // deep-espresso
          900: "#24160F", // primary-text
          950: "#24130A", // dark-roast
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        cozy: "0 2px 10px -2px rgba(36, 19, 10, 0.05), 0 1px 3px 0 rgba(36, 19, 10, 0.03)",
        "cozy-md": "0 6px 20px -4px rgba(36, 19, 10, 0.08), 0 2px 6px -1px rgba(36, 19, 10, 0.04)",
        "cozy-lg": "0 12px 32px -6px rgba(36, 19, 10, 0.12), 0 4px 12px -2px rgba(36, 19, 10, 0.06)",
        "caramel-glow": "0 6px 20px -2px rgba(200, 117, 42, 0.35)",
        "golden-glow": "0 6px 20px -2px rgba(229, 160, 75, 0.35)",
      },
    },
  },
  plugins: [],
}
