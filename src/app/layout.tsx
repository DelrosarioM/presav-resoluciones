// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configuramos la fuente Inter (Estándar profesional)
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Resoluciones | PRESAV UNELLEZ VIPI",
  description: "Plataforma de generación automatizada de resoluciones para la Comisión Asesora del PRESAV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased dark" 
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-100 text-gray-900 dark:bg-[#0A1128] dark:text-gray-100 transition-colors duration-500`}>
        {children}
      </body>
    </html>
  );
}