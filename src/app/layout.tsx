import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

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

export const metadata: Metadata = {
  title: "Ángel Giolitti | Plataforma Oficial",
  description: "Explora la música, proyectos y agenda de Ángel Giolitti. Reproductor continuo y panel autoadministrable.",
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
    >
      <body className="spotify-layout">
        {/* ── Sidebar lateral izquierda ── */}
        <Sidebar />

        {/* ── Contenido principal (TopBar + páginas) ── */}
        <main className="main-view">
          <TopBar />
          <div className="main-view-content">
            {children}
          </div>
        </main>

        {/* ── Reproductor fijo inferior ── */}
        <GlobalAudioPlayer />
      </body>
    </html>
  );
}
