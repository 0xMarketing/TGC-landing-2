"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { romano } from "./marca";
import type { TemploEscena } from "./pilares/TemploEscena";
import {
  PUNTOS_SNAP,
  activoParaProgreso,
  camaraParaProgreso,
  estadoParaProgreso,
  progresoPilar,
} from "./pilares/coreografia";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Pilar = {
  nombre: string;
  // Color de la luz de su columna en el templo 3D.
  luz: string;
  descripcion: string;
  destacado: string;
  detalle?: string;
  contador?: number;
  // Qué aprende quien hace el pilar, a partir de los temas de sus sesiones.
  aprendes: string;
};

// `descripcion`: definición oficial de cada pilar en thegraftclvb.com.
// `destacado`: content.md. `aprendes`: resumen de las sesiones (carpeta SESIONES).
const PILARES: Pilar[] = [
  {
    nombre: "Mental",
    luz: "#b09aff",
    descripcion:
      "Elevas tu nivel de consciencia para aprender a crear sistemas extremadamente prácticos para pensar con claridad.",
    destacado:
      "¿Hoy estoy un paso más cerca o más lejos de la persona en la que me quiero convertir?",
    aprendes:
      "A definir quién eres y quién quieres ser, a entender tus miedos y lo que depende de ti, y a decirte la verdad con preguntas incómodas. Porque tener es consecuencia de ser.",
  },
  {
    nombre: "Físico",
    luz: "#ff3b30",
    descripcion:
      "Ordenas tu entrenamiento de fuerza, tu cardio, tu nutrición, tu suplementación e hidratación, tu descanso.",
    destacado: "10.000 pasos al día",
    contador: 10000,
    detalle: "como mínimo recomendable (≈ 1.000 pasos cada 10 minutos caminando).",
    aprendes:
      "A entrenar fuerza y cardio con criterio propio, porque no existe una rutina universal; a comer bien sin buscar comer perfecto; a suplementarte e hidratarte con cabeza, y a tratar el descanso como el entrenamiento invisible.",
  },
  {
    nombre: "Financiero",
    luz: "#f5b82e",
    descripcion:
      "Entiendes tu relación con el dinero, creas criterio y construyes control. Menos ruido, más tranquilidad.",
    destacado: "activos − pasivos = patrimonio neto",
    aprendes:
      "A ahorrar antes de gastar, a calcular tu patrimonio neto y tu fondo de emergencia, a distinguir la deuda buena de la mala y a construir una cartera de inversión según tu perfil de riesgo.",
  },
  {
    nombre: "Laboral",
    luz: "#33b5ff",
    descripcion:
      "Ganas claridad sobre tu camino profesional, tu propósito y tu siguiente movimiento. Dejas de sobrevivir.",
    destacado: "Si el miedo no existiese, ¿seguirías haciendo lo que haces?",
    aprendes:
      "A ver qué te aporta y qué te resta tu trabajo, a separar estabilidad de plenitud, a comprobar si lo que haces te hace crecer y a elegir tu siguiente paso por decisión, no por inercia.",
  },
  {
    nombre: "Social",
    luz: "#3fd98a",
    descripcion:
      "Revisas tu entorno, tus relaciones y tus límites. Te rodeas de personas que suman y aprendes a elegirte.",
    destacado: "Tiempo ≠ energía",
    detalle:
      "Con quién pasas el día no es lo mismo que cómo te sientes después de estar con esa persona.",
    aprendes:
      "A revisar tu entorno, también el contenido que consumes; a distinguir las relaciones que te elevan de las que te anclan, a no confundir lealtad con obediencia y a poner límites a la presión social.",
  },
];

// Pantallas de scroll que dura la sección pineada (5 pilares + frontón).
const SCROLL_VH = 6;
// Duración del giro automático de entrada, en segundos.
const DURACION_GIRO = 3.2;
const IMAGEN_ESTATICA = "/assets/templo/templo-completo.jpg";

