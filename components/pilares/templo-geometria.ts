import * as THREE from "three";
import { ALTURA_TAMBOR, MEDIDAS, xColumna } from "./medidas";

// Piezas del templo. Si llega un modelo real (GLB), este es el único archivo
// que hay que sustituir.

// Metros de piedra que cubre una repetición de la textura.
const TESELA = 2.4;

// --- Ruido de valor 3D determinista (para desgaste y desconchones) ---------

function hash(x: number, y: number, z: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function ruido(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fx = x - xi;
  const fy = y - yi;
  const fz = z - zi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const w = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

const fbm = (x: number, y: number, z: number) =>
  ruido(x, y, z) * 0.6 + ruido(x * 2.1 + 17, y * 2.1, z * 2.1) * 0.4;

const suave = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// --- UVs en escala real --------------------------------------------------

// Proyección plana por cara según la normal dominante: la piedra mantiene el
// mismo tamaño de grano en cualquier bloque, sin estirarse.
function uvPlanar(geo: THREE.BufferGeometry, desfase: number) {
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  for (let k = 0; k < pos.count; k++) {
    const ax = Math.abs(nor.getX(k));
    const ay = Math.abs(nor.getY(k));
    const az = Math.abs(nor.getZ(k));
    const [a, b] =
      ax >= ay && ax >= az
        ? [pos.getZ(k), pos.getY(k)]
        : ay >= az
          ? [pos.getX(k), pos.getZ(k)]
          : [pos.getX(k), pos.getY(k)];
    uv.setXY(k, (a + desfase) / TESELA, (b + desfase * 0.37) / TESELA);
  }
}

// Desgasta aristas y esquinas de una caja subdividida. El desplazamiento solo
// depende de la posición, así que los vértices duplicados en las aristas se
// mueven igual y la malla no se abre.
function erosionar(geo: THREE.BufferGeometry, fuerza: number, semilla: number) {
  geo.computeBoundingBox();
  const caja = geo.boundingBox!;
  const centro = caja.getCenter(new THREE.Vector3());
  const semi = caja.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const banda = Math.min(0.12, Math.min(semi.x, semi.y, semi.z) * 0.9);

  for (let k = 0; k < pos.count; k++) {
    v.fromBufferAttribute(pos, k).sub(centro);
    const cx = suave(semi.x - banda, semi.x, Math.abs(v.x));
    const cy = suave(semi.y - banda, semi.y, Math.abs(v.y));
    const cz = suave(semi.z - banda, semi.z, Math.abs(v.z));
    const arista = Math.min(1, cx * cy + cy * cz + cx * cz);
    const n = fbm(v.x * 8 + semilla, v.y * 8, v.z * 8);
    const golpe = Math.max(0, n - 0.42) * 1.7;
    const hundir = fuerza * (arista * golpe + 0.12 * (n - 0.5));
    v.x -= Math.sign(v.x) * cx * hundir;
    v.y -= Math.sign(v.y) * cy * hundir * 0.7;
    v.z -= Math.sign(v.z) * cz * hundir;
    pos.setXYZ(k, v.x + centro.x, v.y + centro.y, v.z + centro.z);
  }
}

let contadorSemilla = 1;
const siguienteSemilla = () => (contadorSemilla = (contadorSemilla * 16807) % 2147483647) % 997;

// Bloque de piedra: caja subdividida, erosionada y con UVs en escala real.
export function bloque(
  ancho: number,
  alto: number,
  fondo: number,
  material: THREE.Material,
  fuerza = 0.07,
) {
  const densidad = 7;
  const geo = new THREE.BoxGeometry(
    ancho,
    alto,
    fondo,
    Math.max(2, Math.round(ancho * densidad)),
    Math.max(2, Math.round(alto * densidad)),
    Math.max(2, Math.round(fondo * densidad)),
  );
  const semilla = siguienteSemilla();
  erosionar(geo, fuerza, semilla);
  uvPlanar(geo, semilla * 0.173);
  return new THREE.Mesh(geo, material);
}

// --- Columna -------------------------------------------------------------

// Radio del fuste a una altura relativa t (0 = base, 1 = cima), con éntasis.
function radioFuste(t: number) {
  const { radioBase, radioCima } = MEDIDAS;
  return radioBase - (radioBase - radioCima) * t + 0.018 * Math.sin(Math.PI * t);
}

// Tambor acanalado con aristas vivas entre estrías, bordes desconchados y
// una pequeña irregularidad de talla. El origen queda en la base del tambor.
export function crearTambor(indice: number, estrias: number, semilla: number) {
  const segmentosPorEstria = estrias >= 20 ? 6 : 4;
  const geo = new THREE.CylinderGeometry(
    1,
    1,
    ALTURA_TAMBOR,
    estrias * segmentosPorEstria,
    22,
  );
  geo.translate(0, ALTURA_TAMBOR / 2, 0);

  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  const circunferencia = Math.PI * 2 * MEDIDAS.radioBase;
  const giro = semilla * 0.61;

  for (let k = 0; k < pos.count; k++) {
    v.fromBufferAttribute(pos, k);
    const r = Math.hypot(v.x, v.z);
    const esTapa = Math.abs(nor.getY(k)) > 0.5;

    if (esTapa) {
      uv.setXY(k, (v.x * 0.5 + giro) / TESELA, (v.z * 0.5) / TESELA);
    } else {
      uv.setXY(
        k,
        (uv.getX(k) * circunferencia + giro) / TESELA,
        (indice * ALTURA_TAMBOR + v.y) / TESELA,
      );
    }
    if (r < 1e-4) continue;

    const t = (indice * ALTURA_TAMBOR + v.y) / MEDIDAS.alturaFuste;
    const ang = Math.atan2(v.z, v.x);
    const fase = (((ang / (Math.PI * 2)) * estrias) % 1 + 1) % 1;
    let radio = radioFuste(t) * (1 - 0.075 * Math.sin(Math.PI * fase)) * r;

    const px = Math.cos(ang) * 0.5;
    const pz = Math.sin(ang) * 0.5;
    const py = indice * ALTURA_TAMBOR + v.y;
    radio *= 1 + 0.012 * (fbm(px * 2 + semilla, py * 1.5, pz * 2) - 0.5);

    const aBorde = Math.min(v.y, ALTURA_TAMBOR - v.y);
    const zonaBorde = 1 - suave(0, 0.1, aBorde);
    const n = fbm(px * 8 + semilla, py * 8, pz * 8);
    radio -= zonaBorde * Math.max(0, n - 0.48) * 0.2 * r;

    const poro = Math.max(0, ruido(px * 30 + semilla, py * 30, pz * 30) - 0.8);
    radio -= poro * 0.04 * r;

    pos.setXYZ(k, Math.cos(ang) * radio, v.y, Math.sin(ang) * radio);
  }
  geo.computeVertexNormals();
  return geo;
}

// Capitel: equino (perfil torneado) + ábaco desgastado. Origen en la base del
// equino.
export function crearCapitel(material: THREE.Material) {
  const grupo = new THREE.Group();
  const r0 = radioFuste(1);
  const perfil = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r0, 0),
    new THREE.Vector2(r0 + 0.015, 0.03),
    new THREE.Vector2(r0 - 0.005, 0.05),
    new THREE.Vector2(r0 + 0.02, 0.07),
    new THREE.Vector2(r0 + 0.1, 0.13),
    new THREE.Vector2(MEDIDAS.ladoAbaco / 2 - 0.03, 0.23),
    new THREE.Vector2(MEDIDAS.ladoAbaco / 2 - 0.03, MEDIDAS.alturaEquino),
    new THREE.Vector2(0, MEDIDAS.alturaEquino),
  ];
  const geoEquino = new THREE.LatheGeometry(perfil, 64);
  const uv = geoEquino.attributes.uv;
  for (let k = 0; k < uv.count; k++) {
    uv.setXY(k, (uv.getX(k) * Math.PI * 1.1) / TESELA, (uv.getY(k) * 0.9) / TESELA);
  }
  const equino = new THREE.Mesh(geoEquino, material);
  const abaco = bloque(
    MEDIDAS.ladoAbaco,
    MEDIDAS.alturaAbaco,
    MEDIDAS.ladoAbaco,
    material,
    0.03,
  );
  abaco.position.y = MEDIDAS.alturaEquino + MEDIDAS.alturaAbaco / 2;
  grupo.add(equino, abaco);
  return grupo;
}

