import type { Config } from "tailwindcss";

// Paleta del brandbook THEGRAFTCLVB (IDENTIDAD VISUAL, pág. 7).
//
// Nota técnica: Tailwind v4 (usado en este proyecto) ya no lee este archivo
// automáticamente — los mismos valores están duplicados como tokens @theme en
// app/globals.css, que es lo que realmente compila Tailwind/Turbopack. Se deja
// este archivo como fuente de referencia legible y por si se usa alguna
// herramienta (VSCode IntelliSense, scripts) que todavía lo espere. Si cambias
// un color, actualízalo en ambos sitios.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#F4F5F0",
        muted: "#8A8A8A",
        accent: "#FF611A",
      },
      fontFamily: {
        // TeX Gyre Heros (clon libre de Helvetica) en lugar de Helvetica Neue
        // LT Pro hasta tener licencia web — ver app/layout.tsx.
        sans: ["var(--font-heros)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-heros)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
};

export default config;
