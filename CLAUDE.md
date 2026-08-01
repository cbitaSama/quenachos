# CLAUDE.md — Que Nachos Landing Site

> **Para Claude Code:** este archivo es la fuente única de verdad del proyecto. Léelo completo antes de empezar. Si hay ambigüedad, pregunta antes de inventar. Si una decisión no está aquí, pregúntala. No tomes shortcuts.

---

## 0. Contexto del proyecto

### Cliente
- **Marca:** Que Nachos
- **Razón social:** Nutravia SRL
- **Ubicación operativa:** Santa Cruz de la Sierra, Bolivia
- **Producto:** Nachos horneados proteicos, hechos con pechuga de pollo 100% seleccionada. 18g de proteína por bolsa. Cuatro sabores: Clásico, Limón, Picante, Limón Picante.
- **Posicionamiento:** "Antojo sin culpa" con eje fitness/proteína. Target: gente joven activa (gym, running, estudiantes universitarios, jóvenes profesionales) que quiere snackear sin sentir que rompe su régimen. Lifestyle aspiracional pero accesible.
- **Canales actuales:** Instagram `@quenachos.bo`, TikTok `@QueNachos.bo`, WhatsApp para pedidos, eventos físicos (Night Fest, Bad Sisters, Cold Coffee Club, running clubs).
- **Punto de partida web:** Linktree minimal (tiktok + wpp + puntos de venta). Lo estamos reemplazando.

### Objetivo del sitio
Una landing single-page que se vea como marca real (no como link-in-bio improvisado), con prioridad mobile (>90% del tráfico viene de IG link in bio), enfocada en una sola conversión: **clicks a WhatsApp para pedido**, con recojo en Santa Cruz como secundario.

### Qué NO es este sitio en el MVP
- No es e-commerce (sin carrito, sin checkout, sin pagos).
- No es un CMS (sin panel admin para el cliente). Eso es Fase 2.
- No tiene login ni cuentas.
- No tiene blog.
- No tiene catálogo paginado.
- No tiene buscador interno.

---

## 1. Stack técnico

### Framework y librerías

```
Next.js 15+ (App Router)
React 19+
TypeScript (strict mode)
Tailwind CSS v4
shadcn/ui (solo componentes que necesitemos: Button, Card, Sheet para mobile menu si aplica)
Framer Motion (animaciones React-friendly, scroll triggers básicos)
GSAP + ScrollTrigger (animaciones complejas en scroll: pinning, morphing, parallax)
lucide-react (iconos)
qrcode.react (QR client-side apuntando a window.location.origin)
clsx + tailwind-merge (utilidades de className)
```

### Package manager
**pnpm SIEMPRE.** Nunca npm ni yarn. Si encuentras `package-lock.json` o `yarn.lock`, bórralos.

### Versiones Node
Node 20 LTS mínimo. Confirma con `node -v` antes de iniciar.

### Deploy
- **Vercel.** Proyecto conectado a GitHub, deploys automáticos en push a `main`.
- **Dominio temporal:** `quenachos.vercel.app` (o el subdominio que asigne Vercel automáticamente).
- **Dominio final:** `quenachos.bo` (Fase 2, cuando el cliente compre. Cuesta ~50–80 USD/año vía registrar boliviano).

### Repo
- **GitHub.** Privado al inicio. Nombre sugerido: `quenachos-web`.
- **Owner del repo:** cbitaSama (Sebas).

### Variables de entorno
Archivo `.env.local` (nunca commitear). Plantilla en `.env.example`:

```bash
# Cliente — público (NEXT_PUBLIC_)
NEXT_PUBLIC_WHATSAPP_NUMBER=591XXXXXXXX        # Número con código país, sin "+", sin espacios
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/quenachos.bo
NEXT_PUBLIC_TIKTOK_URL=https://www.tiktok.com/@quenachos.bo
NEXT_PUBLIC_SITE_URL=https://quenachos.vercel.app   # Se reemplaza por dominio final en Fase 2

# Maps embed — público (no requiere API key para iframe simple)
NEXT_PUBLIC_PICKUP_LAT=-17.741248
NEXT_PUBLIC_PICKUP_LNG=-63.178774

# Fase 2 — Supabase (vacíos en MVP)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

> **TODO antes de deploy:** El número exacto de WhatsApp lo confirma Sebas con el cliente. De momento poner placeholder y dejar `TODO` en el código.

---

## 2. Estructura de carpetas

```
quenachos-web/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata global, Analytics
│   ├── page.tsx                # Landing (single page, importa todas las secciones)
│   ├── globals.css             # Tailwind v4 + variables CSS de marca
│   ├── privacidad/
│   │   └── page.tsx            # Placeholder legal
│   ├── terminos/
│   │   └── page.tsx            # Placeholder legal
│   └── api/
│       └── (vacío en MVP, reservado para Fase 2)
│
├── components/
│   ├── sections/
│   │   ├── Hero.tsx                    # Carrusel de sabores (TOONHUB-style)
│   │   ├── NubeDivider.tsx             # Divisor SVG orgánico entre secciones
│   │   ├── PorQue.tsx                  # 3 cards de propuesta de valor
│   │   ├── Sabores.tsx                 # Grid de 4 sabores con tilt 3D
│   │   ├── Recojo.tsx                  # Mapa + cartel NUTRAVIA SRL + horarios
│   │   ├── Eventos.tsx                 # ¿Tenés un evento? → CTA WhatsApp
│   │   ├── SobreNosotros.tsx           # Historia corta de la marca
│   │   ├── Comunidad.tsx               # Marquee de fotos lifestyle
│   │   ├── QR.tsx                      # QR client-side al URL actual
│   │   └── Footer.tsx                  # Legal + redes + links
│   ├── ui/
│   │   ├── Button.tsx                  # shadcn/ui base con variantes de marca
│   │   ├── WhatsAppFAB.tsx             # Botón flotante sticky
│   │   ├── Grain.tsx                   # Overlay de grano SVG fractalNoise
│   │   ├── GhostText.tsx               # Texto gigante de fondo
│   │   └── AnimatedNumber.tsx          # Count-up al entrar al viewport
│   └── icons/
│       └── (componentes SVG custom si hace falta)
│
├── lib/
│   ├── data/
│   │   ├── sabores.ts                  # Source of truth de los 4 sabores
│   │   ├── lifestyle.ts                # Lista de fotos de comunidad
│   │   ├── ubicacion.ts                # Datos de recojo (coords, horarios, landmark)
│   │   └── marca.ts                    # Constantes globales de marca (paleta, copy, tagline)
│   ├── types.ts                        # Types compartidos (Sabor, FotoLifestyle, etc.)
│   ├── whatsapp.ts                     # Helper para generar deeplinks a wa.me
│   ├── analytics.ts                    # trackEvent() para Vercel Analytics
│   └── utils.ts                        # cn() de shadcn + helpers misc
│
├── public/
│   ├── sabores/                        # Ver sección 9 (Assets)
│   ├── lifestyle/
│   ├── logos/
│   ├── decorativos/
│   ├── og/
│   └── favicon/
│
├── recursos/                           # Carpeta del usuario, NO se commitea. Inputs crudos del cliente.
│   ├── Bolsa_de_nachos.png             # Foto producto original
│   ├── LOGO.webp                       # Logo original (a vectorizar)
│   ├── chili_Background_Removed.png    # ⚠️ Tiene watermark, NO usar
│   ├── limon_png.png
│   ├── queso.png
│   ├── linktree.pdf                    # Referencia: estado actual
│   └── Instagram.pdf                   # Referencia: feed actual
│
├── .env.local                          # Nunca commitear
├── .env.example                        # Commitear, con placeholders
├── .gitignore                          # Ya incluye .env.local, node_modules, .next, etc.
├── next.config.ts
├── tailwind.config.ts                  # Vacío en Tailwind v4, todo en globals.css
├── tsconfig.json                       # strict: true
├── package.json
├── pnpm-lock.yaml
└── CLAUDE.md                           # Este archivo
```

> **Nota carpeta `recursos/`:** agregar a `.gitignore`. Es solo input para el dev; los assets procesados van a `public/`.

---

## 3. Data layer — preparado para Fase 2 (CMS)

El MVP es hardcoded, pero **la arquitectura debe estar lista para Supabase**. Esto significa:

1. **Types primero.** Todo lo que el cliente eventualmente edite vive en `lib/types.ts` con shapes que ya simulan filas de tabla.
2. **Adaptadores de data.** Los componentes nunca importan directamente de los `.ts` con data. Importan de funciones tipo `getSabores()`, `getLifestyle()`, que en MVP devuelven el array hardcoded, y en Fase 2 hacen `fetch` a Supabase. Cero cambios en los componentes cuando migremos.

### `lib/types.ts`

```ts
export type Sabor = {
  id: 'clasico' | 'limon' | 'picante' | 'limon-picante';
  nombre: string;                    // "Clásico"
  subtitulo: string;                 // "el confiable"
  emoji: string;                     // "🧀"
  descripcionCorta: string;          // Para card y mensaje wpp
  precio?: number;                   // En BOB. Opcional por si quieren ocultar precio.
  proteinaG: number;                 // 18
  colorTexto: string;                // hex, ej #FAF7F2
  colorFondo: string;                // hex, ej #D9282F
  imagenBolsa: string;               // path desde /public, ej /sabores/bolsa-clasico.png
  decorativo: string;                // path al PNG decorativo flotante
  orden: number;                     // 1-4 para el carrusel
  activo: boolean;                   // Para futuro: ocultar sabores temporalmente
};

