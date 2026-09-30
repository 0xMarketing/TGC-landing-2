import { MEDIDAS, xColumna } from "./medidas";
import type { EstadoTemplo } from "./TemploEscena";

// Reparto del scroll (progreso 0-1 de la sección pineada):
// intro (basamento vacío) → 5 tramos de pilar → final (frontón).
const INTRO = 0.04;
const FINAL = 0.14;
const TRAMO = (1 - INTRO - FINAL) / MEDIDAS.columnas;
// Dentro de cada tramo: construir, encender y reposar (punto de snap).
const FIN_CONSTRUCCION = 0.6;
const FIN_ENCENDIDO = 0.85;
const REPOSO = 0.92;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const suave = (t: number) => t * t * (3 - 2 * t);

const inicioPilar = (i: number) => INTRO + i * TRAMO;
export const progresoPilar = (i: number) => inicioPilar(i) + REPOSO * TRAMO;
export const PUNTOS_SNAP = [
  0,
  ...Array.from({ length: MEDIDAS.columnas }, (_, i) => progresoPilar(i)),
  1,
];

export function activoParaProgreso(p: number) {
  return Math.min(MEDIDAS.columnas - 1, Math.max(0, Math.floor((p - INTRO) / TRAMO)));
}

const construccion = (p: number, i: number) =>
  clamp01((p - inicioPilar(i)) / (TRAMO * FIN_CONSTRUCCION));

export function estadoParaProgreso(p: number): EstadoTemplo {
  const columnas = Array.from({ length: MEDIDAS.columnas }, (_, i) => i);
  return {
    construccion: columnas.map((i) => construccion(p, i)),
    encendido: columnas.map((i) =>
      clamp01(
        (p - inicioPilar(i) - TRAMO * FIN_CONSTRUCCION) /
          (TRAMO * (FIN_ENCENDIDO - FIN_CONSTRUCCION)),
      ),
    ),
    fronton: clamp01((p - (1 - FINAL)) / (FINAL * 0.7)),
  };
}

// Waypoints de cámara en órbita alrededor del templo: ángulo (grados, 0 =
// frente), radio, altura de la cámara y punto al que mira. Entre dos
// waypoints se interpola con easeInOut, así la cámara frena en cada pilar.
type Waypoint = { p: number; ang: number; radio: number; alto: number; x: number; y: number };

// Con el scroll la cámara solo se desplaza un poco para encuadrar cada
// columna; el giro de entrada va aparte (ver `giro` en camaraParaProgreso).
const WAYPOINTS: Waypoint[] = [
  { p: 0, ang: -38, radio: 18.5, alto: 5, x: xColumna(0) * 0.45, y: 3.2 },
  ...Array.from({ length: MEDIDAS.columnas }, (_, i) => ({
    p: progresoPilar(i),
    ang: -30 + i * 13,
    radio: 17.5,
    alto: 4.4,
    x: xColumna(i) * 0.45,
    y: 3.4,
  })),
  { p: 1, ang: 10, radio: 24, alto: 2.2, x: 0, y: 4.4 },
];

// Giro automático al llegar a la sección: órbita de ~200° alrededor del
// basamento, desde un plano alto y abierto. giro: 0 = inicio, 1 = terminado.
const GIRO_GRADOS = 200;

export function camaraParaProgreso(p: number, aspecto: number, giro = 1) {
  let k = 0;
  while (k < WAYPOINTS.length - 2 && p > WAYPOINTS[k + 1].p) k++;
  const a = WAYPOINTS[k];
  const b = WAYPOINTS[k + 1];
  const t = suave(clamp01((p - a.p) / (b.p - a.p)));
  const l = (u: number, v: number) => u + (v - u) * t;

  // En vertical hay menos ancho de encuadre: la cámara se aleja.
  const alejar = Math.min(2.2, Math.max(1, 1.35 / aspecto));
  const pendiente = 1 - clamp01(giro);
  const ang = ((l(a.ang, b.ang) - GIRO_GRADOS * pendiente) * Math.PI) / 180;
  const radio = l(a.radio, b.radio) * alejar * (1 + 0.25 * pendiente);
  const objetivo = {
    x: l(a.x, b.x) * (1 - pendiente),
    y: l(a.y, b.y) - 1.2 * pendiente,
    z: 0,
  };
  return {
    posicion: {
      x: objetivo.x + Math.sin(ang) * radio,
      y: (l(a.alto, b.alto) + 4 * pendiente) * (alejar > 1 ? 1 + (alejar - 1) * 0.5 : 1),
      z: Math.cos(ang) * radio,
    },
    objetivo,
  };
}
