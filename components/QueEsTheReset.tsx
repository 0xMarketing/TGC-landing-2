"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { COLOR, rgba } from "./marca";
import OndaLineas from "./OndaLineas";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// content.md → "Qué es The Reset". La cadena consciencia → comportamiento →
// resultados sale literalmente de la última frase del bloque.
const CADENA = [
  { palabra: "Consciencia", frase: "Cuando aumenta tu nivel de consciencia," },
  { palabra: "Comportamiento", frase: "cambia tu comportamiento." },
  { palabra: "Resultados", frase: "Cuando cambia tu comportamiento, cambian tus resultados." },
];

export default function QueEsTheReset() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-tachado]", { backgroundSize: "100% 3px" });
        gsap.set("[data-nodo]", { opacity: 1 });
        gsap.set("[data-linea-fill]", { scaleX: 1, scaleY: 1 });
        return;
      }

      const split = SplitText.create("[data-si]", { type: "words", mask: "words" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.2}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to("[data-tachado]", { backgroundSize: "100% 3px", duration: 0.5, ease: "power2.inOut" })
        .to("[data-no]", { opacity: 0.3, duration: 0.3 }, "<0.2")
        .from(split.words, { yPercent: 110, stagger: 0.06, duration: 0.4, ease: "power3.out" }, "-=0.1")
        .from("[data-apoyo]", { autoAlpha: 0, y: 20, duration: 0.3 }, "-=0.1")
        .addLabel("cadena", "+=0.1")
        .to("[data-linea-fill]", { scaleX: 1, scaleY: 1, duration: 1.2 }, "cadena");

      gsap.utils.toArray<HTMLElement>("[data-nodo]").forEach((nodo, i) => {
        tl.fromTo(
          nodo,
          { opacity: 0.2 },
          { opacity: 1, duration: 0.25 },
          `cadena+=${i * 0.5}`,
        );
        tl.fromTo(
          nodo.querySelector("[data-punto]"),
          { scale: 0.4, backgroundColor: rgba("texto", 0.2) },
          { scale: 1, backgroundColor: COLOR.acento, duration: 0.25 },
          "<",
        );
      });
      tl.to({}, { duration: 0.3 });

      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden border-b border-white/10 px-6 py-24 sm:px-12 md:px-24"
    >
      <OndaLineas />
      <div className="@container relative mx-auto w-full max-w-6xl">
        <p
          data-no
          className="font-display text-2xl font-semibold tracking-tight text-muted sm:text-4xl"
        >
          <span
            data-tachado
            className="bg-linear-to-r from-accent to-accent bg-[length:0%_3px] bg-[position:0_58%] bg-no-repeat"
          >
            No trabajamos sobre inspiración.
          </span>
        </p>

        <h2
          data-si
          className="mt-4 font-display text-[clamp(1.75rem,10cqw,7.5rem)] font-bold leading-[0.95] tracking-tight text-foreground"
        >
          Trabajamos sobre <span className="text-accent">comportamiento.</span>
        </h2>

        <p
          data-apoyo
          className="mt-8 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg"
        >
          Durante 6 meses entrenas bajo estándares altos, con ejecución
          obligatoria y revisión constante.
        </p>

        <ol className="relative mt-16 grid gap-10 sm:mt-20 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[5px] top-2 w-px bg-white/10 md:bottom-auto md:left-0 md:right-0 md:top-[5px] md:h-px md:w-auto"
          >
            <span
              data-linea-fill
              className="absolute inset-0 origin-top scale-y-0 bg-accent md:origin-left md:scale-x-0 md:scale-y-100"
            />
          </span>
          {CADENA.map((c, i) => (
            <li key={c.palabra} data-nodo className="relative pl-8 md:pl-0 md:pt-10">
              <span
                data-punto
                aria-hidden="true"
                className="absolute left-0 top-0 h-[11px] w-[11px] rounded-full bg-white/20"
              />
              <span className="font-display text-sm tabular-nums text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {c.palabra}
              </p>
              <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-muted sm:text-base">
                {c.frase}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
