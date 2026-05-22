import type { Metadata, Viewport } from "next";
import { Anton, Inter, Bagel_Fat_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WhatsAppFAB } from "@/components/ui/WhatsAppFAB";
import { MARCA } from "@/lib/data/marca";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bagel = Bagel_Fat_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quenachos.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${MARCA.nombre} · ${MARCA.tagline}`,
    template: `%s · ${MARCA.nombre}`,
  },
  description: MARCA.descripcionMeta,
  keywords: [
    "nachos proteicos",
    "snack saludable Bolivia",
    "Santa Cruz nachos",
    "proteína snack",
    "Que Nachos",
    "Nutravia",
    "snacks fitness",
    "antojo sin culpa",
  ],
  authors: [{ name: MARCA.razonSocial }],
  creator: MARCA.razonSocial,
  publisher: MARCA.razonSocial,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: SITE_URL,
    siteName: MARCA.nombre,
    title: `${MARCA.nombre} · ${MARCA.tagline}`,
    description: MARCA.taglineSecundario,
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: `${MARCA.nombre} — ${MARCA.tagline}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: MARCA.nombre,
    description: MARCA.tagline,
    images: ["/og"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f11c1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-BO"
      className={`${anton.variable} ${inter.variable} ${bagel.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-crema)] text-[var(--color-negro)]">
        {children}
        <WhatsAppFAB />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