// --- Basamento y entablamento --------------------------------------------

const ANCHO_TEMPLO = (MEDIDAS.columnas - 1) * MEDIDAS.separacion + 2.2;
const FONDO_TEMPLO = 2.4;
const JUNTA = 0.014;

// Fila de bloques con juntas entre `desde` y `hasta` en el eje X.
function hilada(
  grupo: THREE.Group,
  cortes: number[],
  alto: number,
  fondo: number,
  y: number,
  z: number,
  material: THREE.Material,
  fuerza: number,
) {
  for (let i = 0; i < cortes.length - 1; i++) {
    const ancho = cortes[i + 1] - cortes[i] - JUNTA;
    const b = bloque(ancho, alto, fondo, material, fuerza);
    b.position.set((cortes[i] + cortes[i + 1]) / 2, y, z);
    grupo.add(b);
  }
}

const cortesRegulares = (ancho: number, piezas: number) =>
  Array.from({ length: piezas + 1 }, (_, i) => -ancho / 2 + (ancho * i) / piezas);

// Krepis: tres escalones de sillares. Cara superior en y = COTA_ESTILOBATO.
export function crearBasamento(material: THREE.Material) {
  const grupo = new THREE.Group();
  for (let e = 0; e < MEDIDAS.escalones; e++) {
    const vuelo = (MEDIDAS.escalones - 1 - e) * 0.42;
    const ancho = ANCHO_TEMPLO + vuelo * 2;
    const fondo = FONDO_TEMPLO + vuelo * 2;
    const y = MEDIDAS.escalon * (e + 0.5);
    const piezas = Math.round(ancho / 1.45);
    const cortes = cortesRegulares(ancho, piezas).map((c, i, arr) =>
      i === 0 || i === arr.length - 1 ? c : c + (e % 2 ? 0.36 : -0.2),
    );
    const mitad = fondo / 2;
    hilada(grupo, cortes, MEDIDAS.escalon - JUNTA, mitad - JUNTA, y, mitad / 2, material, 0.06);
    hilada(
      grupo,
      cortes.map((c, i, arr) => (i === 0 || i === arr.length - 1 ? c : c + 0.5)),
      MEDIDAS.escalon - JUNTA,
      mitad - JUNTA,
      y,
      -mitad / 2,
      material,
      0.06,
    );
  }
  return grupo;
}