const formatMiles = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function PanelPilar({ pilar, index }: { pilar: Pilar; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const contadorRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-line]", {
        yPercent: 110,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.06,
      });
      gsap.from("[data-fade]", {
        autoAlpha: 0,
        y: 16,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.05,
        delay: 0.15,
      });
      if (pilar.contador && contadorRef.current) {
        const obj = { v: 0 };
        const el = contadorRef.current;
        gsap.to(obj, {
          v: pilar.contador,
          duration: 1.4,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = formatMiles(obj.v);
          },
        });
      }
    },
    { scope: ref },
  );

  const destacado = pilar.contador ? (
    <>
      <span ref={contadorRef} className="tabular-nums text-accent">
        {formatMiles(pilar.contador)}
      </span>{" "}
      {pilar.destacado.replace(formatMiles(pilar.contador), "").trim()}
    </>
  ) : (
    pilar.destacado
  );

  return (
    <div ref={ref}>
      <div className="flex items-baseline gap-4">
        <span aria-hidden="true" className="font-serif text-4xl text-muted sm:text-5xl">
          {romano(index)}
        </span>
        <span className="overflow-hidden">
          <span
            data-line
            className="block font-display text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl"
          >
            {pilar.nombre}
          </span>
        </span>
      </div>

      <p className="mt-3 overflow-hidden lg:mt-5">
        <span
          data-line
          className="block max-w-[40ch] text-base leading-relaxed text-foreground/85 sm:text-lg"
        >
          {pilar.descripcion}
        </span>
      </p>

      <div data-fade className="mt-5 border-l-2 border-accent pl-4 lg:mt-7">
        <p className="max-w-[32ch] font-display text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl lg:text-2xl">
          {destacado}
        </p>
        {pilar.detalle && (
          <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-muted">
            {pilar.detalle}
          </p>
        )}
      </div>

      <div
        data-fade
        className="mt-6 hidden border-t border-white/10 pt-5 lg:mt-8 lg:block [@media(max-height:700px)]:hidden"
      >
        <p className="font-display text-sm font-semibold text-muted">Lo que aprendes</p>
        <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-foreground/80">
          {pilar.aprendes}
        </p>
      </div>
    </div>
  );
}

