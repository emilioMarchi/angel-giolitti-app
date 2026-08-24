import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getR2Url } from "@/lib/utils";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://angelgiolitti.com.ar";
const ogImage = getR2Url("images/gallery/handangel/photo-2.webp");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ángel Giolitti | Plataforma Oficial",
    template: "%s | Ángel Giolitti",
  },
  description: "Explora la música, proyectos y agenda de Ángel Giolitti. Reproductor continuo, discografía, galerías y eventos.",
  keywords: ["Ángel Giolitti", "música electrónica", "productor", "compositor", "Handangel", "discografía", "eventos"],
  authors: [{ name: "Ángel Giolitti" }],
  creator: "Ángel Giolitti",
  publisher: "Ángel Giolitti",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Ángel Giolitti | Plataforma Oficial",
    title: "Ángel Giolitti | Plataforma Oficial",
    description: "Explora la música, proyectos y agenda de Ángel Giolitti. Reproductor continuo, discografía, galerías y eventos.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Ángel Giolitti - Músico, Productor, Compositor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ángel Giolitti | Plataforma Oficial",
    description: "Explora la música, proyectos y agenda de Ángel Giolitti.",
    images: [ogImage],
    creator: "@angelgiolitti",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://pub-319a9d74deeb4bcebc10ae6384cf79b3.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-319a9d74deeb4bcebc10ae6384cf79b3.r2.dev" />
        <link rel="sitemap" href={`${siteUrl}/sitemap.xml`} />
        <link rel="robots" href={`${siteUrl}/robots.txt`} />
      </head>
      <body className="spotify-layout bg-[#0a0a0a] text-white">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
