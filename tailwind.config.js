/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#60A5FA",
        },
        secondary: {
          DEFAULT: "#10B981",
          dark: "#059669",
          light: "#34D399",
        },
        background: "#F3F4F6",
        surface: "#FFFFFF",
        text: {
          DEFAULT: "#1F2937",
          light: "#6B7280",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}