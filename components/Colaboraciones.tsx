"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// [FALTA CONTENIDO] en content.md: sin contexto por marca todavía, así que
// solo se muestran los logos (sin inventar casos). Son PNG de 48 px de alto
// tomados de la web actual y pasados a blanco monocromo (brandbook): sustituir
// por los SVG originales cuando lleguen. Orden y lista: content.md.
const COLABORACIONES = [
  { nombre: "MotoGP", archivo: "motogp", w: 230, h: 39 },
  { nombre: "WBC", archivo: "wbc", w: 86, h: 86 },
  { nombre: "Google", archivo: "google", w: 204, h: 68 },
  { nombre: "AWS", archivo: "aws", w: 192, h: 74 },
  { nombre: "Santander", archivo: "santander", w: 362, h: 63 },
  { nombre: "Reserve", archivo: "reserve", w: 230, h: 64 },
  { nombre: "Talent Class", archivo: "talent-class", w: 192, h: 54 },
  { nombre: "Diza", archivo: "diza", w: 194, h: 52 },
  { nombre: "Nova", archivo: "nova", w: 193, h: 58 },
  { nombre: "MIDEA", archivo: "midea", w: 192, h: 76 },
  { nombre: "FCC", archivo: "fcc", w: 126, h: 73 },
  { nombre: "TW", archivo: "tw", w: 176, h: 82 },
];
const FILAS = [COLABORACIONES.slice(0, 6), COLABORACIONES.slice(6)];
// Cuatro copias por fila: el bucle (-50%) es continuo aunque la fila sea más
// estrecha que la pantalla.
const COPIAS = 4;

function Logo({ c, decorativo = false }: { c: (typeof COLABORACIONES)[number]; decorativo?: boolean }) {
  return (
    <Image
      src={`/assets/colaboraciones/${c.archivo}.png`}
      alt={decorativo ? "" : c.nombre}
      width={c.w}
      height={c.h}
      className="h-8 w-auto sm:h-11"
    />
  );
}

export default function Colaboraciones() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tweens = gsap.utils.toArray<HTMLElement>("[data-track]").map((track, i) =>
        gsap.fromTo(
          track,
          { xPercent: i % 2 ? -50 : 0 },
          { xPercent: i % 2 ? 0 : -50, duration: 38, ease: "none", repeat: -1 },
        ),
      );

      // Scroll rápido acelera las filas; al parar vuelven a su ritmo.
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
          tweens.forEach((t) => {
            gsap.to(t, { timeScale: boost, duration: 0.2, overwrite: true });
            gsap.to(t, { timeScale: 1, duration: 1.2, delay: 0.2, ease: "power2.out" });
          });
        },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="overflow-hidden border-b border-white/10 py-28">
      <h2
        data-reveal
        className="px-6 font-display text-3xl font-bold tracking-tight text-foreground sm:px-12 sm:text-4xl md:px-24"
      >
        Colaboraciones
      </h2>

      <div className="mt-14 space-y-10 motion-reduce:hidden">
        {FILAS.map((fila, i) => (
          <div key={i} className="flex">
            <div data-track className="flex w-max shrink-0 items-center">
              {Array.from({ length: COPIAS }, () => fila).flat().map((c, j) => (
                <span
                  key={`${c.nombre}-${j}`}
                  aria-hidden={j >= fila.length}
                  className="shrink-0 px-8 opacity-60 transition-opacity duration-300 hover:opacity-100 sm:px-14"
                >
                  <Logo c={c} decorativo={j >= fila.length} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-12 hidden flex-wrap items-center gap-x-12 gap-y-8 px-6 motion-reduce:flex sm:px-12 md:px-24">
        {COLABORACIONES.map((c) => (
          <li key={c.nombre}>
            <Logo c={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
