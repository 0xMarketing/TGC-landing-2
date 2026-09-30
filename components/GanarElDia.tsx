"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { rgba } from "./marca";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// SESIONES/MENTAL semana 4 ("Todo cuenta"): el Día D y el sistema de ganar el año.
const CASCADA = [
  "Para ganar el año, hay que ganar la mayoría de los meses.",
  "Para ganar un mes, hay que ganar la mayoría de las semanas.",
  "Para ganar una semana, hay que ganar la mayoría de los días.",
];
const PREGUNTA =
  "¿Hoy estoy un paso más cerca o más lejos de la persona en la que me quiero convertir?";

const DIAS = 364;
// Patrón fijo (no aleatorio en cada render) con ~72% de días ganados:
// "ganar la mayoría", no todos.
const GANADOS = Array.from({ length: DIAS }, (_, i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x) < 0.72;
});
const TOTAL_GANADOS = GANADOS.filter(Boolean).length;

export default function GanarElDia() {
  const ref = useRef<HTMLElement>(null);
  const contadorRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ganados = gsap.utils.toArray<HTMLElement>("[data-dia='1']");
      const perdidos = gsap.utils.toArray<HTMLElement>("[data-dia='0']");

      if (reduced) {
        gsap.set(ganados, { backgroundColor: rgba("texto", 0.8) });
        gsap.set("[data-linea]", { opacity: 1 });
        return;
      }

      const contador = { v: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-grid-wrap]",
          start: "top 75%",
          end: "bottom 35%",
          scrub: 0.5,
        },
      });

      tl.to(ganados, { backgroundColor: rgba("texto", 0.8), stagger: { each: 1 / ganados.length } }, 0)
        .to(perdidos, { backgroundColor: rgba("texto", 0.1), stagger: { each: 1 / perdidos.length } }, 0)
        .to(
          contador,
          {
            v: TOTAL_GANADOS,
            duration: 1,
            onUpdate: () => {
              if (contadorRef.current)
                contadorRef.current.textContent = String(Math.round(contador.v));
            },
          },
          0,
        );

      gsap.utils.toArray<HTMLElement>("[data-linea]").forEach((linea, i) => {
        tl.fromTo(linea, { opacity: 0.2 }, { opacity: 1, duration: 0.15 }, i * 0.22);
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="border-b border-white/10 px-6 py-32 sm:px-12 md:px-24"
    >
      <div className="mx-auto mb-20 max-w-6xl">
        <h2
          data-reveal
          className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-7xl"
        >
          Todo <span className="text-accent">cuenta.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
          El Día D no se gana el propio Día D. Se gana en los días normales.
          Si la maratón es el 15 de abril, también cuenta lo que haces el 12 de
          febrero.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <ol className="space-y-5">
            {CASCADA.map((frase) => (
              <li
                key={frase}
                data-linea
                className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
              >
                {frase}
              </li>
            ))}
          </ol>
          <div data-linea className="mt-10 border-l-2 border-accent pl-6">
            <p className="text-base text-muted">
              Un día se gana respondiendo con honestidad:
            </p>
            <p className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {PREGUNTA}
            </p>
          </div>
        </div>

        <div data-grid-wrap>
          <div
            className="grid auto-cols-fr grid-flow-col grid-rows-14 gap-[3px] lg:grid-rows-7"
            aria-hidden="true"
          >
            {GANADOS.map((ganado, i) => (
              <span
                key={i}
                data-dia={ganado ? "1" : "0"}
                className="aspect-square w-full bg-white/[0.05]"
              />
            ))}
          </div>
          <p className="mt-6 font-display text-sm tabular-nums text-muted">
            <span ref={contadorRef} className="text-2xl font-bold text-accent">
              0
            </span>{" "}
            de {DIAS} días ganados
          </p>
        </div>
      </div>
    </section>
  );
}
