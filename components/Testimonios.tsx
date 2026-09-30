"use client";

import { useEffect, useState } from "react";

const TESTIMONIOS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  nombre: `Testimonio ${i + 1}`,
}));

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6 text-background sm:h-7 sm:w-7"
    >
      <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
    </svg>
  );
}

export default function Testimonios() {
  const [activo, setActivo] = useState<number | null>(null);

  useEffect(() => {
    if (activo === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActivo(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activo]);

  const testimonioActivo = TESTIMONIOS.find((t) => t.id === activo) ?? null;

  return (
    <section className="border-b border-white/10 px-6 py-32 sm:px-12 md:px-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Testimonios
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIOS.map((testimonio) => (
            <button
              key={testimonio.id}
              type="button"
              onClick={() => setActivo(testimonio.id)}
              className="group relative aspect-video w-full overflow-hidden border border-white/10 bg-white/5 text-left transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
                  <PlayIcon />
                </span>
              </span>
              <span className="absolute bottom-3 left-4 text-sm text-muted">
                {testimonio.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {testimonioActivo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6"
          onClick={() => setActivo(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivo(null)}
              aria-label="Cerrar"
              className="absolute -top-10 right-0 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cerrar (Esc)
            </button>
            <div className="flex aspect-video w-full items-center justify-center border border-white/10 bg-white/5">
              <span className="text-sm text-muted">
                Vídeo pendiente — {testimonioActivo.nombre}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