export type FotoLifestyle = {
  id: string;
  src: string;                       // path desde /public
  alt: string;                       // descriptivo para a11y
  categoria: 'running' | 'gym' | 'evento' | 'casual' | 'grupo';
  orientacion: 'vertical' | 'horizontal';
  prioridad?: boolean;               // true = carga eager, para LCP
};

export type Ubicacion = {
  nombre: string;                    // "Punto de recojo"
  landmark: string;                  // "Buscá el cartel de NUTRAVIA SRL"
  ciudad: string;                    // "Santa Cruz de la Sierra"
  coordenadas: { lat: number; lng: number };
  horarios: HorarioDia[];
  googleMapsUrl: string;             // Para botón "Cómo llegar"
};

export type HorarioDia = {
  dias: string;                      // "Lunes a Viernes"
  apertura: string;                  // "07:00"
  cierre: string;                    // "19:00"
};
```

### `lib/data/sabores.ts`

```ts
import type { Sabor } from '@/lib/types';

export const SABORES: Sabor[] = [
  {
    id: 'clasico',
    nombre: 'Clásico',
    subtitulo: 'el confiable',
    emoji: '🧀',
    descripcionCorta: 'El que nunca falla. Crocante, sabroso, perfecto.',
    proteinaG: 18,
    colorTexto: '#FAF7F2',
    colorFondo: '#D9282F',
    imagenBolsa: '/sabores/bolsa-clasico.png',
    decorativo: '/sabores/flotante-queso.png',
    orden: 1,
    activo: true,
  },
  {
    id: 'limon',
    nombre: 'Limón',
    subtitulo: 'el coquetito',
    emoji: '🍋',
    descripcionCorta: 'Fresco, cítrico, con esa chispa que te despierta.',
    proteinaG: 18,
    colorTexto: '#A3E635',
    colorFondo: '#0A0A0A',
    imagenBolsa: '/sabores/bolsa-limon.png',
    decorativo: '/sabores/flotante-limon.png',
    orden: 2,
    activo: true,
  },
  {
    id: 'picante',
    nombre: 'Picante',
    subtitulo: 'el que se pasa 😏',
    emoji: '🌶️',
    descripcionCorta: 'Para los que les gusta el calorcito. Sin miedo.',
    proteinaG: 18,
    colorTexto: '#FF1F1F',
    colorFondo: '#0A0A0A',
    imagenBolsa: '/sabores/bolsa-picante.png',
    decorativo: '/sabores/flotante-chili.png',
    orden: 3,
    activo: true,
  },
  {
    id: 'limon-picante',
    nombre: 'Limón Picante',
    subtitulo: 'el que no se decide',
    emoji: '🌶️🍋',
    descripcionCorta: 'Lo mejor de los dos mundos. Cítrico y con fuego.',
    proteinaG: 18,
    colorTexto: '#A3E635',       // Verde para "LIMÓN"
    colorFondo: '#0A0A0A',
    imagenBolsa: '/sabores/bolsa-limon-picante.png',
    decorativo: '/sabores/flotante-chili-limon.png',
    orden: 4,
    activo: true,
  },
];
```

> **Importante:** en `Hero.tsx`, el sabor "Limón Picante" renderiza su nombre con dos colores: "LIMÓN" en verde lima (`#A3E635`) + "PICANTE" en rojo neón (`#FF1F1F`). Implementar como dos `<span>` separados.

### `lib/data/ubicacion.ts`

```ts
import type { Ubicacion } from '@/lib/types';

export const UBICACION: Ubicacion = {
  nombre: 'Punto de recojo',
  landmark: 'Buscá el cartel que dice NUTRAVIA SRL',
  ciudad: 'Santa Cruz de la Sierra, Bolivia',
  coordenadas: { lat: -17.741248, lng: -63.178774 },
  horarios: [
    { dias: 'Lunes a Viernes', apertura: '07:00', cierre: '19:00' },
  ],
  googleMapsUrl: 'https://maps.app.goo.gl/bQcdx3VfiyhULKmB7',
};
```

### `lib/data/marca.ts`

```ts
export const MARCA = {
  nombre: 'Que Nachos',
  razonSocial: 'Nutravia SRL',
  tagline: 'Disfruta tus nachos sin culpa',
  taglineSecundario: '18g de proteína · 4 sabores · 0 culpa',
  descripcionMeta: 'Nachos horneados proteicos con 18g de proteína. Hechos en Bolivia, sin culpa. Pedí por WhatsApp.',
  ciudad: 'Santa Cruz de la Sierra',
  pais: 'Bolivia',
  emailContacto: null,                 // Sin email público. Todo va a WhatsApp.
  whatsappHorarios: 'Lun–Vie 7:00–19:00',
};
```

### Helpers de data

```ts
// lib/data/sabores.ts
export async function getSabores(): Promise<Sabor[]> {
  // MVP: devuelve hardcoded.
  // Fase 2: reemplazar por fetch a Supabase.
  return SABORES.filter(s => s.activo).sort((a, b) => a.orden - b.orden);
}
```

Las páginas consumen así:

```tsx
// app/page.tsx
import { getSabores } from '@/lib/data/sabores';
const sabores = await getSabores();
<Hero sabores={sabores} />
```

> **Regla:** ningún componente importa directamente `SABORES`. Siempre vía `getSabores()`.

---

## 4. WhatsApp deeplinks

### `lib/whatsapp.ts`

```ts
const WPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '591XXXXXXXX';

export function whatsappLink(mensaje?: string): string {
  const base = `https://wa.me/${WPP}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}