// Entablamento (arquitrabe + friso con triglifos + cornisa) y frontón con el
// tímpano rehundido. Origen en la base del arquitrabe.
export function crearEntablamento(
  material: THREE.Material,
  materialTimpano: THREE.Material,
) {
  const grupo = new THREE.Group();
  const ancho = ANCHO_TEMPLO - 0.9;
  const fondo = MEDIDAS.ladoAbaco + 0.1;
  let y = 0;

  // Arquitrabe: una pieza por vano, con la junta sobre el eje de cada columna.
  const cortesVanos = [
    -ancho / 2,
    ...Array.from({ length: MEDIDAS.columnas - 2 }, (_, i) => xColumna(i + 1)),
    ancho / 2,
  ];
  hilada(grupo, cortesVanos, 0.5, fondo, y + 0.25, 0, material, 0.05);
  y += 0.5;

  const tenia = bloque(ancho + 0.06, 0.06, fondo + 0.06, material, 0.02);
  tenia.position.y = y + 0.03;
  grupo.add(tenia);
  y += 0.06;

  const altoFriso = 0.5;
  hilada(grupo, cortesVanos, altoFriso, fondo - 0.08, y + altoFriso / 2, 0, material, 0.04);
  const triglifos = MEDIDAS.columnas * 2 - 1;
  for (let i = 0; i < triglifos; i++) {
    const x = xColumna(0) + (i * MEDIDAS.separacion) / 2;
    for (const z of [fondo / 2 - 0.03, -(fondo / 2 - 0.03)]) {
      const t = bloque(0.34, altoFriso, 0.07, material, 0.03);
      t.position.set(x, y + altoFriso / 2, z);
      grupo.add(t);
      for (const dx of [-0.06, 0.06]) {
        const glifo = bloque(0.035, altoFriso * 0.82, 0.02, material, 0);
        glifo.position.set(x + dx, y + altoFriso * 0.47, z + Math.sign(z) * 0.04);
        grupo.add(glifo);
      }
    }
  }
  y += altoFriso;

  const cornisa = bloque(ancho + 0.3, 0.16, fondo + 0.3, material, 0.06);
  cornisa.position.y = y + 0.08;
  grupo.add(cornisa);
  y += 0.16;

  // Frontón: prisma triangular (~13° como el Partenón) con tímpano rehundido.
  const pend = THREE.MathUtils.degToRad(13);
  const semi = (ancho + 0.3) / 2;
  const alto = semi * Math.tan(pend);
  const triangulo = (s: number, h: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-s, 0);
    shape.lineTo(s, 0);
    shape.lineTo(0, h);
    shape.closePath();
    return shape;
  };

  const geoMarco = new THREE.ExtrudeGeometry(triangulo(semi, alto), {
    depth: fondo + 0.3,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  uvPlanar(geoMarco, 3.1);
  const marco = new THREE.Mesh(geoMarco, material);
  marco.position.set(0, y, -(fondo + 0.3) / 2);
  grupo.add(marco);

  const margen = 0.14;
  const altoInt = alto - margen - margen / Math.cos(pend);
  const semiInt = altoInt / Math.tan(pend);
  // uv: grano de la piedra; uv1: máscara del rótulo, normalizada al tímpano.
  const geoTimpano = new THREE.ShapeGeometry(triangulo(semiInt, altoInt));
  const uv = geoTimpano.attributes.uv;
  const p = geoTimpano.attributes.position;
  const uv1 = new THREE.BufferAttribute(new Float32Array(uv.count * 2), 2);
  for (let k = 0; k < uv.count; k++) {
    uv.setXY(k, p.getX(k) / TESELA, p.getY(k) / TESELA);
    uv1.setXY(k, (p.getX(k) + semiInt) / (semiInt * 2), p.getY(k) / altoInt);
  }
  geoTimpano.setAttribute("uv1", uv1);
  const timpano = new THREE.Mesh(geoTimpano, materialTimpano);
  timpano.position.set(0, y + margen, (fondo + 0.3) / 2 + 0.035);
  grupo.add(timpano);

  return { grupo, alto: y + alto };
}
