import { Hero } from "@/components/sections/Hero";
import { NubeDivider } from "@/components/sections/NubeDivider";
import { PorQue } from "@/components/sections/PorQue";
import { Sabores } from "@/components/sections/Sabores";
import { Recojo } from "@/components/sections/Recojo";
import { Eventos } from "@/components/sections/Eventos";
import { SobreNosotros } from "@/components/sections/SobreNosotros";
import { Comunidad } from "@/components/sections/Comunidad";
import { QR } from "@/components/sections/QR";
import { Footer } from "@/components/sections/Footer";
import { getSabores } from "@/lib/data/sabores";
import { getUbicacion } from "@/lib/data/ubicacion";
import { getLifestyle } from "@/lib/data/lifestyle";
import { MARCA } from "@/lib/data/marca";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quenachos.vercel.app";

export default async function Home() {
  const [sabores, ubicacion, lifestyle] = await Promise.all([
    getSabores(),
    getUbicacion(),
    getLifestyle(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: MARCA.nombre,
    legalName: MARCA.razonSocial,
    url: SITE_URL,
    description: MARCA.descripcionMeta,
    image: `${SITE_URL}/og`,
    address: {
      "@type": "PostalAddress",
      addressLocality: MARCA.ciudad,
      addressCountry: "BO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ubicacion.coordenadas.lat,
      longitude: ubicacion.coordenadas.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "12:00",
      },
    ],
    sameAs: [
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
        "https://www.instagram.com/quenachos.bo",
      process.env.NEXT_PUBLIC_TIKTOK_URL ??
        "https://www.tiktok.com/@quenachos.bo",
    ],
  };

  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero sabores={sabores} />
      <NubeDivider />
      <PorQue />
      <Sabores sabores={sabores} />
      <Eventos />
      <SobreNosotros />
      <Comunidad fotos={lifestyle} />
      <QR />
      <Recojo ubicacion={ubicacion} />
      <Footer />
    </main>
  );
}
