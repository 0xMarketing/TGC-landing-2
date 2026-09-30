# THE RESET — THEGRAFTCLVB — Rediseño de Landing

## Contexto del proyecto

Estamos rediseñando desde cero la landing de **THE RESET**, un programa de 6 meses de
entrenamiento mental y físico estructurado en 5 pilares (Mental, Físico, Financiero,
Laboral, Social). La web actual vive en thegraftclvb.com (Webflow) y tiene buen
posicionamiento de marca pero ejecución floja: precios placeholder, copy genérico tipo
"Lorem ipsum", testimonios duplicados, y ninguna demostración real del método.

El objetivo de este rediseño es que sea **una de las mejores landings que se han
construido para este tipo de programa**: visualmente muy cuidada, con animaciones
intencionadas (no decorativas), y que demuestre el método en vez de solo prometerlo.

Antes de escribir cualquier código, lee siempre:
- `content.md` — todo el copy y contenido real, ya organizado en estructura AIDA
- `design-brief.md` — paleta, tipografía y principios visuales

**No inventes copy de relleno.** Todo el texto debe salir de `content.md`. Si falta
contenido para una sección concreta, dilo explícitamente en vez de rellenar con texto
genérico tipo "Lorem ipsum" o frases vacías tipo "sistema práctico y efectivo".

## Stack técnico

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS
- GSAP + `@gsap/react` (ScrollTrigger y ScrollSmoother vienen incluidos en el paquete
  estándar de GSAP, ya no son plugins de pago)

Instalación base:
```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install gsap @gsap/react
```

## Estructura de carpetas objetivo

```
/
├── CLAUDE.md
├── content.md
├── design-brief.md
├── public/assets/          ← SVGs e imágenes (placeholders al inicio si faltan)
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
└── components/
    ├── Hero.tsx
    ├── Colaboraciones.tsx
    ├── QueEsTheReset.tsx
    ├── PreguntasIntrospeccion.tsx
    ├── PilaresScroll.tsx
    ├── FasesTimeline.tsx
    ├── Testimonios.tsx
    ├── QueIncluye.tsx
    ├── FiltroParaQuien.tsx
    └── CTAFinal.tsx
```

## Orden de las secciones (estructura AIDA)

Construir en este orden, sección por sección, no todo de golpe:

**ATENCIÓN**
1. `Hero` — headline + apoyo corto + un único CTA. Sin fila de logos aquí.
2. `PreguntasIntrospeccion` — 3-4 preguntas incómodas apareciendo una a una
   (fade secuencial simple, sin scroll pineado). Contenido en `content.md` →
   sección "Preguntas de introspección".

**INTERÉS**
3. `Colaboraciones` — sección propia para las marcas/proyectos con los que han
   trabajado, con contexto por logo si hay dato disponible (no solo logos sueltos).
4. `QueEsTheReset` — reestructurado con contenido real, no frases abstractas.
5. `PilaresScroll` — la pieza más compleja. Ver sección dedicada más abajo.

**DESEO**
6. `FasesTimeline` — Fase 0 a Fase 5, timeline horizontal con scroll propio
   (distinto del scroll vertical del resto de la página).
7. `Testimonios` — miniaturas propias con overlay de marca + modal/lightbox al
   hacer clic, en vez de embeds nativos de YouTube sueltos.
8. `QueIncluye` — los 4 bloques del programa. Considerar un micro-elemento
   interactivo (checklist desplegable) en uno de ellos.

**ACCIÓN**
9. `FiltroParaQuien` — "esto no es para ti / es para ti si", justo antes del CTA,
   como pre-cualificación.
10. `CTAFinal` — con el mensaje de escasez/urgencia (pendiente de datos reales
    actualizados — marcar como placeholder claro hasta confirmar).

## PilaresScroll — comportamiento esperado

Sección pineada (`pin: true` en ScrollTrigger) que ocupa el viewport mientras el
usuario hace scroll interno por los 5 pilares. Una única figura humana base (SVG por
capas) que se va revelando/descomponiendo según el pilar activo:

- Mental → capa cerebro/cabeza
- Físico → capa torso/músculo
- Financiero → capa manos
- Laboral → capa mirada/ojos
- Social → figura completa + siluetas conectadas alrededor

Cada pilar, al activarse, muestra también una cifra o mecánica real extraída de
`content.md` (fórmula, pregunta o dato concreto de la sesión correspondiente), no
copy genérico.

Si los SVGs con capas separadas todavía no están listos, implementar primero con
placeholders simples (formas geométricas o silueta básica) para no bloquear el resto
del desarrollo, y sustituir después.

## Principios de diseño (resumen — el detalle está en design-brief.md)

- Fondo negro, acento naranja único, sin paleta pastel ni tarjetas redondeadas
  genéricas con sombra difusa.
- Motion reservado principalmente para `PilaresScroll` y `FasesTimeline`. El resto
  de secciones, quietas y con jerarquía tipográfica fuerte.
- Sin eyebrows en mayúsculas ni "→" al final de los botones ni separadores tipo
  "A · B · C" — evitar los tics visuales genéricos de landing generada por IA.
- Responsive obligatorio, especialmente cuidado con el `pin` de ScrollTrigger en
  móvil/Safari (usar `anticipatePin` si hay saltos).

## Forma de trabajar

Construir sección por sección, no todo en un único prompt. Después de cada sección,
parar para revisión visual antes de continuar con la siguiente.
