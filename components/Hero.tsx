"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import BotonMagnetico from "./BotonMagnetico";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.set("[data-hero]", { visibility: "visible" });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = SplitText.create("[data-hero-title]", {
        type: "lines,words",
        mask: "lines",
      });

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from("[data-hero-video]", { scale: 1.25, duration: 2.2, ease: "power2.out" }, 0)
        .from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.035 }, 0.2)
        .from("[data-hero-sub]", { autoAlpha: 0, y: 20, duration: 0.9 }, 0.8)
        .from("[data-hero-cta]", { autoAlpha: 0, y: 20, duration: 0.9 }, 0.95)
        .from("[data-hero-cue]", { autoAlpha: 0, duration: 1 }, 1.3);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to("[data-hero-video]", { scale: 1.15, ease: "none" }, 0)
        .to("[data-hero-content]", { yPercent: -25, autoAlpha: 0, ease: "none" }, 0)
        .to("[data-hero-shade]", { opacity: 1, ease: "none" }, 0);

      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-32 text-center"
    >
      <video
        data-hero-video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        aria-hidden="true"
      >
        <source src="/assets/video-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/70" />
      <div data-hero-shade className="absolute inset-0 bg-background opacity-0" />

      <div data-hero data-hero-content className="relative z-10 mx-auto max-w-5xl">
        <h1
          data-hero-title
          className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          CONVIÉRTETE EN LA PERSONA QUE HUBIERAS ADMIRADO DE{" "}
          <span className="text-accent">PEQUEÑO</span>
        </h1>

        <p
          data-hero-sub
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg"
        >
          THE RESET es un programa de 6 meses para desarrollar sistemas
          prácticos en los 5 pilares de tu vida: mental, físico, financiero,
          laboral y social. No es teoría. Son sistemas con estructura.
        </p>

        <div data-hero-cta className="mt-10">
          <BotonMagnetico href="#agenda" className="px-8 py-4 text-sm">
            Agenda tu llamada
          </BotonMagnetico>
        </div>
      </div>

      <div
        data-hero
        data-hero-cue
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 motion-reduce:hidden"
      >
        <span className="relative block h-12 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_cubic-bezier(0.7,0,0.3,1)_infinite] bg-accent" />
        </span>
      </div>
    </section>
  );
}
