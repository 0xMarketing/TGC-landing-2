import TextoScrub from "./TextoScrub";
import OndaLineas from "./OndaLineas";

// [FALTA CONTENIDO] Enlace de reserva real (Calendly, Cal.com, TidyCal…).
// En cuanto exista, pegarlo aquí y el calendario se incrusta solo.
const URL_CALENDARIO = "";

const PASOS = [
  { titulo: "Elige día y hora", texto: "Reserva tu llamada en el calendario." },
  { titulo: "Hablamos", texto: "Una llamada para ver si encajas en el programa." },
  {
    titulo: "Fase 0",
    texto: "Onboarding y diagnóstico: test en los 5 pilares y compromiso firmado.",
  },
];

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

function CalendarioPendiente() {
  return (
    <div className="relative flex h-full min-h-[32rem] flex-col border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div aria-hidden="true" className="opacity-40">
        <div className="h-4 w-32 bg-white/10" />
        <div className="mt-8 grid grid-cols-7 gap-2">
          {DIAS.map((d) => (
            <span key={d} className="text-center font-display text-xs text-muted">
              {d}
            </span>
          ))}
          {Array.from({ length: 35 }, (_, i) => (
            <span
              key={i}
              className={`aspect-square border ${
                [9, 11, 16, 18, 23].includes(i) ? "border-accent/60" : "border-white/10"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 px-8 text-center">
        <p className="font-display text-lg font-semibold text-foreground">
          Calendario de reservas pendiente de conectar
        </p>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Aquí se incrustará el calendario (Calendly, Cal.com…) en cuanto
          tengamos el enlace.
        </p>
      </div>
    </div>
  );
}

export default function CTAFinal() {
  return (
    <section
      id="agenda"
      className="relative overflow-hidden px-6 py-32 sm:px-12 md:px-24"
    >
      {/*
        TODO [FALTA CONTENIDO]: bloque de escasez/urgencia (content.md →
        "CTA final / escasez"). El mensaje anterior ("Solo 50 plazas",
        sorteo de un Rolex, evento TGC en Madrid en mayo) está confirmado
        como obsoleto por Ivan. No renderizar nada aquí hasta tener plazas
        reales disponibles y confirmación de si hay o no próximo evento.
      */}
      <OndaLineas />

      <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <h2
            data-reveal
            className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-7xl"
          >
            Agenda tu <span className="text-accent">llamada</span>
          </h2>

          <TextoScrub className="mt-8 max-w-lg font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
            Si has leído hasta aquí, ya sabes que esto no es para todo el mundo.
            Si encajas, entras. Si no, no.
          </TextoScrub>

          <ol className="mt-12 border-t border-white/10">
            {PASOS.map((p, i) => (
              <li
                key={p.titulo}
                className="grid grid-cols-[3rem_1fr] border-b border-white/10 py-5"
              >
                <span className="font-display text-sm tabular-nums text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    {p.titulo}
                  </p>
                  <p className="mt-1 text-sm text-muted">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {URL_CALENDARIO ? (
          <iframe
            src={URL_CALENDARIO}
            title="Reserva tu llamada"
            className="h-[42rem] w-full border border-white/10 bg-background"
            loading="lazy"
          />
        ) : (
          <CalendarioPendiente />
        )}
      </div>
    </section>
  );
}
