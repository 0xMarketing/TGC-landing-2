// Proporciones dóricas (unidad = diámetro inferior del fuste). Sin
// dependencias de three para poder usarlas en la carga inicial de la página.
export const MEDIDAS = {
  radioBase: 0.5,
  radioCima: 0.4,
  alturaFuste: 4.9,
  tambores: 4,
  alturaEquino: 0.28,
  alturaAbaco: 0.18,
  ladoAbaco: 1.24,
  separacion: 2.3,
  columnas: 5,
  escalon: 0.26,
  escalones: 3,
} as const;

export const ALTURA_TAMBOR = MEDIDAS.alturaFuste / MEDIDAS.tambores;
export const ALTURA_COLUMNA =
  MEDIDAS.alturaFuste + MEDIDAS.alturaEquino + MEDIDAS.alturaAbaco;
export const COTA_ESTILOBATO = MEDIDAS.escalon * MEDIDAS.escalones;

export const xColumna = (i: number) =>
  (i - (MEDIDAS.columnas - 1) / 2) * MEDIDAS.separacion;
