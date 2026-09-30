"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const NO_ES_PARA_TI = [
  "Buscas motivación",
  "Quieres teoría sin ejecución",
  "No estás dispuesto a incomodarte",
  "No quieres asumir responsabilidad",
];

const ES_PARA_TI = [
  "Sabes que puedes rendir mucho más",
  "Has intentado mejorar sin resultados sólidos",
  "Necesitas estructura y exigencia",
  "Quieres desarrollar sistemas reales",
  "Estás dispuesto a asumir responsabilidad",
  "Quieres rodearte de personas con las mismas ganas de crecer que tú",
];

export default function FiltroParaQuien() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-tachado]", { scaleX: 1 });
        return;
      }

      // Los perfiles que no encajan se van tachando al hacer scroll…
      gsap
        .timeline({
          scrollTrigger: {
            trigger: "[data-no]",
            start: "top 70%",
            end: "bottom 45%",
            scrub: 0.5,
          },
        })
        .to("[data-tachado]", { scaleX: 1, ease: "none", stagger: 0.5 }, 0)
        .to("[data-no-item]", { opacity: 0.35, ease: "none", stagger: 0.5 }, 0.3);

      // …y los que sí se van encendiendo.
      gsap.from("[data-si-item]", {
        opacity: 0.15,
        x: -12,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: "[data-si]",
          start: "top 70%",
          end: "bottom 55%",
          scrub: 0.5,
        },
      });
      gsap.from("[data-si-mark]", {
        scale: 0,
        rotate: -90,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: "[data-si]",
          start: "top 70%",
          end: "bottom 55%",
          scrub: 0.5,
        },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="border-b border-white/10 px-6 py-32 sm:px-12 md:px-24">
      <h2
        data-reveal
        className="mx-auto mb-14 max-w-5xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
      >
        Para quién es esto
      </h2>

      <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <div data-no className="border border-white/10 p-8 md:p-10">
          <h3 className="font-display text-lg font-semibold tracking-tight text-muted">
            No es para ti si
          </h3>
          <ul className="mt-8 flex flex-col gap-5">
            {NO_ES_PARA_TI.map((item) => (
              <li
                key={item}
                data-no-item
                className="flex items-start gap-3 text-base leading-snug text-muted"
              >
                <span className="mt-px text-muted" aria-hidden="true">
                  –
                </span>
                <span className="relative">
                  {item}
                  <span
                    data-tachado
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-px w-full origin-left scale-x-0 bg-accent"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div data-si className="border border-accent/40 bg-accent/5 p-8 md:p-10">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-accent">
            Es para ti si
          </h3>
          <ul className="mt-8 flex flex-col gap-5">
            {ES_PARA_TI.map((item) => (
              <li
                key={item}
                data-si-item
                className="flex items-start gap-3 text-lg font-medium leading-snug text-foreground"
              >
                <span data-si-mark className="mt-px inline-block text-accent" aria-hidden="true">
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
