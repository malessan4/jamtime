import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JamTime | Sincroniza a tu banda",
  description: "Encuentra el horario perfecto para los ensayos de tu proyecto musical sin fricciones ni mensajes perdidos.",
  applicationName: "JamTime",
  themeColor: "#0f172a", // Color slate-900 para que coincida con la cabecera

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" }, // Fallback para navegadores antiguos
      { url: "/icon.png", type: "image/png", sizes: "32x32" }, // Pestañas estándar
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }, // Para iOS/Safari
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* Agregamos suppressHydrationWarning también aquí para Grammarly */}
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}