import Image from "next/image";

type Testimonio = {
  slug: string;
  nombre: string;
  cargo: string;
  cita: string;
};

// content.md → "Copy de marca" → Testimonios (brandbook, pág. 21). Citas
// literales. Fotos: recortes provisionales del PDF en
// /public/assets/rockstars/ (345 px de ancho): sustituir por los originales.
// Cargos marcados [VERIFICAR] en content.md: confirmar antes de publicar.
const TESTIMONIOS: Testimonio[] = [
  {
    slug: "alberto-calzada",
    nombre: "Alberto Calzada",
    cargo: "Agente de Diza Consultores",
    cita: "Ni yo lo entendía. Corrí la media maratón lesionado, me enfrenté a la incertidumbre y superé mis miedos.",
  },
  {
    slug: "paula-lopez",
    nombre: "Paula López",
    cargo: "Estudiante",
    cita: "Pensé que nunca podría, pero aquí estoy. He conseguido correr media maratón y me siento más fuerte que nunca.",
  },
  {
    slug: "jorge-gamero",
    nombre: "Jorge Gamero",
    cargo: "Jefe de montaje y producción en Media Pro",
    cita: "De pandillero al borde del abismo a encontrar la fuerza para ser un mejor padre y profesional. Mi vida cambió cuando decidí luchar.",
  },
  {
    slug: "benjamin-garcia",
    nombre: "Benjamín García",
    cargo: "CEO de Benji Group",
    cita: "Triunfé en los negocios. Fallé conmigo. Hasta ahora.",
  },
  {
    slug: "enrike-salar",
    nombre: "Enrike Salar",
    cargo: "CEO de Enrike's Coffee",
    cita: "Modelo, piloto, quebrado y ahora renacido. He reinventado mi vida con 49 años.",
  },
  {
    slug: "jose-delgado",
    nombre: "Jose Delgado",
    cargo: "Director de ventas en Diza Consultores",
    cita: "Era inseguro y emocionalmente inestable. Ahora soy líder en el trabajo y en la vida. He aprendido a creer en mí, a disfrutar de nuevo.",
  },
  {
    slug: "adam-trenado",
    nombre: "Adam Trenado",
    cargo: "Boxeador profesional",
    cita: "Aprendí a creer tanto en mí que la vida no tiene otra opción que darme la victoria. Antes vivía con dudas, ahora vivo con la seguridad de que lo conseguiré.",
  },
  {
    slug: "amaya-udabe",
    nombre: "Amaya Udabe",
    cargo: "Opositora a registradora de la propiedad",
    cita: "A los 21 he conseguido transformar todo mi dolor interior en poder. He reescrito mi historia.",
  },
  {
    slug: "valentin-gonzalez",
    nombre: "Valentín González",
    cargo: "CEO de Vigy Luxury Sportswear",
    cita: "Siempre quise ser el mejor y en TGC descubrí cómo llevar mi cuerpo y mi mente al siguiente nivel. Esto es solo el comienzo.",
  },
  {
    slug: "josep-sese",
    nombre: "Josep Sese",
    cargo: "CEO de Non-Stop Gym 24h",
    cita: "Pasé de enfermero a CEO de mi propia cadena de gimnasios. Con TGC aprendí a desafiar mis límites y ahora voy a por todo.",
  },
];

// Sección quieta a propósito (design-brief: el motion se reserva para
// PilaresScroll y FasesTimeline). Los retratos son siempre en blanco y negro,
// como en el brandbook.
export default function Rockstars() {
  return (
    <section id="rockstars" className="border-b border-white/10 px-6 py-32 sm:px-12 md:px-24">
      <div className="mx-auto max-w-7xl">
        <h2
          data-reveal
          className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
        >
          +325 casos de éxito de clientes
        </h2>

        <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {TESTIMONIOS.map((t) => (
            <li key={t.slug}>
              <figure>
                <div className="relative aspect-[345/248] overflow-hidden">
                  <Image
                    src={`/assets/rockstars/${t.slug}.jpg`}
                    alt={`Retrato de ${t.nombre}`}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
                  />
                </div>

                <figcaption className="-mt-8 relative text-center">
                  <span className="block font-display text-sm font-bold uppercase tracking-tight text-foreground">
                    {t.nombre}
                  </span>
                  <span className="mt-1 block min-h-[2.75em] text-[11px] uppercase leading-snug text-muted">
                    {t.cargo}
                  </span>
                </figcaption>

                <blockquote className="mt-5 text-center">
                  <span aria-hidden="true" className="block font-serif text-4xl leading-none text-muted">
                    “
                  </span>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground/85">{t.cita}</p>
                </blockquote>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
