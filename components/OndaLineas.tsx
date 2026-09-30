// Textura de fondo del brandbook THEGRAFTCLVB: una onda de líneas finas
// paralelas que cruza en diagonal. Se genera desde una sola curva Bézier
// desplazada, determinista (sin aleatoriedad) para que no haya diferencias
// entre servidor y cliente.
const LINEAS = 72;

const PATHS = Array.from({ length: LINEAS }, (_, i) => {
  const dx = i * 7;
  const abanico = i * i * 0.05;
  return [
    `M ${640 + dx} -40`,
    `C ${980 + dx + abanico} 160, ${240 + dx + abanico * 1.4} 420, ${600 + dx} 840`,
  ].join(" ");
});

// `ajuste="estirar"` comprime la onda entera en bandas muy anchas y bajas
// (pie), donde "slice" solo enseñaría un tramo casi recto.
export default function OndaLineas({
  className = "",
  ajuste = "cubrir",
}: {
  className?: string;
  ajuste?: "cubrir" | "estirar";
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 800"
      preserveAspectRatio={ajuste === "estirar" ? "none" : "xMaxYMid slice"}
      className={`pointer-events-none absolute inset-0 h-full w-full text-foreground ${className}`}
      style={{
        maskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
      }}
    >
      <g fill="none" stroke="currentColor" strokeOpacity={0.13} strokeWidth={1}>
        {PATHS.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
