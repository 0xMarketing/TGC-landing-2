"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// content.md → "Copy de marca" → Universo TGC (brandbook, pág. 14).
// La jerarquía la hace el contraste: los extremos se apagan y la palabra
// central queda a pleno blanco, igual que en la cartelería.
const PALABRAS = ["Athletes", "Misfits", "Dreamers", "Creatives", "Thinkers"];
const OPACIDAD_POR_DISTANCIA = [1, 0.5, 0.22];

const SEGUNDOS_POR_PALABRA = 0.75;

// Posición de la palabra i respecto a la central (activa), en el rango -2..2.
const slotDe = (i: number, activa: number) => ((i - activa + 7) % 5) - 2;

// Interpola OPACIDAD_POR_DISTANCIA y funde a 0 entre la distancia 2 y 2.5.
const opacidadContinua = (a: number) =>
  a <= 1 ? 1 - 0.5 * a : a <= 2 ? 0.5 - 0.28 * (a - 1) : 0.22 * Math.max(0, (2.5 - a) / 0.5);

export default function EsTuSitio() {
  const ref = useRef<HTMLElement>(null);

  // Ruleta: la lista gira sin parar como un tambor y el brillo de cada palabra
  // depende de lo cerca que pasa del centro. "This is your place" queda fijo.
  // Solo gira en pantalla.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const palabras = gsap.utils.toArray<HTMLElement>("[data-palabra]");
      const estado = { avance: 0 };

      const pintar = () => {
        palabras.forEach((el, i) => {
          // Posición continua respecto al centro, en -2.5..2.5. En los bordes
          // la opacidad es 0, así el salto de arriba abajo no se ve.
          const d = ((((i - 2 - estado.avance) % 5) + 7.5) % 5) - 2.5;
          gsap.set(el, { yPercent: d * 100, opacity: opacidadContinua(Math.abs(d)) });
        });
      };

      const giro = gsap.to(estado, {
        avance: 5,
        duration: 5 * SEGUNDOS_POR_PALABRA,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate: pintar,
      });

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? giro.play() : giro.pause()),
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="border-b border-white/10 px-6 py-28 sm:px-12 md:px-24 md:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center md:gap-16">
        <div className="relative font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <ul className="sr-only">
            {PALABRAS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {/* Copia invisible que da al bloque el ancho y alto de la lista. */}
          <div aria-hidden="true" className="invisible">
            {PALABRAS.map((p) => (
              <div key={p}>{p}</div>
            ))}
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 top-[2.1em] h-[1.05em]">
            {PALABRAS.map((p, i) => {
              const slot = slotDe(i, 2);
              return (
                <span
                  key={p}
                  data-palabra
                  style={{
                    opacity: OPACIDAD_POR_DISTANCIA[Math.abs(slot)],
                    transform: `translateY(${slot * 100}%)`,
                  }}
                  className="absolute left-0 top-0 block whitespace-nowrap"
                >
                  {p}
                </span>
              );
            })}
          </div>
        </div>

        <h2 className="font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          This is <span className="text-accent">your</span> place
        </h2>
      </div>
    </section>
  );
}