export const MENSAJES = {
  general: 'Hola, quiero pedir Que Nachos 🌶️',
  porSabor: (sabor: string) => `Hola, quiero el sabor ${sabor} 🌶️`,
  evento: '¡Hola! Quiero Que Nachos para un evento. ¿Me cuentan opciones?',
  recojo: 'Hola, quiero coordinar un recojo en el punto de Santa Cruz.',
};
```

Todos los CTAs a WhatsApp del sitio importan de aquí. Una sola fuente de verdad.

---

## 5. Sistema de diseño

### Paleta

```css
/* En globals.css con Tailwind v4 syntax */
@theme {
  /* Marca */
  --color-rojo: #D9282F;
  --color-rojo-oscuro: #A01D22;       /* Hovers, énfasis */
  --color-rojo-neon: #FF1F1F;         /* Texto sabor Picante */
  --color-negro: #0A0A0A;
  --color-crema: #FAF7F2;             /* Blanco de marca, del logo */
  --color-verde-lima: #A3E635;        /* Texto sabor Limón */

  /* Neutros */
  --color-gris-100: #F5F5F4;
  --color-gris-500: #78716C;
  --color-gris-900: #1C1917;

  /* Por sabor — usar tokens semánticos */
  --color-clasico-fondo: var(--color-rojo);
  --color-clasico-texto: var(--color-crema);
  --color-limon-fondo: var(--color-negro);
  --color-limon-texto: var(--color-verde-lima);
  --color-picante-fondo: var(--color-negro);
  --color-picante-texto: var(--color-rojo-neon);
  --color-limon-picante-fondo: var(--color-negro);

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.15);
  --shadow-rojo-glow: 0 0 40px rgba(217, 40, 47, 0.35);
}
```

### Tipografía

Cargar en `app/layout.tsx` vía `next/font`:

```ts
import { Anton, Inter } from 'next/font/google';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
```

- **Display (`--font-display`, Anton):** ghost text gigante del hero, headlines de sección, nombre de sabor.
- **Body (`--font-body`, Inter):** todo el resto. Pesos 400/500/600/700/800.

> **Alternativa display:** si Sebas quiere algo más "blob/orgánico" matching con el logo (que es muy curvo), considerar **Boogaloo** o **Bagel Fat One** de Google Fonts. Anton es la default por neutralidad y peso visual; consulta antes de cambiar.

### Tipografía display custom — logo
El logo "Que Nachos" usa una display custom con forma de blob. **No intentar recrearla con web fonts.** Usar la imagen SVG del logo siempre que aparezca el wordmark.

### Tamaños tipográficos (mobile-first, escalan)

```css
/* Aplicar como clases utility con clamp() */
.text-display-xl  { font-size: clamp(80px, 25vw, 380px); line-height: 0.9; }
.text-display-lg  { font-size: clamp(48px, 12vw, 120px); line-height: 1.0; }
.text-display-md  { font-size: clamp(32px, 6vw, 72px);   line-height: 1.1; }
.text-body-xl     { font-size: clamp(18px, 2.5vw, 22px); line-height: 1.4; }
.text-body-lg     { font-size: clamp(16px, 2vw, 18px);   line-height: 1.6; }
.text-body-md     { font-size: 16px; line-height: 1.6; }
.text-body-sm     { font-size: 14px; line-height: 1.5; }
.text-caption     { font-size: 12px; line-height: 1.4; letter-spacing: 0.08em; text-transform: uppercase; }
```

### Espaciado y layout

- **Container:** max-width 1280px (`max-w-screen-xl`), padding lateral `px-4 sm:px-6 lg:px-12`.
- **Secciones:** padding vertical `py-20 sm:py-28 lg:py-32`. Excepción: Hero ocupa `100dvh`.
- **Radios:** `rounded-2xl` default para cards. `rounded-full` para botones y badges. `rounded-3xl` para hero callouts.

### Botones — variantes

```tsx
// components/ui/Button.tsx — variantes
'primary'   → bg-rojo text-crema, hover: bg-rojo-oscuro + scale(1.02)
'secondary' → bg-negro text-crema, hover: glow rojo
'ghost'     → bg-transparent border-2 border-crema text-crema, hover: bg-crema/10
'whatsapp'  → bg-[#25D366] text-white, con ícono WhatsApp
```

Todos los botones de CTA importantes incluyen ícono lucide `ArrowRight` que se traslada `translateX(2px)` en hover.

---

## 6. Spec sección por sección

### 6.1 Hero — Carrusel de sabores (TOONHUB-style)

**Componente:** `components/sections/Hero.tsx` — **client component** (`'use client'`).

**Estructura visual (mobile-first):**

```
┌─────────────────────────────────────────┐
│ [LOGO]                          [IG TT] │  ← Topbar
│                                         │
│       CLÁSICO          ← ghost text gigante (font Anton)
│       el confiable     ← subtítulo chico
│                                         │
│        [BOLSA]         ← centro
│      [chips deco]      ← decorativo flotante
│                                         │
│  ← [arrow]  [arrow] →                  │
│                                         │
│  Disfruta sin culpa · 18g proteína     │  ← microcopy
│                                         │
│           [PEDÍ AHORA →]                │  ← CTA grande
└─────────────────────────────────────────┘
   ↓ scroll: NubeDivider
```

**Comportamiento:**

- 4 sabores en rotación.
- **Auto-avance cada 4.5s**, pausa en hover (desktop) o touch (mobile, primer tap = pausa, segundo tap = navega).
- Flechas `ArrowLeft` / `ArrowRight` (lucide-react, size 26, strokeWidth 2.25) en esquinas inferiores. Solo desktop; en mobile, swipe horizontal.
- Barra de progreso sutil en el borde superior del hero (4 segmentos, uno por sabor; el activo se llena en 4.5s).

**Animación de transición entre sabores (650ms cubic-bezier(0.4,0,0.2,1)):**

1. **Background** del hero crossfade entre `colorFondo` del sabor saliente y entrante. Animar con Framer Motion en el div contenedor.
2. **Ghost text** del nombre: sale hacia arriba con `y: -40px, opacity: 0`, entra desde abajo con `y: +40px → 0, opacity: 0 → 1`. Stagger 50ms entre letras si vamos por refinamiento avanzado.
3. **Bolsa central**: el TOONHUB original tiene rotación de roles (left/center/right/back). Adaptación nuestra:
   - **Bolsa única**: misma imagen para los 4 sabores en MVP. Para que la transición no se sienta vacía, hacemos un breve `scale(0.95) → scale(1)` + ligero blur intermedio en el cambio (efecto "morphing").
   - **Cuando Sebas suba bolsas individuales (post-MVP)**: aplicamos el sistema TOONHUB completo de carrusel 3D (4 posiciones: center, left blur, right blur, back blur).
4. **Decorativo flotante** (chili, limón, queso): entra desde fuera de pantalla con `x: 100px → 0` + rotación leve `rotate: -10deg → 0`. Salida espejo.
5. **Subtítulo "el confiable" / "el coquetito"** etc.: fade + slide up sutil.

**Layers (z-index, de atrás hacia adelante):**

```
0  — Background sólido (color del sabor activo)
1  — Grain overlay SVG (componente <Grain />, opacity 0.08, blend mode overlay)
2  — Ghost text gigante (font Anton, clamp 80-380px)
3  — Bolsa central + decorativos flotantes
4  — Logo topbar, iconos redes, flechas nav, microcopy, CTA
```

**Mobile-specific:**

- Hero ocupa `100dvh` (NO `100vh`; en mobile `dvh` respeta la barra de navegador).
- Bolsa más chica (scale 0.85 respecto desktop) para que ghost text sea legible.
- Flechas ocultas, swipe gestures activos vía `framer-motion` `useDragControls`.
- CTA "PEDÍ AHORA" full-width, sticky pegado abajo con `padding-bottom: env(safe-area-inset-bottom)` para iPhones con notch.

**Texto bicolor "LIMÓN PICANTE":**

```tsx
<h2 className="text-display-xl font-[Anton]">
  <span style={{ color: '#A3E635' }}>LIMÓN</span>{' '}
  <span style={{ color: '#FF1F1F' }}>PICANTE</span>
</h2>
```

**CTA principal del Hero:**

```tsx
<a
  href={whatsappLink(MENSAJES.porSabor(saborActivo.nombre))}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => trackEvent('whatsapp_click', { source: 'hero', sabor: saborActivo.id })}
