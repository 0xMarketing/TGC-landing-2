"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function BotonMagnetico({
  href,
  children,
  className = "",
  tabIndex,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;
      if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches)
        return;

      const label = el.querySelector("[data-label]");
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const lxTo = gsap.quickTo(label, "x", { duration: 0.5, ease: "power3.out" });
      const lyTo = gsap.quickTo(label, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = contextSafe((e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.3);
        yTo(dy * 0.4);
        lxTo(dx * 0.12);
        lyTo(dy * 0.15);
      });
      const onLeave = contextSafe(() => {
        gsap.to([el, label], { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      });

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <a
      ref={ref}
      href={href}
      tabIndex={tabIndex}
      className={`group relative inline-block overflow-hidden bg-accent font-bold uppercase tracking-wide text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-bottom scale-y-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100"
      />
      <span data-label className="relative block">
        {children}
      </span>
    </a>
  );
}
