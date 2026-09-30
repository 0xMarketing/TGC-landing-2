import Image from "next/image";

// Respiro visual entre bloques AIDA (INTERÉS → DESEO). Full-bleed, sin
// texto ni motion: la pausa es el propio contraste de imagen tras dos
// secciones densas (PilaresScroll pineada / FasesTimeline con scroll
// horizontal), no un mensaje adicional.
export default function SeccionTransicion() {
  return (
    <section
      aria-hidden="true"
      className="relative h-[50vh] w-full overflow-hidden border-b border-white/10 md:h-[70vh]"
    >
      <Image
        src="/assets/fondo-de-seccion-de-transicion.png"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </section>
  );
}
