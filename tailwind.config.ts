import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2F9B5F", // color-primary-700
          foreground: "#ffffff",
          100: "#E4FDE0",
          200: "#C5FBC2",
          300: "#A1F3A6",
          400: "#86E795",
          500: "#5FD87D",
          600: "#45B96D",
          700: "#2F9B5F",
          800: "#1E7D51",
          900: "#126748",
        },
        secondary: {
          DEFAULT: "#A1F3A6", // color-primary-300
          foreground: "#126748",
        },
        success: {
          DEFAULT: "#32BA76", // color-success-500
          foreground: "#ffffff",
          100: "#D6FBDA",
          200: "#AFF8BE",
          300: "#83EAA2",
          400: "#60D58F",
          500: "#32BA76",
          600: "#249F6E",
          700: "#198565",
          800: "#0F6B59",
          900: "#095951",
        },
        info: {
          DEFAULT: "#2181FF", // color-info-500
          foreground: "#ffffff",
          100: "#D2EDFF",
          200: "#A6D8FF",
          300: "#79BFFF",
          400: "#58A7FF",
          500: "#2181FF",
          600: "#1863DB",
          700: "#104AB7",
          800: "#0A3393",
          900: "#06247A",
        },
        warning: {
          DEFAULT: "#F9D72C", // color-warning-500
          foreground: "#775D08",
          100: "#FEFAD4",
          200: "#FEF4AA",
          300: "#FDEC80",
          400: "#FBE460",
          500: "#F9D72C",
          600: "#D6B420",
          700: "#B39316",
          800: "#90740E",
          900: "#775D08",
        },
        danger: {
          DEFAULT: "#FF795E", // color-danger-500
          foreground: "#ffffff",
          100: "#FFEEDE",
          200: "#FFD8BE",
          300: "#FFBD9E",
          400: "#FFA386",
          500: "#FF795E",
          600: "#DB5244",
          700: "#B7312F",
          800: "#931D25",
          900: "#7A1220",
        },
        destructive: {
          DEFAULT: "#FF795E",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#A1F3A6",
          foreground: "#126748",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
