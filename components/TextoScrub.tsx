"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Las palabras pasan de apagadas a encendidas según avanza el scroll.
export default function TextoScrub({
  children,
  className = "",
  as: Tag = "p",
}: {
  children: string;
  className?: string;
  as?: "p" | "h2";
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const split = SplitText.create(ref.current, { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "clamp(top 80%)",
            end: "clamp(bottom 45%)",
            scrub: true,
          },
        },
      );
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
