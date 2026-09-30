"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Montado al final de la página: sus efectos se crean después de los pins
// de las secciones, así los triggers de cada título ya ven el espaciado real.
export default function EfectosScroll() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        scrub: 0.3,
      },
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const splits: SplitText[] = [];
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines" });
      splits.push(split);
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    ScrollTrigger.refresh();
    return () => splits.forEach((s) => s.revert());
  });

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 origin-left scale-x-0 bg-accent"
    />
  );
}
