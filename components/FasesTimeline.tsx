"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Fase = {
  numero: string;
  titulo: string;
  descripcion: string;
  frase?: string;
};

const FASES: Fase[] = [
  {
    numero: "0",
    titulo: "Onboarding y diagnóstico",
    descripcion: "Impacto inicial, test en los 5 pilares, compromiso firmado.",
    frase: "Aquí se decide la adherencia.",
  },
  {
    numero: "1",
    titulo: "Elevación de consciencia",
    descripcion:
      "Construcción de base, orden, estructura. Nacen los 3 niveles: Rookie · Intermediate · Advanced.",
  },
  {
    numero: "2",
    titulo: "Ruptura de identidad",
    descripcion:
      "Eliminación de patrones limitantes, trabajo sobre incoherencias y hábitos reactivos.",
    frase: "La exigencia aumenta.",
  },
  {
    numero: "3",
    titulo: "Creatividad y expansión",
    descripcion: "Nueva forma de operar, claridad estratégica.",
    frase: "Dejas de reaccionar. Empiezas a operar con intención.",
  },
  {
    numero: "4",
    titulo: "Implementación estratégica",
    descripcion: "Disciplina sostenida, ejecución bajo presión.",
  },
  {
    numero: "5",
    titulo: "Consolidación final",
    descripcion: "Autonomía total.",
    frase: "No dependes del programa. Operas con criterio propio.",
  },
];

// Fondos 0-3 generados para cada fase; 4 y 5 reutilizan imágenes del proyecto
// (corredor nocturno y figura que se consolida).
// En el brandbook el naranja nunca es luz ambiental (solo tipografía): las
// imágenes se pasan a blanco y negro por CSS y el naranja queda para la interfaz.
const FONDOS = FASES.map((_, i) => `/assets/fases/fase-${i}.png`);

