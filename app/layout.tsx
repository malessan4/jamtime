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
  title: "JamTime",
  description: "Organiza tus ensayos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Agregamos suppressHydrationWarning a la etiqueta html para silenciar 
    // conflictos con extensiones del navegador como LanguageTool o Dark Reader.
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}