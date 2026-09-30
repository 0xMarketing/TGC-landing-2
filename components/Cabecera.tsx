"use client";

import { useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import BotonMagnetico from "./BotonMagnetico";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Brandbook: el logo va siempre arriba a la izquierda. Aquí la variante sin
// tagline, porque a este tamaño "MENTAL & FITNESS TRAINING CLVB" no se lee
// (la versión completa está en el pie).
export default function Cabecera() {
  const [fueraDelHero, setFueraDelHero] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      start: () => window.innerHeight * 0.8,
      onEnter: () => setFueraDelHero(true),
      onLeaveBack: () => setFueraDelHero(false),
    });
  });

  return (
    <header
      data-fuera={fueraDelHero}
      className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between px-6 transition-colors duration-500 data-[fuera=true]:bg-background/85 sm:px-12 md:px-24"
    >
      <a
        href="#"
        aria-label="THEGRAFTCLVB, volver arriba"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Image
          src="/assets/marca/logo-thegraftclvb-sin-tagline.png"
          alt="THEGRAFTCLVB"
          width={1277}
          height={124}
          priority
          className="h-auto w-36 sm:w-44"
        />
      </a>

      <div
        className={`transition-[opacity,translate] duration-500 ${
          fueraDelHero ? "opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-hidden={!fueraDelHero}
      >
        <BotonMagnetico
          href="#agenda"
          className="px-4 py-2.5 text-xs sm:px-5"
          tabIndex={fueraDelHero ? undefined : -1}
        >
          Agenda tu llamada
        </BotonMagnetico>
      </div>
    </header>
  );
}