function PilaresEstatico() {
  return (
    <section className="border-b border-white/10 px-6 py-24 sm:px-12 md:px-24">
      <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
        Los 5 pilares para maximizar tu potencial como persona
      </h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGEN_ESTATICA}
        alt="Templo dórico de cinco columnas iluminadas, una por pilar, con THE RESET en el frontón"
        className="mt-10 w-full max-w-4xl"
      />
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {PILARES.map((p, i) => (
          <div key={p.nombre}>
            <span aria-hidden="true" className="font-serif text-3xl text-muted">
              {romano(i)}
            </span>
            <h3 className="font-display text-3xl font-bold uppercase text-foreground">
              {p.nombre}
            </h3>
            <p className="mt-3 text-foreground/85">{p.descripcion}</p>
            <p className="mt-3 font-display text-xl font-semibold text-foreground">
              {p.destacado}
            </p>
            {p.detalle && <p className="mt-2 text-muted">{p.detalle}</p>}
            <p className="mt-4 text-sm font-semibold text-muted">Lo que aprendes</p>
            <p className="mt-1 text-foreground/80">{p.aprendes}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PilaresScroll() {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReduced,
    () => false,
  );
  const [sinWebGL, setSinWebGL] = useState(false);
  if (reduced || sinWebGL) return <PilaresEstatico />;
  return <PilaresPineado onSinWebGL={() => setSinWebGL(true)} />;
}

function PilaresPineado({ onSinWebGL }: { onSinWebGL: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const escenaRef = useRef<TemploEscena | null>(null);
  const progresoRef = useRef(0);
  const giroRef = useRef({ v: 0 });
  const activoRef = useRef(0);
  const [activo, setActivo] = useState(0);

  const aplicar = (p: number) => {
    progresoRef.current = p;
    const escena = escenaRef.current;
    if (escena) {
      escena.aplicarEstado(estadoParaProgreso(p));
      const cam = camaraParaProgreso(p, escena.camera.aspect, giroRef.current.v);
      escena.setCamara(cam.posicion, cam.objetivo);
    }
    const idx = activoParaProgreso(p);
    if (idx !== activoRef.current) {
      activoRef.current = idx;
      setActivo(idx);
    }
  };

  useEffect(() => {
    let cancelado = false;
    let limpiar = () => {};

    (async () => {
      const [{ TemploEscena }] = await Promise.all([
        import("./pilares/TemploEscena"),
        document.fonts.ready,
      ]);
      const canvas = canvasRef.current;
      const section = sectionRef.current;
      if (cancelado || !canvas || !section) return;

      let escena: TemploEscena;
      try {
        escena = new TemploEscena(canvas, {
          movil: window.innerWidth < 768,
          colores: PILARES.map((p) => p.luz),
        });
      } catch {
        onSinWebGL();
        return;
      }
      escenaRef.current = escena;

      const ajustar = () => {
        const ancho = canvas.clientWidth;
        const alto = canvas.clientHeight;
        const escritorio = ancho >= 1024;
        escena.resize(ancho, alto, escritorio ? 0.17 : 0, escritorio ? 0 : -0.05);
        aplicar(progresoRef.current);
        escena.renderizar();
      };
      const ro = new ResizeObserver(ajustar);
      ro.observe(canvas);
      ajustar();

      const io = new IntersectionObserver(
        ([e]) => escena.setVisible(e.isIntersecting),
        { rootMargin: "200px" },
      );
      io.observe(section);

      limpiar = () => {
        ro.disconnect();
        io.disconnect();
        escena.dispose();
        escenaRef.current = null;
      };
    })();

    return () => {
      cancelado = true;
      limpiar();
    };
    // La escena se crea una vez; `aplicar` solo lee refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      const estado = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * SCROLL_VH}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: PUNTOS_SNAP,
            inertia: false,
            duration: { min: 0.25, max: 0.7 },
            delay: 0.12,
            ease: "power2.inOut",
          },
        },
      });
      triggerRef.current = tl.scrollTrigger ?? null;

      tl.to(estado, {
        p: 1,
        duration: 1,
        onUpdate: () => aplicar(estado.p),
      }).fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);

      // Giro automático (por tiempo, no por scroll) al llegar a la sección.
      // Si se vuelve a subir por encima, se reinicia para repetirse al entrar.
      const giro = giroRef.current;
      let tweenGiro: gsap.core.Tween | null = null;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 30%",
        end: "max",
        onEnter: () => {
          tweenGiro?.kill();
          tweenGiro = gsap.fromTo(
            giro,
            { v: 0 },
            {
              v: 1,
              duration: DURACION_GIRO,
              ease: "power2.inOut",
              onUpdate: () => aplicar(progresoRef.current),
            },
          );
        },
        onLeaveBack: () => {
          tweenGiro?.kill();
          giro.v = 0;
          aplicar(progresoRef.current);
        },
      });
    },
    { scope: sectionRef },
  );

  const irAPilar = (i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    window.scrollTo({
      top: st.start + (st.end - st.start) * progresoPilar(i),
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Los 5 pilares"
      className="relative h-svh overflow-hidden border-b border-white/10 bg-background"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Un templo dórico que se construye columna a columna, una por pilar, y se ilumina en naranja"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-background from-20% via-background/70 via-32% to-transparent to-48% lg:bg-linear-to-r lg:from-background lg:from-15% lg:via-background/70 lg:via-35% lg:to-transparent lg:to-55%"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-end justify-between px-6 pt-24 sm:px-12 md:px-24">
          <h2 className="max-w-3xl font-display text-lg font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Los 5 pilares para maximizar tu potencial como persona
          </h2>
          <p className="shrink-0 pl-4 font-serif text-xl text-muted sm:text-2xl">
            <span className="text-foreground">{romano(activo)}</span> / V
          </p>
        </div>

        <nav
          aria-label="Ir a un pilar"
          className="relative mx-6 mt-4 sm:mx-12 md:mx-24 lg:order-last lg:mb-10 lg:ml-[40%] lg:mt-0"
        >
          <div className="grid grid-cols-5">
            {PILARES.map((p, i) => (
              <button
                key={p.nombre}
                type="button"
                onClick={() => irAPilar(i)}
                aria-current={i === activo ? "step" : undefined}
                className={`flex flex-col items-center gap-0.5 whitespace-nowrap px-1 py-2 font-display text-[10px] font-bold tracking-tight transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-sm sm:uppercase ${
                  i === activo
                    ? "text-accent"
                    : i < activo
                      ? "text-foreground"
                      : "text-muted/60 hover:text-foreground"
                }`}
              >
                <span aria-hidden="true" className="font-serif text-base font-medium leading-none sm:text-xl">
                  {romano(i)}
                </span>
                {p.nombre}
              </button>
            ))}
          </div>
          <div className="h-px bg-white/10">
            <div ref={progressRef} className="h-px w-full origin-left scale-x-0 bg-accent" />
          </div>
        </nav>

        <div className="flex min-h-0 flex-1 items-end px-6 pb-8 sm:px-12 md:px-24 lg:items-start lg:pb-0 lg:pt-8">
          <div className="w-full lg:max-w-[34%]">
            <PanelPilar key={activo} pilar={PILARES[activo]} index={activo} />
          </div>
        </div>
      </div>
    </section>
  );
}