>
  PEDÍ AHORA →
</a>
```

Cada cambio de sabor actualiza el `href` con el mensaje pre-llenado correspondiente.

**Microcopy debajo de la bolsa (en el sabor activo):**
- "18g proteína · sin culpa · horneados"

---

### 6.2 NubeDivider — Divisor orgánico

**Componente:** `components/sections/NubeDivider.tsx` — **client component**.

**Función:** divide el hero (oscuro/colorido) de las secciones subsiguientes (crema #FAF7F2). Estética líquida, premium. NO clouds cartoon infantiles.

**Implementación:**

- SVG con un `<path>` Bézier que define una curva orgánica horizontal (tipo "ola suave" o "nube larga y plana").
- Color del fill: `#FAF7F2` (crema marca).
- Posición: pegado al final del Hero, emerge hacia arriba comiéndose el último 8% del viewport del hero en mobile, 12% en desktop.
- Drop shadow muy sutil: `filter: drop-shadow(0 -20px 40px rgba(0,0,0,0.08))`.

**Animación (GSAP):**

- Tres variantes del path, definidas como strings `d`. Cada 6s, hace morph entre variantes usando `gsap.to(path, { attr: { d: variantes[i] }, duration: 3, ease: 'sine.inOut' })`.
- Capa secundaria detrás (parallax): segunda nube SVG con `opacity: 0.3`, `transform: translateY(scrollY * 0.1)` (parallax muy leve).

**Spec del path (variante base, ajustable):**

```
M0,80 C200,20 400,140 600,60 C800,0 1000,100 1200,40 L1200,200 L0,200 Z
```

Variantes 2 y 3: misma topología pero con puntos de control desplazados ±30px. Esto da el morphing sin que parezca un glitch.

**Accesibilidad:** marcar el SVG como `aria-hidden="true"` y `role="presentation"`. Es decorativo.

---

### 6.3 PorQué — Tres cards de propuesta de valor

**Componente:** `components/sections/PorQue.tsx` — **server component** con cards animadas como client subcomponents.

**Layout:** 3 cards horizontales en desktop, stack vertical en mobile.

**Contenido:**

```
Card 1: 🍗 18g de proteína
  Sub: "Pechuga 100% seleccionada"
  Body: "Cada bolsa equivale a una porción de proteína de calidad. Snackeás y construís masa al mismo tiempo."

Card 2: ⚡ Sin culpa
  Sub: "Horneados, no fritos"
  Body: "Sin aceites raros, sin químicos extraños. Solo ingredientes que reconocés."

Card 3: 🔥 Sabor real
  Sub: "Crocantes hasta el último"
  Body: "No son los nachos 'fit' que saben a cartón. Son nachos de verdad, que comerías aunque no fueras al gym."
```

**Animación:**

- Stagger fade-in al entrar al viewport (Framer Motion `whileInView`), 100ms entre cards.
- Número "18" en Card 1: AnimatedNumber count-up de 0 → 18 al ser visible por primera vez (Framer Motion `useInView` + `useMotionValue`). 1.2s duración, easeOut.
- Hover en card: `translateY(-4px)` + sombra crece + brillo rojo sutil (`box-shadow: 0 0 40px rgba(217, 40, 47, 0.25)`).

**Estilo card:**

- Background: `bg-crema` (con leve gradient diagonal hacia `gris-100` para profundidad).
- Border: `border border-negro/5`.
- Radius: `rounded-3xl`.
- Padding: `p-8 sm:p-10`.
- Texto: emoji grande arriba, headline en Anton tamaño display-md, subtítulo en Inter 600 16px, body en Inter 400 16px gris-500.

---

### 6.4 Sabores — Grid de 4 con tilt 3D

**Componente:** `components/sections/Sabores.tsx` — **client component** (por el tilt 3D).

**Función:** complementa el hero. Quien quiere ver los 4 sabores de un vistazo sin esperar el carrusel, los encuentra acá.

**Layout:** grid 2×2 en mobile, 4×1 en desktop.

**Card por sabor:**

- Foto de bolsa (misma para los 4 en MVP) con su color de fondo del sabor.
- Nombre grande (Anton, color según sabor).
- Subtítulo coqueto ("el confiable" etc.).
- Descripción corta (1 línea).
- Badge "18g proteína".
- Botón "Pedir este sabor →" que deeplink a WhatsApp con mensaje pre-llenado.

**Animación tilt 3D:**

- Al hover, la card se inclina siguiendo el cursor. Implementación con Framer Motion:

```tsx
const x = useMotionValue(0);
const y = useMotionValue(0);
const rotateX = useTransform(y, [-100, 100], [10, -10]);
const rotateY = useTransform(x, [-100, 100], [-10, 10]);

<motion.div
  style={{ rotateX, rotateY, transformPerspective: 1000 }}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }}
  onMouseLeave={() => { x.set(0); y.set(0); }}
>
```

- En mobile, **desactivar el tilt** (el `onMouseMove` no aplica; ningún listener touch). Las cards son estáticas con hover-equivalent en `:active` (escala leve).

**Stagger reveal:**
- Al hacer scroll a la sección, las 4 cards aparecen con stagger 80ms.

---

### 6.5 Recojo — Mapa + cartel NUTRAVIA SRL

**Componente:** `components/sections/Recojo.tsx` — **server component** (iframe del mapa no requiere JS).

**Layout:** dos columnas en desktop (texto izquierda, mapa derecha), stack en mobile.

**Contenido columna texto:**

```
H2: Recogé tu pedido
Body:
  Hacés el pedido por WhatsApp y lo retirás en nuestro punto en Santa Cruz.
  Buscá el cartel que dice **NUTRAVIA SRL**, ahí estamos.

Horarios:
  Lunes a Viernes
  07:00 — 19:00

[Botón primary: PEDÍ POR WHATSAPP →]
[Botón ghost:    CÓMO LLEGAR →]
```

**Mapa:**

```tsx
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!..."   // URL de embed sin API key
  width="100%"
  height="450"
  style={{ border: 0, borderRadius: '24px' }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Ubicación de Que Nachos en Santa Cruz"
/>
```

> **TODO Claude Code:** generar la URL de embed exacta a partir de las coordenadas. Para esto, usar el flujo: abrir Google Maps en `https://www.google.com/maps?q=-17.741248,-63.178774`, click en "Compartir" → "Incrustar un mapa" → copiar el `src` del iframe. Si no se puede automatizar, hacer fallback con la URL del shortcut que mandó el cliente: `https://maps.app.goo.gl/bQcdx3VfiyhULKmB7` y dejar TODO comentado para Sebas.

**Botón "Cómo llegar":**

```tsx
<a
  href={`https://www.google.com/maps/dir/?api=1&destination=${UBICACION.coordenadas.lat},${UBICACION.coordenadas.lng}`}
  target="_blank"
  rel="noopener noreferrer"
>
  Cómo llegar →
