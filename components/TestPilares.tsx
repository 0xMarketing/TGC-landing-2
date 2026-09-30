"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { COLOR, rgba, romano } from "./marca";

gsap.registerPlugin(useGSAP);

type PilarId = "mental" | "fisico" | "financiero" | "laboral" | "social";

type Pregunta = {
  texto: string;
  opciones: string[];
};

type PilarTest = {
  id: PilarId;
  nombre: string;
  preguntas: [Pregunta, Pregunta];
};

// Preguntas ancladas en conceptos reales de content.md por pilar (no copy de
// relleno): honestidad radical / "ganar el día" (Mental), patrones de
// movimiento y sueño (Físico), tasa de ahorro y patrimonio neto (Financiero),
// elección consciente vs. inercia (Laboral), entorno y energía (Social).
// Pendiente de revisión del wording exacto antes de publicar.
const PILARES: PilarTest[] = [
  {
    id: "mental",
    nombre: "Mental",
    preguntas: [
      {
        texto:
          "En una semana normal, ¿con qué frecuencia terminas el día pudiendo responder con honestidad que has estado un paso más cerca de la persona que quieres ser?",
        opciones: [
          "Casi nunca",
          "A veces",
          "La mayoría de los días",
          "Casi siempre",
        ],
      },
      {
        texto:
          "Cuando algo te agobia, ¿distingues si está dentro o fuera de tu control antes de cargar con ello?",
        opciones: [
          "Nunca, me lo cargo todo",
          "A veces",
          "Casi siempre",
          "Siempre, y ajusto el agobio a mi responsabilidad real",
        ],
      },
    ],
  },
  {
    id: "fisico",
    nombre: "Físico",
    preguntas: [
      {
        texto:
          "¿Cuántos días a la semana entrenas fuerza con algún patrón de movimiento estructurado (push, pull, sentadilla, bisagra de cadera, core)?",
        opciones: ["0", "1-2", "3-4", "5+"],
      },
      {
        texto: "¿Cómo describirías tu sueño en una semana normal?",
        opciones: [
          "Duermo mal y lo considero normal",
          "Duermo lo justo, sin priorizarlo",
          "Lo cuido cuando puedo",
          "Es una prioridad no negociable",
        ],
      },
    ],
  },
  {
    id: "financiero",
    nombre: "Financiero",
    preguntas: [
      {
        texto:
          "¿Qué porcentaje aproximado de tus ingresos ahorras o inviertes cada mes?",
        opciones: ["Menos del 10%", "10-15%", "15-25%", "Más del 40%"],
      },
      {
        texto:
          "¿Sabrías decir ahora mismo tu patrimonio neto (activos menos pasivos)?",
        opciones: [
          "No tengo ni idea",
          "Una idea aproximada",
          "Lo sé pero no le hago seguimiento",
          "Lo calculo y reviso regularmente",
        ],
      },
    ],
  },
  {
    id: "laboral",
    nombre: "Laboral",
    preguntas: [
      {
        texto:
          "Si el miedo no existiese, ¿seguirías haciendo exactamente lo que haces hoy en tu trabajo?",
        opciones: ["No, para nada", "Con dudas", "Probablemente sí", "Sí, sin dudarlo"],
      },
      {
        texto:
          "¿Sientes que tu trabajo actual aporta sentido, crecimiento y te acerca a quien quieres ser?",
        opciones: ["Ninguna de las tres", "Una de las tres", "Dos de las tres", "Las tres"],
      },
    ],
  },
  {
    id: "social",
    nombre: "Social",
    preguntas: [
      {
        texto:
          "Pensando en las personas con las que más tiempo pasas, ¿te dejan con más energía de la que tenías o te la quitan?",
        opciones: [
          "Me la quitan casi siempre",
          "Depende del día",
          "La mayoría me suman",
          "Casi todas me suman energía",
        ],
      },
      {
        texto:
          "Con las personas con las que más tiempo pasas, ¿puedes ser tú mismo o te censuras para encajar?",
        opciones: [
          "Me hago pequeño para encajar",
          "Me censuro a menudo",
          "Casi siempre soy yo",
          "Soy yo mismo con todas",
        ],
      },
    ],
  },
];

