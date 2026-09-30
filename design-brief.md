# Design Brief — THE RESET

## Dirección general

Marca de exigencia y disciplina, no de wellness suave. El tono del copy actual
("esto no es para ti si buscas motivación", "no trabajamos sobre inspiración,
trabajamos sobre comportamiento") es duro y directo — el diseño tiene que sonar
igual de duro. Referencia conceptual: atletismo de alto rendimiento + disciplina
estructurada, no coaching motivacional blando.

Evitar explícitamente:
- Paletas pastel o cálidas tipo wellness
- Tarjetas redondeadas con sombra difusa genérica (kit SaaS por defecto)
- Iconografía blanda (nubes, gente sonriendo en stock)
- Eyebrows en mayúsculas tracked-out sobre cada título
- Flechas "→" al final de botones/enlaces
- Separadores tipo "A · B · C"

## Paleta

Fuente: brandbook THEGRAFTCLVB (IDENTIDAD VISUAL, pág. 7). Ya no hay nada pendiente.

- **Fondo base**: negro `#000000`
- **Acento**: naranja `#ff611a`, solo en combinación con el fondo negro
- **Texto principal**: blanco roto `#f4f5f0`
- **Texto secundario/gris**: `#8a8a8a` (no está en el brandbook; ~6:1 sobre negro, AA)
- **Azul `#184b84`**: existe en el brandbook pero es de la combinación "SS Special"
  (edición del pop-up de San Sebastián, sobre fondo `#f4f5f0`). No se usa en la landing.
- Los tokens viven en `app/globals.css` (`@theme`), con espejo en
  `tailwind.config.ts` y en `components/marca.ts` (para GSAP y SVG).
- **Un único acento de color en toda la página** — el naranja se reserva para
  CTAs, elementos activos del scroll de pilares, y momentos puntuales de énfasis.
  No usarlo como color decorativo repetido.

## Tipografía

Brandbook (pág. 12): Helvetica Neue LT Pro. H2 en 75 Bold y **siempre 100% en
mayúsculas** (regla global en `app/globals.css`); H3 en 75; párrafo en 45 Light.

Implementación actual: **TeX Gyre Heros** (clon libre de Helvetica, licencia GUST),
subconjunto latino en `app/fonts/`, cargada con `next/font/local`. Una sola familia
para display y cuerpo. No tiene Light: el texto corrido va en Regular y la jerarquía
se consigue con tamaño y color. Si se consigue licencia web de Helvetica Neue LT Pro,
basta con sustituir los archivos en `app/layout.tsx`.

Numerales romanos I a V (pilares): serif clásica (Cormorant Garamond), solo para
ese glifo. No se usa para texto de lectura.

- Escala tipográfica clara, con pesos e interlineado intencionados.
- Líneas de texto en cuerpo: menos de 80 caracteres de ancho.

## Elementos de marca (brandbook)

- **Logo**: siempre arriba a la izquierda (`Cabecera`) y completo con tagline en el
  `Pie`. El nombre se escribe THEGRAFTCLVB, en mayúsculas y sin espacios.
- **Onda de líneas finas** (`OndaLineas`): textura propia de la marca. Fondo de
  QueEsTheReset, CTAFinal y Pie. Estática.
- **Numeración de pilares con romanos I-V** (la V del logo son los 5 pilares). Las
  fases del programa van en arábigo (empiezan en 0).
- **Fotografía**: gente real, en blanco y negro o tonos oscuros. Nunca a color en
  hover. El naranja aparece solo en tipografía, nunca como luz ambiental (por eso las
  imágenes de las fases se pasan a blanco y negro por CSS).
- **Naranja para resaltar palabras clave** en titulares ("PEQUEÑO", "YOUR"), no como
  decoración repetida.
- Sin glassmorphism (`backdrop-blur`) ni halos difuminados.
- Quedan fuera a propósito: el azul SS Special, el "TRAINING CLVB" en arco (merch) y
  el script "TheGraftClvb" como fuente de lectura.

## Layout

- Alineación predominante: izquierda para bloques de texto largo; centrado solo
  en momentos puntuales (hero, CTAs de cierre).
- Sin border-radius uniforme aplicado a todo — usar esquinas rectas por defecto,
  reservar cualquier redondeo (si se usa) para elementos muy concretos con
  justificación, no como estilo base.
- Estructura de secciones en el orden AIDA definido en `CLAUDE.md`.

## Motion — dónde gastar el atrevimiento

Principio: un solo momento de mayor riesgo/impacto, el resto quieto y disciplinado.

- **Máximo atrevimiento**: `PilaresScroll` (la sección pineada con la figura que
  se descompone por pilar).
- **Atrevimiento moderado**: `FasesTimeline` (scroll horizontal propio).
- **Resto de secciones**: sin fade-in-slide-up genérico en cada bloque. Entradas
  discretas o directamente estáticas, dejando que la tipografía y el contraste
  hagan el trabajo de jerarquía visual.
- Motion como respuesta a acción del usuario (hover, click, scroll deliberado)
  siempre es bienvenido; motion automático repetido en cada sección no.

## Accesibilidad y calidad mínima

- Respetar `prefers-reduced-motion` — especialmente importante dado el peso de
  `PilaresScroll`.
- Foco de teclado visible en todos los elementos interactivos.
- Contraste de texto verificado sobre fondo negro (el gris secundario no puede
  bajar de un contraste legible en accesibilidad AA).
- Responsive completo, con atención especial al comportamiento de `pin` de
  ScrollTrigger en Safari/iOS (usar `anticipatePin: 1` si aparecen saltos).