</a>
```

En mobile abre directo la app de Google Maps si está instalada.

**Animación:** simple fade-in en scroll. No exagerar acá.

---

### 6.6 Eventos — ¿Tenés un evento?

**Componente:** `components/sections/Eventos.tsx` — **server component**.

**Estética:** sección visualmente fuerte. Background con foto lifestyle de evento (Night Fest, running club) en oscuro al 70%, texto en blanco encima.

**Contenido:**

```
H2:    ¿Tenés un evento?
Sub:   Activaciones, eventos deportivos, cumples, fiestas. Llevamos Que Nachos donde lo necesites.
CTA:   ESCRIBINOS POR WHATSAPP →
```

CTA deeplink a `MENSAJES.evento`.

**Animación:** parallax sutil de la foto de fondo al scroll (CSS `background-attachment: fixed` solo desktop, NO mobile — causa lag).

---

### 6.7 SobreNosotros — Historia corta

**Componente:** `components/sections/SobreNosotros.tsx` — **server component**.

**Tono:** un grado más sobrio que el resto, pero todavía cálido. No corporativo.

**Contenido:**

```
H2:  De dónde salimos
Body:
  Que Nachos nació de una idea simple: ¿por qué tenemos que elegir entre comer rico y comer bien?

  Probamos, horneamos, ajustamos hasta que dio. Nachos crocantes, llenos de sabor, con la proteína que tu cuerpo necesita y sin las cosas que no.

  No somos una marca de comida fit que sabe a cartón. Somos nachos de verdad. Que se nos antoja a nosotros mismos.
```

**Visual:** foto lifestyle al lado (de las del IG, probablemente la del running club o la del cocinero/founder si la tienen).

---

### 6.8 Comunidad — Marquee de fotos lifestyle

**Componente:** `components/sections/Comunidad.tsx` — **client component**.

**Función:** social proof. Mostrar que la gente real consume Que Nachos.

**Layout:** marquee horizontal infinito de fotos verticales (4:5).

**Implementación:**

- Dos rows de marquee con direcciones opuestas (uno hacia la izquierda, otro hacia la derecha) para efecto dinámico.
- Velocidad lenta: ~40 segundos para recorrer una pantalla completa.
- Pausa en hover.
- Cada foto es clickeable y abre el post original de IG en pestaña nueva (si Sebas tiene los links).

**Implementación con Framer Motion:**

```tsx
<motion.div
  animate={{ x: ['0%', '-50%'] }}
  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
  className="flex gap-4"
>
  {[...lifestyleFotos, ...lifestyleFotos].map((foto, i) => (
    <Image key={i} src={foto.src} alt={foto.alt} width={300} height={375} />
  ))}
</motion.div>
```

(El truco del marquee infinito es duplicar el array y animar al -50%.)

**Encima del marquee:**

```
H2: Quienes ya son del team
Sub: Atletas, gym rats, oficinistas con hambre, parejas con película. Sumate.
```

---

### 6.9 QR — Compartí la página

**Componente:** `components/sections/QR.tsx` — **client component**.

**Función:** generar QR del URL actual para que el cliente pueda compartir en flyers, eventos, etc.

**Implementación:**

```tsx
'use client';
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

export function QR() {
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.origin), []);
  if (!url) return null;
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode value={url} size={200} bgColor="#FAF7F2" fgColor="#0A0A0A" level="H" />
      <p>Escaneá y compartí</p>
    </div>
  );
}
```

> **Por qué client-side:** al usar `window.location.origin`, el QR siempre apunta al dominio actual. Si migran de `quenachos.vercel.app` a `quenachos.bo`, el QR se actualiza automático sin redeploy.

**Estética:** QR centrado, con la silueta del logo en el centro (parámetro `imageSettings` de qrcode.react, usar el isotipo en `/logos/isotipo.svg`).

---

### 6.10 Footer

**Componente:** `components/sections/Footer.tsx` — **server component**.

**Contenido:**

```
[Logo Que Nachos]

Disfruta tus nachos sin culpa.

[IG] [TikTok] [WhatsApp]

────────────────────────────

© 2026 Nutravia SRL · Hecho con cariño en Santa Cruz, Bolivia
[Privacidad] · [Términos]
```

Background: negro `#0A0A0A`. Texto crema.

---

### 6.11 WhatsAppFAB — Botón flotante

**Componente:** `components/ui/WhatsAppFAB.tsx` — **client component**.

- Position fixed bottom-right, `bottom-6 right-6` mobile, `bottom-8 right-8` desktop.
- z-index 50.
- Aparece después de 200px de scroll (Framer Motion + `useScroll`).
- Color verde WhatsApp `#25D366`, ícono lucide `MessageCircle` (o SVG custom de WhatsApp).
- Tamaño 56px en mobile, 64px desktop.
- Pulsa sutilmente cada 6 segundos (`scale: [1, 1.05, 1]` en 0.6s, repeat con delay 6s).
- En hover desktop: `scale(1.08)` + sombra crece.
- `aria-label="Pedir por WhatsApp"`.

---

## 7. Sistema de animaciones — reglas globales

### Librerías por uso

- **Framer Motion:** todo lo basado en React state, viewport triggers (`whileInView`), drag, hover, layout animations, marquee. Default.
- **GSAP + ScrollTrigger:** solo donde Framer no llega bien — morphing de SVG (NubeDivider), animaciones complejas atadas a scroll position exacto (parallax, pinning). Importar GSAP dinámicamente con `next/dynamic` para no inflar el bundle del primer load.

### Respetar `prefers-reduced-motion`

**No-negociable.** Implementación global:

```tsx
// hook compartido
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();
// si true → omitir animaciones complejas, solo fades cortos
```

Aplicar en:
- Hero: sin auto-avance, sin morphing, transiciones de 200ms en lugar de 650ms.
- NubeDivider: estática, sin morphing.
- Marquee: detenido.
- Pulso del FAB: omitido.

### Performance budget de animaciones

- Nunca animar `width`, `height`, `top`, `left`, `margin`. Solo `transform` y `opacity`.
- `will-change` solo en elementos con animación constante (carrusel hero, marquee). Quitar después de animar.
- 60fps mínimo en mid-tier Android. Si una animación cae bajo, simplificarla.

### Cursor
**Cursor del sistema, sin custom.** Definido por Sebas.

### Splash / loader
**Ninguno.** Definido por Sebas. La página carga directo al hero.

---

## 8. Performance budget

- **Lighthouse Mobile:**
  - Performance: ≥ 90
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 100
- **LCP:** < 2.5s en 4G simulada.
- **CLS:** < 0.1.
- **JS bundle inicial (page):** < 200KB gzipped.
- **Imágenes:** todas vía `next/image`, formatos `webp` y `avif` servidos automáticamente, lazy por default (excepto LCP del hero), `sizes` correcto.
- **Fonts:** `display: swap`, subset latin, solo pesos usados (no cargar Inter 100, 200, 300 si no se usan).
- **Third-party:** cero. Sin Google Analytics, sin Hotjar, sin Intercom. Solo Vercel Analytics y la métrica custom de WhatsApp clicks.

---

## 9. Assets — manifest completo

### `public/sabores/`

```
bolsa-clasico.png            ← MVP: misma imagen para los 4. Renombrar Bolsa_de_nachos.png a esto.
bolsa-limon.png              ← MVP: copia de la misma. Renombrar a 4 archivos distintos para que el código apunte correcto.
bolsa-picante.png            ←
bolsa-limon-picante.png      ←

flotante-queso.png           ← Tomar queso.png del recursos/. Listo.
flotante-limon.png           ← Tomar limon_png.png del recursos/. Listo.
flotante-chili.png           ← ⚠️ El que mandó Sebas tiene watermark. NO usar. TODO: regenerar con Nano Banana matching estilo de limón y queso (flat illustration, sin caras, paleta marca).
flotante-chili-limon.png     ← TODO: generar combo con Nano Banana.
```

> **Procesamiento de bolsa:** la imagen original `Bolsa_de_nachos.png` debe tener fondo 100% transparente. Si tiene halo o fondo residual, limpiar con `sharp` (Node) o `remove.bg` API antes de copiar a `/public/sabores/`. Resolución mínima 2000×3000.

