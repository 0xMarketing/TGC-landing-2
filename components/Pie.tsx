import Image from "next/image";
import OndaLineas from "./OndaLineas";

// [FALTA CONTENIDO] Enlaces a Podcast, Community y redes de THEGRAFTCLVB:
// no hay URLs confirmadas todavía, así que no se muestran enlaces inventados.
export default function Pie() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-6 py-16 sm:px-12 md:px-24">
      <OndaLineas ajuste="estirar" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <Image
          src="/assets/marca/logo-thegraftclvb.png"
          alt="THEGRAFTCLVB, Mental & Fitness Training Clvb"
          width={1277}
          height={185}
          className="h-auto w-full max-w-sm"
        />
        <div className="flex flex-col gap-4 md:items-end">
          <a
            href="#agenda"
            className="font-display text-sm font-bold uppercase text-foreground underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Agenda tu llamada
          </a>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} THEGRAFTCLVB®
          </p>
        </div>
      </div>
    </footer>
  );
}
