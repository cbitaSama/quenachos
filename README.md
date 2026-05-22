# Que Nachos · Landing site

Single-page site para [Que Nachos](https://instagram.com/quenachos.bo) (Nutravia SRL, Santa Cruz de la Sierra, Bolivia). Marca de nachos horneados proteicos.

> Fuente única de verdad del proyecto: [`../CLAUDE.md`](../CLAUDE.md).

---

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript strict
- Tailwind CSS v4 (`@theme` en `globals.css`)
- `motion` (Framer Motion) + GSAP (morphing del NubeDivider)
- shadcn-style `Button`, `qrcode.react`, `lucide-react`
- Vercel Analytics + Speed Insights
- Deploy en Vercel

## Cómo correrlo

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # producción
pnpm start        # servir build local
pnpm lint
```

> Requiere **pnpm**. Sharp y unrs-resolver tienen scripts aprobados en `pnpm-workspace.yaml`.

## Variables de entorno

Copiar `.env.example` a `.env.local`. En Vercel configurarlas en el dashboard.

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=59177376341
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/quenachos.bo
NEXT_PUBLIC_TIKTOK_URL=https://www.tiktok.com/@quenachos.bo
NEXT_PUBLIC_SITE_URL=https://quenachos.vercel.app
NEXT_PUBLIC_PICKUP_LAT=-17.741248
NEXT_PUBLIC_PICKUP_LNG=-63.178774
```

## Estructura

```
app/
  layout.tsx       # fonts (Anton + Inter + Bagel Fat One), metadata, Analytics, FAB
  page.tsx         # compone las 10 secciones del landing + JSON-LD
  og/route.tsx     # OG image dinámica (1200×630)
  privacidad/      # placeholder legal
  terminos/        # placeholder legal
  sitemap.ts
  robots.ts

components/
  sections/        # Hero, NubeDivider, PorQue, Sabores, Recojo, Eventos,
                   # SobreNosotros, Comunidad, QR, Footer
  ui/              # Button, Logo, Grain, GhostText, WhatsAppFAB,
                   # AnimatedNumber, SocialIcons

lib/
  data/            # sabores.ts · lifestyle.ts · ubicacion.ts · marca.ts
  types.ts         # Sabor, FotoLifestyle, Ubicacion, Marca
  whatsapp.ts      # deeplinks y mensajes pre-llenados
  analytics.ts     # trackEvent() para Vercel Analytics
  utils.ts         # cn() (clsx + tailwind-merge)

public/
  sabores/         # bolsa-*.png · flotante-*.{png,svg}
  lifestyle/       # fotos reales + SVG placeholders branded
  logos/           # logo-quenachos.svg + variantes + isotipo
  decorativos/     # grain.svg
  favicon/         # generados desde isotipo.svg con sharp
```

## Data layer (Fase 2-ready)

Los componentes NUNCA importan directamente los arrays. Usan `getSabores()`,
`getLifestyle()`, etc. — funciones async que en MVP devuelven hardcoded y en
Fase 2 se reemplazan por fetch a Supabase. Cero cambios en componentes.

## Animaciones

- Carrusel del hero: auto-advance 5.5s, swipe en mobile, flechas/teclado/dots en desktop.
- `prefers-reduced-motion` respetado globalmente (omite auto-advance, morphing,
  marquee, pulso del FAB).
- Solo se anima `transform` + `opacity` para 60fps.

## TODOs visibles en código

- [ ] Sustituir fotos lifestyle SVG por las reales del cliente (Drive/WeTransfer)
- [ ] Reemplazar las 4 bolsas (`/public/sabores/bolsa-*.png`) por las individuales por sabor cuando lleguen
- [ ] Regenerar `flotante-chili.svg` y `flotante-chili-limon.svg` con Nano Banana matching estilo de limón/queso (actualmente son SVG vectoriales placeholder)
- [ ] Confirmar embed de Google Maps cuando se valide la ubicación final

## Deploy a Vercel

1. Push del repo a GitHub.
2. New Project en Vercel → importar.
3. Framework: Next.js (auto-detect).
4. Configurar env vars antes del primer build.
5. Deploy.

## Roadmap Fase 2

Documentado en detalle en `../CLAUDE.md` sección 16. Resumen:

1. Migración a Supabase (tablas + RLS) reemplazando `getX()` helpers.
2. Panel admin en `/admin` con Supabase Auth.
3. Dominio `quenachos.bo` (QR se actualiza solo, es client-side).
4. E-commerce ligero (carrito + checkout vía WhatsApp).
5. Video loop en hero.
6. i18n con `next-intl`.