### `public/lifestyle/`

```
lifestyle-running-01.jpg       (Night Fest II, runners)
lifestyle-running-02.jpg
lifestyle-gym-01.jpg
lifestyle-gym-02.jpg
lifestyle-evento-01.jpg        (Bad Sisters)
lifestyle-evento-02.jpg        (Cold Coffee Club)
lifestyle-pareja-01.jpg        (Hicimos Match)
lifestyle-casual-01.jpg
lifestyle-deporte-01.jpg
lifestyle-moto-01.jpg
lifestyle-grupo-01.jpg
lifestyle-grupo-02.jpg
```

> **TODO crítico:** Sebas debe pedirle al cliente los originales por Drive/WeTransfer. Las versiones de Instagram están sobre-comprimidas. Mientras tanto, descargas manuales del IG vía DevTools (Network tab → Img filter → Open in new tab).

Cada foto: JPG, 1200×1500 (vertical 4:5), calidad 80–85, max 200KB.

### `public/logos/`

```
logo-quenachos.svg          ← TODO: vectorizar desde LOGO.webp. Si Sebas consigue el .ai/.pdf original del diseñador, mejor.
logo-quenachos-crema.svg    ← Variante con texto crema sobre fondo oscuro
logo-quenachos-negro.svg    ← Variante negra sobre fondo claro
logo-quenachos.png          ← Fallback raster 1024×1024 transparente
isotipo.svg                 ← Solo el blob "Que Nachos" sin fondo, para favicon y QR
```

**Para vectorizar:** Claude Code puede usar `potrace` (CLI) o sugerir Vector Magic / Adobe Illustrator. Idealmente Sebas pide el original al diseñador.

### `public/decorativos/`

```
grain.svg              ← Generado por Claude Code: SVG con <filter id="grain"><feTurbulence baseFrequency="0.9" numOctaves="4"/></filter>
nube-divider-1.svg     ← Path orgánico variante 1
nube-divider-2.svg     ← Path orgánico variante 2
nube-divider-3.svg     ← Path orgánico variante 3
```

### `public/og/`

```
og-image.jpg           ← 1200×630. Diseñar en código con @vercel/og o como JPG estático.
                          Contenido: logo + bolsa + tagline "Disfruta tus nachos sin culpa"
                          + chip "18g proteína" + fondo rojo marca + grain overlay.
og-image-square.jpg    ← 1200×1200, similar.
```

**Sugerencia:** generar dinámicamente con `@vercel/og` en `app/og/route.tsx`. Eso permite que en Fase 2 se generen OGs personalizados por sabor.

### `public/favicon/`

```
favicon.ico            ← 32×32, generar desde isotipo.svg
icon-192.png
icon-512.png
apple-touch-icon.png   ← 180×180
manifest.json          ← Web manifest básico
```

Generar todos con `realfavicongenerator.net` a partir de `isotipo.svg`, o vía script con `sharp`.

---

## 10. Accesibilidad — checklist

- [ ] Todo texto cumple WCAG AA contrast (4.5:1 mínimo, 3:1 para texto grande). **Verificar especialmente los textos coloreados por sabor sobre fondos oscuros.**
- [ ] Todos los `<img>` tienen `alt` descriptivo (no decoraciones genéricas).
- [ ] Imágenes decorativas (grain, nubes) tienen `alt=""` o `aria-hidden="true"`.
- [ ] Navegación 100% funcional con teclado. `Tab` recorre orden lógico. `Enter`/`Space` activa botones. `Esc` cierra modales si hay.
- [ ] Focus states visibles en todos los interactivos. Outline 2px rojo o crema según fondo, offset 2px.
- [ ] Carrusel del hero: botones tienen `aria-label="Sabor anterior"` / `"Siguiente sabor"`. Cambio de sabor anuncia con `aria-live="polite"`.
- [ ] Auto-avance del carrusel: botón "Pausar" oculto visualmente pero accesible para screen readers.
- [ ] `prefers-reduced-motion` respetado en todas las animaciones.
- [ ] Semántica HTML correcta: `<header>`, `<main>`, `<section>` con `aria-labelledby`, `<footer>`.
- [ ] Headings en orden jerárquico (H1 único en hero, H2 por sección, H3 dentro).
- [ ] `lang="es-BO"` en `<html>`.

---

## 11. SEO

### Metadata global (`app/layout.tsx`)

```ts
export const metadata: Metadata = {
  title: 'Que Nachos · Nachos proteicos hechos en Bolivia',
  description: 'Nachos horneados con 18g de proteína. Cuatro sabores: Clásico, Limón, Picante, Limón Picante. Pedí por WhatsApp.',
  keywords: ['nachos proteicos', 'snack saludable Bolivia', 'Santa Cruz nachos', 'proteína snack', 'Que Nachos'],
  authors: [{ name: 'Nutravia SRL' }],
  openGraph: {
    type: 'website',
    locale: 'es_BO',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: 'Que Nachos · Disfruta sin culpa',
    description: '18g de proteína · 4 sabores · hechos en Bolivia',
    images: ['/og/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Que Nachos',
    description: 'Nachos proteicos sin culpa',
    images: ['/og/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};
```

### `app/sitemap.ts`

```ts
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/privacidad`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/terminos`, lastModified: new Date(), priority: 0.3 },
  ];
}
```

### `app/robots.ts`

```ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

### JSON-LD structured data

En `app/page.tsx`, incluir un `<script type="application/ld+json">` con datos de la organización local:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Que Nachos",
  "legalName": "Nutravia SRL",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Santa Cruz de la Sierra",
    "addressCountry": "BO"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -17.741248,
    "longitude": -63.178774
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "07:00",
    "closes": "19:00"
  }],
  "sameAs": [
    "https://www.instagram.com/quenachos.bo",
    "https://www.tiktok.com/@quenachos.bo"
  ]
}
```

---

## 12. Analytics

### Vercel Analytics

Instalar y configurar en `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

<body>
  {children}
  <Analytics />
  <SpeedInsights />
</body>
```

### Tracking custom de WhatsApp

```ts
// lib/analytics.ts
import { track } from '@vercel/analytics';

export function trackEvent(
  name: 'whatsapp_click' | 'sabor_view' | 'pickup_directions' | 'qr_scan',
  data?: Record<string, string | number>
) {
  track(name, data);
}
```

**Eventos a trackear:**
- `whatsapp_click` con `{ source: 'hero' | 'sabor_card' | 'fab' | 'eventos' | 'recojo', sabor?: string }`
- `sabor_view` cuando el carrusel del hero cambia de sabor (post-load, no inicial)
- `pickup_directions` cuando alguien clickea "Cómo llegar"

**Sin banner de cookies necesario:** Vercel Analytics es first-party y no usa cookies persistentes. Confirmar en Vercel docs antes de deploy.

---

## 13. Tailwind v4 + globals.css

Tailwind v4 cambia la API. En lugar de `tailwind.config.ts`, todo va en `globals.css` con `@theme`:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-rojo: #D9282F;
  --color-rojo-oscuro: #A01D22;
  --color-rojo-neon: #FF1F1F;
  --color-negro: #0A0A0A;
  --color-crema: #FAF7F2;
  --color-verde-lima: #A3E635;

  --font-display: 'Anton', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  --radius-card: 1.5rem;
  --radius-card-lg: 2rem;
}

/* Base */
html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background: var(--color-crema);
  color: var(--color-negro);
  overscroll-behavior: none;
}

/* Utilities custom */
.text-display { font-family: var(--font-display); letter-spacing: -0.02em; }

