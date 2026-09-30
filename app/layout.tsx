import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// El brandbook pide Helvetica Neue LT Pro (75 Bold títulos, 45 Light texto).
// Mientras no haya licencia web se usa TeX Gyre Heros (clon libre de
// Helvetica, GUST Font License), subconjunto latino en app/fonts/. No tiene
// Light: el texto corrido va en Regular. Para pasar a Helvetica Neue basta con
// sustituir estos archivos.
const heros = localFont({
  variable: "--font-heros",
  display: "swap",
  src: [
    { path: "./fonts/texgyreheros-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/texgyreheros-bold.woff2", weight: "700", style: "normal" },
  ],
});

// Serif clásica solo para los numerales romanos de los pilares (en el
// brandbook van en serif sobre las columnas). No se usa para texto de lectura.
const serif = Cormorant_Garamond({
  variable: "--font-serif-marca",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "THE RESET | THEGRAFTCLVB",
  description:
    "Programa de 6 meses de entrenamiento mental y físico estructurado en 5 pilares.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${heros.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