export default function FasesTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgActivo = useRef(-1);

  const setFondo = (index: number) => {
    if (index === bgActivo.current) return;
    bgActivo.current = index;
    bgRefs.current.forEach((bg, i) => {
      if (!bg) return;
      bg.dataset.active = i === index ? "true" : "false";
    });
  };
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();

      // Desktop, sin prefers-reduced-motion: pin de la sección y conversión
      // de scroll vertical en desplazamiento horizontal (efecto "pista de
      // carrera"). Se elige pin + scrub sobre scroll horizontal nativo
      // porque el resto de la web ya usa este mismo lenguaje en
      // PilaresScroll (scroll vertical del usuario pilotando una animación
      // controlada), lo que da continuidad de interacción entre ambas
      // secciones "de deseo"; además permite sincronizar con precisión la
      // barra de progreso tipo pista y el estado "activo" de cada fase con
      // el punto exacto de scroll, algo que el overflow-x nativo no permite
      // controlar con la misma exactitud.
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const distance = () =>
            track.scrollWidth - section.clientWidth;

          const setActive = (index: number) => {
            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              card.dataset.active = i === index ? "true" : "false";
            });
            dotRefs.current.forEach((dot, i) => {
              if (!dot) return;
              dot.dataset.active = i === index ? "true" : "false";
            });
            setFondo(index);
          };

          setActive(0);

          const st = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set(track, { x: -distance() * self.progress });
              gsap.set(bgWrapRef.current, { xPercent: -4 * self.progress });
              if (progressFillRef.current) {
                gsap.set(progressFillRef.current, {
                  scaleX: self.progress,
                });
              }
              const index = Math.min(
                FASES.length - 1,
                Math.round(self.progress * (FASES.length - 1)),
              );
              setActive(index);
            },
          });

          return () => st.kill();
        },
      );

      // Fuera de ese caso (móvil, o reduced-motion con JS activo antes del
      // fallback CSS): sin pin ni transform, el track hace scroll horizontal
      // nativo. Solo detectamos qué tarjeta está más visible para marcarla
      // como activa, sin animación de scroll forzada.
      mm.add("(max-width: 767.98px)", () => {
        const scroller = mobileTrackRef.current;
        if (!scroller) return;
        const cards = Array.from(scroller.children) as HTMLDivElement[];

        const observer = new IntersectionObserver(
          (entries) => {
            const visible = entries
              .filter((e) => e.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            const index = cards.indexOf(visible.target as HTMLDivElement);
            if (index !== -1) {
              setMobileActiveIndex(index);
              setFondo(index);
            }
          },
          { root: scroller, threshold: [0.5, 0.75, 1] },
        );

        cards.forEach((c) => observer.observe(c));

        return () => observer.disconnect();
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/10 bg-background motion-reduce:overflow-visible"
    >
      <div aria-hidden="true" className="absolute inset-0 motion-reduce:hidden">
        <div ref={bgWrapRef} className="absolute inset-y-0 left-0 w-[108%]">
          {FONDOS.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                bgRefs.current[i] = el;
              }}
              data-active={i === 0 ? "true" : "false"}
              className="absolute inset-0 scale-110 opacity-0 transition-[opacity,scale] duration-[1400ms] ease-out data-[active=true]:scale-100 data-[active=true]:opacity-100"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-right grayscale contrast-125 brightness-[1.8]"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/90" />
      </div>

      {/* Versión con scroll (desktop: pin + horizontal / móvil: scroll-x nativo) */}
      <div className="relative hidden motion-safe:md:block">
        <div className="flex h-screen flex-col justify-center px-6 sm:px-12 md:px-24">
          <h2 className="mb-10 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Fases del programa
          </h2>

          <div
            ref={trackRef}
            className="flex w-max items-stretch gap-6 md:gap-10"
          >
            {FASES.map((fase, i) => (
              <div
                key={fase.numero}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                data-active={i === 0 ? "true" : "false"}
                className="group flex w-[80vw] max-w-[520px] shrink-0 flex-col justify-between border border-white/15 bg-background/85 p-8 transition-[border-color,opacity] duration-300 data-[active=true]:border-accent data-[active=false]:opacity-40 md:w-[36vw] md:p-10"
              >
                <span className="font-display text-6xl font-bold tracking-tight text-muted transition-colors duration-300 group-data-[active=true]:text-accent md:text-7xl">
                  {fase.numero}
                </span>

                <div className="mt-10">
                  <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
                    {fase.titulo}
                  </h3>
                  <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-muted">
                    {fase.descripcion}
                  </p>
                  {fase.frase && (
                    <p className="mt-4 font-display text-lg font-medium leading-snug text-foreground">
                      &ldquo;{fase.frase}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de progreso tipo pista, solo relevante en el modo pin de escritorio */}
          <div className="mt-12 hidden items-center gap-4 md:flex">
            <div className="relative h-px flex-1 bg-white/15">
              <div
                ref={progressFillRef}
                className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-accent"
              />
            </div>
            <div className="flex shrink-0 gap-3">
              {FASES.map((fase, i) => (
                <div
                  key={fase.numero}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  data-active={i === 0 ? "true" : "false"}
                  className="h-1.5 w-1.5 rounded-full bg-white/25 transition-colors duration-300 data-[active=true]:bg-accent"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Móvil: mismo track, pero como scroll horizontal nativo con snap */}
      <div className="relative hidden px-6 py-24 motion-safe:max-md:block sm:px-12">
        <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground">
          Fases del programa
        </h2>
        <div
          ref={mobileTrackRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {FASES.map((fase, i) => (
            <div
              key={fase.numero}
              className={`flex w-[82vw] shrink-0 snap-start flex-col justify-between border bg-background/85 p-7 transition-colors duration-300 ${
                i === mobileActiveIndex
                  ? "border-accent"
                  : "border-white/15 opacity-60"
              }`}
            >
              <span
                className={`font-display text-5xl font-bold tracking-tight ${
                  i === mobileActiveIndex ? "text-accent" : "text-muted"
                }`}
              >
                {fase.numero}
              </span>
              <div className="mt-8">
                <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
                  {fase.titulo}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {fase.descripcion}
                </p>
                {fase.frase && (
                  <p className="mt-3 font-display text-base font-medium leading-snug text-foreground">
                    &ldquo;{fase.frase}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* prefers-reduced-motion: lista estática apilada verticalmente, sin scroll propio */}
      <div className="hidden flex-col gap-8 px-6 py-24 motion-reduce:flex sm:px-12 md:px-24">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Fases del programa
        </h2>
        {FASES.map((fase) => (
          <div
            key={fase.numero}
            className="border-t border-white/15 pt-8 first:border-t-0 first:pt-0"
          >
            <span className="font-display text-4xl font-bold tracking-tight text-accent">
              {fase.numero}
            </span>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground">
              {fase.titulo}
            </h3>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
              {fase.descripcion}
            </p>
            {fase.frase && (
              <p className="mt-3 font-display text-lg font-medium leading-snug text-foreground">
                &ldquo;{fase.frase}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