type Respuestas = Record<PilarId, [number | null, number | null]>;

const RESPUESTAS_INICIALES: Respuestas = {
  mental: [null, null],
  fisico: [null, null],
  financiero: [null, null],
  laboral: [null, null],
  social: [null, null],
};

type EstadoEnvio = "idle" | "enviando" | "exito" | "error";

function calcularPilarMasDebil(respuestas: Respuestas): PilarId {
  let peor: PilarId = PILARES[0].id;
  let peorPuntuacion = Infinity;

  for (const pilar of PILARES) {
    const [a, b] = respuestas[pilar.id];
    const puntuacion = (a ?? 0) + (b ?? 0);
    if (puntuacion < peorPuntuacion) {
      peorPuntuacion = puntuacion;
      peor = pilar.id;
    }
  }

  return peor;
}

export default function TestPilares() {
  const [paso, setPaso] = useState(0); // 0-4: pilares, 5: resultado
  const [respuestas, setRespuestas] = useState<Respuestas>(
    RESPUESTAS_INICIALES,
  );
  const [email, setEmail] = useState("");
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("idle");

  const enPilares = paso < PILARES.length;
  const pilarActual = enPilares ? PILARES[paso] : null;

  const pilarMasDebil = useMemo(
    () => calcularPilarMasDebil(respuestas),
    [respuestas],
  );

  const nombrePilarMasDebil = PILARES.find(
    (p) => p.id === pilarMasDebil,
  )?.nombre;

  function seleccionarRespuesta(
    pilarId: PilarId,
    preguntaIndex: 0 | 1,
    valor: number,
  ) {
    setRespuestas((prev) => {
      const actualizado: [number | null, number | null] = [...prev[pilarId]];
      actualizado[preguntaIndex] = valor;
      return { ...prev, [pilarId]: actualizado };
    });
  }

  const pasoCompleto =
    pilarActual !== null &&
    respuestas[pilarActual.id][0] !== null &&
    respuestas[pilarActual.id][1] !== null;

  async function enviarFormulario(event: React.FormEvent) {
    event.preventDefault();
    setEstadoEnvio("enviando");

    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pilarMasDebil,
          respuestas,
        }),
      });

      if (!res.ok) throw new Error("Fallo en el envío");
      setEstadoEnvio("exito");
    } catch {
      setEstadoEnvio("error");
    }
  }

  return (
    <section className="grid border-b border-white/10 lg:min-h-svh lg:grid-cols-2">
      <div className="px-6 py-24 sm:px-12 md:px-16 lg:py-32 xl:px-24">
      <div className="max-w-xl">
        <h2
          data-reveal
          className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          ¿Cuál es tu pilar más débil ahora mismo?
        </h2>

        {/* Progreso: un punto por pilar, relleno naranja hasta el paso actual */}
        <div className="mt-10 flex items-center gap-3">
          {PILARES.map((pilar, i) => (
            <div
              key={pilar.id}
              className={`h-1.5 flex-1 transition-colors duration-300 ${
                i <= paso || paso >= PILARES.length
                  ? "bg-accent"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>

        {enPilares && pilarActual && (
          <div className="mt-14">
            <span className="flex items-baseline gap-3 font-display text-lg font-bold uppercase tracking-tight text-accent">
              <span aria-hidden="true" className="font-serif text-3xl font-medium normal-case">
                {romano(paso)}
              </span>
              {pilarActual.nombre}
            </span>

            <div className="mt-8 flex flex-col gap-10">
              {pilarActual.preguntas.map((pregunta, preguntaIndex) => (
                <div key={pregunta.texto}>
                  <p className="max-w-xl text-lg leading-snug text-foreground">
                    {pregunta.texto}
                  </p>
                  <div className="mt-5 flex flex-col gap-3">
                    {pregunta.opciones.map((opcion, opcionIndex) => {
                      const seleccionado =
                        respuestas[pilarActual.id][preguntaIndex as 0 | 1] ===
                        opcionIndex;
                      return (
                        <button
                          key={opcion}
                          type="button"
                          onClick={() =>
                            seleccionarRespuesta(
                              pilarActual.id,
                              preguntaIndex as 0 | 1,
                              opcionIndex,
                            )
                          }
                          className={`border px-5 py-4 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            seleccionado
                              ? "border-accent bg-accent/5 text-foreground"
                              : "border-white/15 text-muted hover:border-white/30"
                          }`}
                        >
                          {opcion}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPaso((p) => Math.max(0, p - 1))}
                disabled={paso === 0}
                className="text-sm font-semibold uppercase tracking-wide text-muted transition-colors hover:text-foreground disabled:opacity-0 disabled:pointer-events-none"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setPaso((p) => p + 1)}
                disabled={!pasoCompleto}
                className="bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {paso === PILARES.length - 1 ? "Ver resultado" : "Siguiente"}
              </button>
            </div>
          </div>
        )}

        {!enPilares && (
          <div className="mt-14">
            <p className="text-lg leading-relaxed text-muted">
              Tu pilar más débil ahora mismo es
            </p>
            <p className="mt-2 font-display text-5xl font-bold tracking-tight text-accent sm:text-6xl">
              {nombrePilarMasDebil}
            </p>

            {estadoEnvio === "exito" ? (
              <p className="mt-10 max-w-md text-base leading-relaxed text-foreground">
                Revisa tu email — te hemos enviado tu plan de acción inicial
                para este pilar.
              </p>
            ) : (
              <form
                onSubmit={enviarFormulario}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full max-w-sm border border-white/15 bg-transparent px-5 py-4 text-base text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <button
                  type="submit"
                  disabled={estadoEnvio === "enviando"}
                  className="shrink-0 bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {estadoEnvio === "enviando"
                    ? "Enviando..."
                    : "Recibe tu plan de acción"}
                </button>
              </form>
            )}

            {estadoEnvio === "error" && (
              <p className="mt-4 text-sm text-muted">
                No hemos podido enviar tu plan. Inténtalo de nuevo en unos
                minutos.
              </p>
            )}
          </div>
        )}
      </div>
      </div>

      <MapaPilares
        respuestas={respuestas}
        pasoActual={enPilares ? paso : null}
        pilarMasDebil={enPilares ? null : pilarMasDebil}
      />
    </section>
  );
}

const MAX_PUNTOS = 6;
const CX = 200;
const CY = 190;
const R = 120;
// Posición inicial fija: como no cambia entre renders, React no pisa los
// atributos que GSAP va animando.
const INICIAL = PILARES.map(() => 0.03);

function vertice(i: number, t: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / PILARES.length;
  return [CX + Math.cos(a) * R * t, CY + Math.sin(a) * R * t] as const;
}

const poligono = (valores: number[]) =>
  valores.map((v, i) => vertice(i, v).join(",")).join(" ");

function puntuacion(r: [number | null, number | null]) {
  return (r[0] ?? 0) + (r[1] ?? 0);
}

function MapaPilares({
  respuestas,
  pasoActual,
  pilarMasDebil,
}: {
  respuestas: Respuestas;
  pasoActual: number | null;
  pilarMasDebil: PilarId | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const areaRef = useRef<SVGPolygonElement>(null);
  const puntosRef = useRef<(SVGCircleElement | null)[]>([]);
  const actual = useRef([...INICIAL]);

  const objetivo = PILARES.map((p) =>
    Math.max(0.03, puntuacion(respuestas[p.id]) / MAX_PUNTOS),
  );
  const clave = objetivo.join("|");
  const algunaRespuesta = PILARES.some(
    (p) => respuestas[p.id][0] !== null || respuestas[p.id][1] !== null,
  );

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(actual.current, {
        ...Object.fromEntries(objetivo.map((v, i) => [i, v])),
        duration: reduced ? 0 : 0.8,
        ease: "elastic.out(1, 0.6)",
        onUpdate: () => {
          areaRef.current?.setAttribute("points", poligono(actual.current));
          actual.current.forEach((v, i) => {
            const [x, y] = vertice(i, v);
            puntosRef.current[i]?.setAttribute("cx", String(x));
            puntosRef.current[i]?.setAttribute("cy", String(y));
          });
        },
      });
    },
    { dependencies: [clave], scope: ref },
  );

  useGSAP(
    () => {
      if (!pilarMasDebil) return;
      gsap.fromTo(
        "[data-pulso]",
        { attr: { r: 6 }, opacity: 0.8 },
        { attr: { r: 26 }, opacity: 0, duration: 1.6, repeat: -1, ease: "power2.out" },
      );
    },
    { dependencies: [pilarMasDebil], scope: ref, revertOnUpdate: true },
  );

  const idxDebil = pilarMasDebil ? PILARES.findIndex((p) => p.id === pilarMasDebil) : -1;

  return (
    <div
      ref={ref}
      className="border-t border-white/10 bg-background px-6 py-20 sm:px-12 lg:border-l lg:border-t-0 lg:px-16"
    >
      <div className="mx-auto flex max-w-md flex-col justify-center lg:sticky lg:top-0 lg:h-svh">
        <p className="font-display text-sm font-semibold text-muted">
          Tu mapa de los 5 pilares
        </p>

        <svg
          viewBox="0 20 400 345"
          className="mt-4 w-full overflow-visible"
          role="img"
          aria-label="Puntuación actual en cada pilar"
        >
          {[1 / 3, 2 / 3, 1].map((t) => (
            <polygon
              key={t}
              points={poligono(PILARES.map(() => t))}
              fill="none"
              stroke={rgba("texto", 0.1)}
              strokeWidth={1}
            />
          ))}
          {PILARES.map((p, i) => {
            const [x, y] = vertice(i, 1);
            return (
              <line key={p.id} x1={CX} y1={CY} x2={x} y2={y} stroke={rgba("texto", 0.08)} />
            );
          })}

          <polygon
            ref={areaRef}
            points={poligono(INICIAL)}
            fill={rgba("acento", 0.16)}
            stroke={COLOR.acento}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {idxDebil >= 0 && (
            <circle
              data-pulso
              cx={vertice(idxDebil, objetivo[idxDebil])[0]}
              cy={vertice(idxDebil, objetivo[idxDebil])[1]}
              r={6}
              fill="none"
              stroke={COLOR.acento}
              strokeWidth={2}
            />
          )}
          {PILARES.map((p, i) => {
            const [x, y] = vertice(i, INICIAL[i]);
            return (
              <circle
                key={p.id}
                ref={(el) => {
                  puntosRef.current[i] = el;
                }}
                cx={x}
                cy={y}
                r={i === idxDebil ? 6 : 4}
                fill={i === idxDebil ? COLOR.acento : COLOR.texto}
                stroke={COLOR.fondo}
                strokeWidth={2}
              />
            );
          })}

          {PILARES.map((p, i) => {
            const [x, y] = vertice(i, 1.2);
            const activo = i === pasoActual || i === idxDebil;
            return (
              <text
                key={p.id}
                x={x}
                y={y}
                textAnchor={Math.abs(x - CX) < 5 ? "middle" : x > CX ? "start" : "end"}
                dominantBaseline="middle"
                className="font-display text-[15px] font-semibold transition-[fill] duration-300"
                fill={activo ? COLOR.acento : rgba("texto", 0.75)}
              >
                {p.nombre}
              </text>
            );
          })}
        </svg>

        <ul className="mt-6 space-y-2.5">
          {PILARES.map((p, i) => {
            const pts = puntuacion(respuestas[p.id]);
            return (
              <li key={p.id} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className={i === idxDebil ? "text-accent" : "text-foreground/80"}>
                  {p.nombre}
                </span>
                <span className="h-0.5 bg-white/10">
                  <span
                    className="block h-full origin-left bg-accent transition-transform duration-700 ease-out"
                    style={{ transform: `scaleX(${pts / MAX_PUNTOS})` }}
                  />
                </span>
                <span className="text-right font-display tabular-nums text-muted">
                  {pts}/{MAX_PUNTOS}
                </span>
              </li>
            );
          })}
        </ul>

        {!algunaRespuesta && (
          <p className="mt-6 text-sm text-muted">
            Responde a la izquierda y tu mapa se irá dibujando.
          </p>
        )}
      </div>
    </div>
  );
}
