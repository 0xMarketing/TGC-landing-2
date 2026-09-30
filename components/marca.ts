// Colores del brandbook para los sitios donde no llegan las clases de
// Tailwind: tweens de GSAP y atributos fill/stroke de SVG. Espejo de los
// tokens @theme de app/globals.css — si cambias uno, cambia el otro.
export const COLOR = {
  fondo: "#000000",
  texto: "#f4f5f0",
  acento: "#ff611a",
} as const;

const RGB = {
  texto: "244,245,240",
  acento: "255,97,26",
} as const;

// Brandbook: los pilares se numeran con romanos I-V (la V del logo son los
// 5 pilares). Índice base 0.
const ROMANOS = ["I", "II", "III", "IV", "V"];
export const romano = (i: number) => ROMANOS[i] ?? String(i + 1);

export const rgba =(color: keyof typeof RGB, alpha: number) =>
  `rgba(${RGB[color]},${alpha})`;