/* Focus visible */
*:focus-visible {
  outline: 2px solid var(--color-rojo);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Páginas legales placeholder

### `app/privacidad/page.tsx`

```tsx
export default function PrivacidadPage() {
  return (
    <main className="max-w-screen-md mx-auto px-4 py-20">
      <h1 className="text-display-lg mb-8">Política de Privacidad</h1>
      <p className="text-body-lg mb-4">
        Esta política describe cómo Nutravia SRL ("Que Nachos") trata la información de los usuarios de este sitio web.
      </p>
      <p className="text-body-md text-gris-500 italic">
        [PLACEHOLDER: Reemplazar con texto legal definitivo antes de campañas pagas o expansión. Consultar con asesor legal en Bolivia. Mientras tanto, este sitio no recolecta datos personales más allá de cookies técnicas de Vercel Analytics, que es first-party y anónimo.]
      </p>
    </main>
  );
}
```

### `app/terminos/page.tsx`

Similar estructura. Placeholder con disclaimer.

---

## 15. Deploy

### Comandos

```bash
# Setup inicial
pnpm create next-app@latest quenachos-web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd quenachos-web
pnpm add framer-motion gsap qrcode.react lucide-react clsx tailwind-merge
pnpm add @vercel/analytics @vercel/speed-insights
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button

# Dev
pnpm dev

# Build local antes de push
pnpm build && pnpm start

# Lint
pnpm lint
```

### Conexión a Vercel

1. Push inicial a GitHub (`cbitaSama/quenachos-web` privado).
2. En Vercel dashboard: New Project → Import Git Repository → seleccionar el repo.
3. Framework: Next.js (auto-detect).
4. Env vars: configurar las del `.env.example` en Vercel UI antes del primer deploy.
5. Deploy.

### Branch strategy

- `main` → producción (auto-deploy a Vercel).
- `dev` → preview (auto-deploy a preview URL en Vercel).
- Feature branches → preview deploys automáticos por PR.

### Pre-deploy checklist

- [ ] `pnpm build` corre sin errores ni warnings.
- [ ] Lighthouse local ≥ 90 / 100 / 100 / 100.
- [ ] Todos los TODOs marcados en este archivo resueltos.
- [ ] Variables de entorno configuradas en Vercel.
- [ ] OG image generada y verificada con [opengraph.xyz](https://www.opengraph.xyz/).
- [ ] Test en iPhone real (Safari) y Android mid-tier real (Chrome y Samsung Internet).
- [ ] Verificar deeplinks de WhatsApp con número real, mensaje pre-llenado correcto.
- [ ] Verificar embed de mapa en mobile.
- [ ] Verificar QR escaneando con la cámara del teléfono.

---

## 16. Fase 2 — Roadmap (post-MVP)

Cuando Sebas dé la señal, se ejecutan en este orden:

### 2.1 Migración a Supabase (CMS para el cliente)

1. Crear proyecto Supabase. Activar Auth (email + magic link).
2. Tablas:
   - `sabores` (con misma shape que `Sabor` type, +created_at, updated_at).
   - `lifestyle_fotos` (con shape `FotoLifestyle`).
   - `ubicaciones` (para escalar a múltiples puntos).
   - `marca_config` (singleton row con tagline, descripción meta, etc.).
3. RLS policies desde día 1:
   - SELECT público en todas las tablas (el sitio lee sin auth).
   - INSERT/UPDATE/DELETE solo para usuarios autenticados con role `admin`.
4. Supabase Storage para imágenes (bucket `assets`, RLS público read).
5. Reemplazar funciones `getSabores()`, `getLifestyle()`, etc. para fetch desde Supabase.
6. Cache con `next: { revalidate: 60 }` o tags + `revalidateTag()` desde el panel admin.

### 2.2 Panel admin (`/admin`)

- Ruta protegida por Supabase Auth.
- Formularios para editar cada tabla.
- Upload de imágenes a Supabase Storage con preview + crop básico.
- Validaciones (precio numérico, slugs únicos, max 4 sabores activos).
- Botón "Publicar cambios" que hace `revalidatePath('/')`.

### 2.3 Dominio propio

- Comprar `quenachos.bo` vía NIC.bo o registrar boliviano.
- Configurar DNS en Vercel.
- Actualizar `NEXT_PUBLIC_SITE_URL`.
- El QR se actualiza solo (es client-side).
- Configurar redirect 301 de `quenachos.vercel.app` → `quenachos.bo`.

### 2.4 E-commerce ligero (si crece el volumen)

- Carrito con Zustand o React Context.
- Checkout sin pagos: genera pedido estructurado y envía al WhatsApp del negocio. Cliente paga por QR/transferencia al confirmar.
- Si quieren pagos reales: integrar Stripe o (en Bolivia) Tigo Money / PayPal con MercadoPago.

### 2.5 Video loop en hero

- Subir `hero-loop.mp4` (≤2MB, 720×1280, sin audio, H.264) y `hero-loop.webm`.
- Reemplazar la imagen de bolsa centrada por `<video autoPlay loop muted playsInline>` en el sabor activo.
- Mantener fallback a imagen estática para `prefers-reduced-motion`.

### 2.6 i18n (inglés)

- `next-intl` con archivos `messages/es.json` y `messages/en.json`.
- Detect locale por header `Accept-Language` o subpath `/en/`.
- Toggle en footer.

### 2.7 Bolsas individuales por sabor

- Cuando el cliente entregue las 4 fotos, reemplazar `bolsa-clasico.png` con la real, etc.
- Activar el sistema de carrusel TOONHUB completo (4 posiciones 3D).

### 2.8 Elementos decorativos consistentes

- Regenerar chili, limón, queso, combo en mismo estilo flat illustration con Nano Banana o ilustrador humano.
- Reemplazar los actuales.

---

## 17. Pendientes del cliente (información que falta)

Marcado claramente para que cuando estén, se actualicen directamente en `lib/data/marca.ts` o `lib/data/ubicacion.ts`:

- [ ] **Número de WhatsApp exacto** del negocio (formato `591XXXXXXXX`). Configurar en `.env.local` como `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- [ ] **Fotos lifestyle originales** (no las recomprimidas de IG). Sebas pide al cliente por Drive/WeTransfer.
- [ ] **Logo en SVG / archivo vector original** del diseñador. Mientras tanto, vectorizar el .webp.
- [ ] **Eventualmente:** fotos individuales de las 4 bolsas con sus diseños diferenciados.

Ninguno de estos bloquea el desarrollo del MVP. Trabajar con placeholders y reemplazar al final.

---

## 18. Orden de ejecución — task list para Claude Code

**Ejecuta en este orden estricto. No te saltes pasos. Confirma con Sebas si algún paso no se puede completar.**

1. **Setup**
   - [ ] Crear directorio `~/Developer/QUENACHOS/`.
   - [ ] `pnpm create next-app@latest quenachos-web --typescript --tailwind --app --no-src-dir --import-alias "@/*"`.
   - [ ] `cd quenachos-web && git init`.
   - [ ] Crear `.gitignore` con `recursos/`, `.env.local`, `node_modules`, `.next`, `.DS_Store`.
   - [ ] Instalar deps: `pnpm add framer-motion gsap qrcode.react lucide-react clsx tailwind-merge @vercel/analytics @vercel/speed-insights`.
   - [ ] `pnpm dlx shadcn@latest init` (estilo: New York, color base: Neutral, CSS vars: yes).
   - [ ] `pnpm dlx shadcn@latest add button`.

2. **Configuración base**
   - [ ] Crear `.env.example` y `.env.local` con las variables de la sección 1.
   - [ ] Configurar `next.config.ts` con `images.remotePatterns` si hace falta cargar imágenes externas (no debería en MVP).
   - [ ] Configurar `tsconfig.json` con `"strict": true`.
   - [ ] Escribir `app/globals.css` con la paleta y fonts (sección 13).
   - [ ] Configurar fonts en `app/layout.tsx` con `next/font/google`.

3. **Data layer**
   - [ ] Crear `lib/types.ts` con todos los types de sección 3.
   - [ ] Crear `lib/data/sabores.ts`, `lib/data/lifestyle.ts`, `lib/data/ubicacion.ts`, `lib/data/marca.ts` con la data hardcoded.
   - [ ] Crear `lib/whatsapp.ts`, `lib/analytics.ts`, `lib/utils.ts`.

4. **Assets**
   - [ ] Crear estructura de carpetas en `public/`.
   - [ ] Copiar y renombrar assets desde `recursos/` a `public/sabores/`, `public/logos/`, etc., según manifest de sección 9.
   - [ ] Marcar TODOs explícitos en los archivos faltantes (chili sin watermark, bolsas individuales, fotos lifestyle originales, logo SVG).

5. **Componentes UI base**
   - [ ] `components/ui/Button.tsx` con variantes.
   - [ ] `components/ui/Grain.tsx` (SVG fractalNoise overlay).
   - [ ] `components/ui/WhatsAppFAB.tsx`.
   - [ ] `components/ui/AnimatedNumber.tsx`.
   - [ ] `components/ui/GhostText.tsx`.

6. **Secciones — en este orden**
   - [ ] `Hero.tsx` (el más complejo, primero para validar el sistema).
   - [ ] `NubeDivider.tsx`.
   - [ ] `PorQue.tsx`.
   - [ ] `Sabores.tsx`.
   - [ ] `Recojo.tsx`.
   - [ ] `Eventos.tsx`.
   - [ ] `SobreNosotros.tsx`.
   - [ ] `Comunidad.tsx`.
   - [ ] `QR.tsx`.
   - [ ] `Footer.tsx`.

7. **Página y layout final**
   - [ ] `app/page.tsx` compone todas las secciones en orden.
   - [ ] `app/layout.tsx` incluye fonts, Analytics, SpeedInsights, metadata global.
   - [ ] `app/privacidad/page.tsx` y `app/terminos/page.tsx` con placeholders.
   - [ ] `app/sitemap.ts` y `app/robots.ts`.

8. **OG image y favicons**
   - [ ] Crear `app/og/route.tsx` con `@vercel/og` para generar OG dinámica, o JPG estático en `public/og/`.
   - [ ] Generar favicons en `public/favicon/`.
   - [ ] Linkear en metadata.

9. **Testing pre-deploy**
   - [ ] `pnpm build` sin errores.
   - [ ] Lighthouse local en Chrome DevTools mobile mode.
   - [ ] Verificar todos los CTAs de WhatsApp con el número placeholder.
   - [ ] Verificar mapa, QR, marquee, animaciones.
   - [ ] Probar con `prefers-reduced-motion` activado en DevTools.

10. **Deploy**
    - [ ] Push a GitHub.
    - [ ] Conectar a Vercel.
    - [ ] Configurar env vars en Vercel.
    - [ ] Primer deploy.
    - [ ] Verificar deploy en mobile real.

---

## 19. Reglas de código

- **Server components por default.** Solo marcar `'use client'` los componentes que necesitan estado, listeners, o hooks de cliente.
- **TypeScript strict.** Cero `any` salvo justificado en comentario.
- **Imports absolutos** con alias `@/`. Nunca `../../../`.
- **Comentarios en código:** en inglés (estándar de la industria). Documentación del proyecto (este archivo, README) en español.
- **No console.log** en código commiteado. Usar console solo en desarrollo local.
- **Errores de UX no silenciados.** Si el embed de mapa falla, mostrar fallback con dirección en texto. Si el WhatsApp link no carga, mostrar el número visible.
- **No usar `localStorage`/`sessionStorage`** en MVP. No hay necesidad y simplifica.
- **Image optimization:** SIEMPRE `next/image`. Nunca `<img>` raw salvo en SVG.
- **Naming:**
  - Componentes: PascalCase.
  - Funciones y variables: camelCase.
  - Constantes: SCREAMING_SNAKE_CASE.
  - Archivos componentes: PascalCase.tsx.
  - Archivos utils/data: kebab-case.ts o lowercase.ts.

---

## 20. Cuando dudes

1. **Re-leé este archivo.** Probablemente esté la respuesta.
2. **Si no está, pregunta a Sebas antes de inventar.** Especialmente en:
   - Decisiones de copy.
   - Branding o paleta.
   - Funcionalidades nuevas no listadas.
3. **Si Sebas no está, default a la opción más simple, performante y reversible.**
4. **Si una librería no tiene buena docs para Next 15 + App Router + React 19, NO la uses.** Buscá alternativa.

---

**Fin del archivo. Última actualización: 2026-05-21.**

---

## 💬 Sección Chat del panel — historial propio (2026-08-01)

**Qué hay:** `/admin/chat` muestra las conversaciones de WhatsApp del negocio,
solo para LEER. Para responder se contesta desde el celular — así el bot se
calla solo 3h en ese chat (pausa del dueño) y no le escribe encima al cliente.

**De dónde salen los mensajes — y por qué NO de WAHA.** La sesión `Nachito`
corre con motor NOWEB **sin el "store"**, así que WAHA no guarda ni devuelve
chats (`/chats` y `/chats/overview` responden 400). Es la ÚNICA sesión así: las
otras tres (`MARKART`, `VectoriaSpaceCorp`, `Vectoria-publicidad-landings`) se
crearon desde la CRM, que activa el store al crear. Por eso desde la CRM sí se
ven chats y desde este panel no se veían.
⛔ **No se puede activar el store en Nachito.** La doc oficial de WAHA es
explícita: *no se cambia después de escanear el QR* (se puede perder el
historial) y no hay endpoint para actualizarlo — habría que crear la sesión de
nuevo, o sea **QR nuevo**, sobre el bot vivo de un cliente que paga.

**La salida (y sale mejor):** guardamos nosotros cada mensaje cuando pasa.
- `quenachos.mensajes` + `qn_log_mensaje` / `qn_chats` / `qn_mensajes`
  (`supabase/qn-mensajes.sql`, 100% aditivo).
- `app/api/wh/mensajes` = oyente. **No responde ni manda nada**; ante cualquier
  error devuelve `ok` igual, para que WAHA nunca marque la sesión con
  problemas. Exige `WA_LOG_SECRET` y solo acepta la sesión de este negocio.
  Resuelve el teléfono real en chats `@lid`.
- Ventaja sobre WAHA: el historial es del cliente, permanente, buscable, y
  sobrevive a cualquier re-vinculación de WhatsApp.

**Cómo quedó conectado (2026-08-01, hecho y verificado):**
- `WA_LOG_SECRET` en Vercel (proyecto `quenachos`, producción).
- Webhook **agregado** a la sesión Nachito por `PUT /api/sessions/Nachito`
  → `https://www.quenachos.com/api/wh/mensajes?s=<secreto>` con `message` +
  `message.any`. **Se conservó el webhook del bot** (`n8n…/webhook/nachos`).
- Verificado: la sesión volvió a `WORKING` en 3s, **mismo número, sin QR**, y
  con los 2 webhooks. Probado el guardado de punta a punta con payloads
  sintéticos (sin mandar un solo WhatsApp) y limpiados después.
- Respaldo de la config previa: `Nachos/backups/waha-Nachito-config-2026-08-01.json`.

⚠️ **El historial arranca de cero el 2026-08-01.** Lo anterior no existe: nadie
lo estaba guardando. Usar `www.quenachos.com` (el apex redirige 308).

**Lección:** cambiar los *webhooks* de una sesión con `PUT /api/sessions/{name}`
es seguro y no pide QR; cambiar el **store** sí obliga a re-vincular. No son lo
mismo aunque las dos sean "config de la sesión".
