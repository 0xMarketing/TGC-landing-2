"use client";

import { useEffect, useRef, useState } from "react";

const PREGUNTAS = [
  "Si el dinero y el estatus no fueran materiales, ¿a qué se dedicaría tu vida?",
  "¿Qué te hace feliz de verdad?",
  "¿Qué es lo que más te avergüenza de ti mismo?",
  "¿Qué estarías dispuesto a sacrificar por lo que quieres?",
];

export default function PreguntasIntrospeccion() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen flex-col items-start justify-center gap-10 border-b border-white/10 px-6 py-32 sm:gap-14 sm:px-12 md:px-24"
    >
      {PREGUNTAS.map((pregunta, index) => (
        <p
          key={pregunta}
          className="max-w-4xl font-display text-3xl leading-[1.15] tracking-tight text-foreground transition-all duration-700 ease-out sm:text-4xl md:text-5xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(1rem)",
            transitionDelay: `${index * 350}ms`,
          }}
        >
          {pregunta}
        </p>
      ))}
    </section>
  );
}
