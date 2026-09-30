"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CIFRAS = [
  { valor: 6, unidad: "meses", texto: "de programa" },
  { valor: 5, unidad: "pilares", texto: "trabajados a la vez" },
  { valor: 1, unidad: "sesión grupal", texto: "cada semana" },
  { valor: 1, unidad: "sesión con expertos", texto: "cada mes" },
];

// Ciclo semanal del sistema: content.md → "Qué incluye" (misiones obligatorias;
// revisión, medición y ajuste). Los ejemplos de medición salen de las misiones de SESIONES.
const CICLO = [
  { verbo: "Ejecutas", texto: "Misiones obligatorias cada semana en los 5 pilares." },
  {
    verbo: "Mides",
    texto: "Con datos reales: pasos, horas de sueño, gasto, energía, motivación del 1 al 10.",
  },
  { verbo: "Ajustas", texto: "Se revisa lo que has hecho y se corrige antes de la semana siguiente." },
];

// content.md → "Qué incluye", punto 2, desarrollado en una frase por concepto.
const SESION = [
  {
    titulo: "Mental training en vivo",
    texto: "Aprendes un sistema concreto y lo entrenas en directo.",
  },
  {
    titulo: "Corrección de errores",
    texto: "Lo que no ha funcionado en tu semana se señala y se corrige.",
  },
  {
    titulo: "Elevación de estándares",
    texto: "Lo que antes te costaba pasa a ser tu mínimo.",
  },
];

const EXPERTOS = [
  { area: "Performance mental", pilar: "Mental" },
  { area: "Rendimiento físico", pilar: "Físico" },
  { area: "Finanzas", pilar: "Financiero" },
  { area: "Desarrollo profesional", pilar: "Laboral" },
  { area: "Entorno social", pilar: "Social" },
];

const NORMAS = ["Alto estándar", "Normas claras", "Responsabilidad compartida", "Networking"];

// Fila editorial: número y título a la izquierda (sticky en escritorio),
// contenido a la derecha. Sustituye al bento de tarjetas.
function Bloque({
  n,
  titulo,
  extra,
  children,
}: {
  n: number;
  titulo: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-8 border-t border-white/10 py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
      <header className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <div className="flex items-end justify-between gap-4">
            <span className="font-display text-7xl font-bold leading-none tracking-tight text-accent sm:text-8xl">
              {String(n).padStart(2, "0")}
            </span>
            {extra}
          </div>
          <h3 className="mt-6 max-w-xs font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {titulo}
          </h3>
        </div>
      </header>
      <div className="lg:col-span-8">{children}</div>
    </article>
  );
}

export default function QueIncluye() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.utils.toArray<HTMLElement>("[data-cifra]").forEach((el) => {
        const final = Number(el.dataset.cifra);
        if (reduced || final <= 1) return;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: final,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="border-b border-white/10 px-6 py-32 sm:px-12 md:px-24">
      <div className="mx-auto max-w-6xl">
        <h2
          data-reveal
          className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
        >
          Qué incluye THE RESET
        </h2>

        <dl className="mt-14 grid grid-cols-2 gap-y-10 border-y border-white/10 py-10 md:grid-cols-4">
          {CIFRAS.map((c) => (
            <div key={c.unidad} className="pr-4">
              <dt className="sr-only">{c.unidad}</dt>
              <dd>
                <span
                  data-cifra={c.valor}
                  className="block font-display text-6xl font-bold leading-none tracking-tight text-foreground sm:text-7xl"
                >
                  {c.valor}
                </span>
                <span className="mt-3 block font-display text-base font-semibold text-foreground">
                  {c.unidad}
                </span>
                <span className="block text-sm text-muted">{c.texto}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-20">
          <Bloque n={1} titulo="Un sistema que se ejecuta, no que se lee">
            <ol className="grid gap-px bg-white/10 sm:grid-cols-3">
              {CICLO.map((c, i) => (
                <li key={c.verbo} className="bg-background py-5 sm:px-6 sm:first:pl-0">
                  <span className="font-display text-xs tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{c.verbo}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.texto}</p>
                </li>
              ))}
            </ol>
          </Bloque>

          <Bloque
            n={2}
            titulo="Una sesión en directo cada semana"
            extra={
              <span className="flex items-center gap-2 pb-2 font-display text-xs font-semibold text-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
                En vivo
              </span>
            }
          >
            <ul>
              {SESION.map((s) => (
                <li
                  key={s.titulo}
                  className="grid gap-1 border-t border-white/10 py-5 first:border-t-0 first:pt-0 sm:grid-cols-[15rem_1fr] sm:gap-8"
                >
                  <p className="font-display text-lg font-semibold text-foreground">{s.titulo}</p>
                  <p className="leading-relaxed text-muted">{s.texto}</p>
                </li>
              ))}
            </ul>
          </Bloque>

          <Bloque n={3} titulo="Sesión mensual con expertos">
            <p className="text-muted">Especialistas en:</p>
            <ul className="mt-6">
              {EXPERTOS.map((e) => (
                <li
                  key={e.area}
                  className="flex items-baseline justify-between gap-4 border-t border-white/10 py-4"
                >
                  <span className="text-lg font-medium text-foreground">{e.area}</span>
                  <span className="font-display text-xs font-semibold text-muted">{e.pilar}</span>
                </li>
              ))}
            </ul>
          </Bloque>

          {/* [FALTA CONTENIDO] Fotos provisionales recortadas del brandbook (págs. 23-27): sustituir por los originales en alta. */}
          <Bloque n={4} titulo="Comunidad TGC">
            <ul className="flex flex-wrap gap-2">
              {NORMAS.map((n) => (
                <li
                  key={n}
                  className="border border-white/15 px-3 py-1.5 text-sm text-foreground/90"
                >
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              <figure className="relative col-span-2 aspect-[16/9] overflow-hidden">
                <Image
                  src="/assets/comunidad/grupo-comunidad.jpg"
                  alt="Miembros de la comunidad THEGRAFTCLVB posando juntos en un evento"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/assets/comunidad/podcast.jpg"
                  alt="Grabación del podcast de THEGRAFTCLVB"
                  fill
                  sizes="(min-width: 1024px) 27vw, 50vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/assets/comunidad/pop-up-pared.jpg"
                  alt="Pared del pop-up de THEGRAFTCLVB con pósters y camisetas"
                  fill
                  sizes="(min-width: 1024px) 27vw, 50vw"
                  className="object-cover object-top"
                />
              </figure>
            </div>
          </Bloque>
        </div>
      </div>
    </section>
  );
}
