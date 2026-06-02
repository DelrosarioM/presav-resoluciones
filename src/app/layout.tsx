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
      lang="es" // Cambiado a español
      className="h-full antialiased"
    >
      {/* Aplicamos la fuente Inter, un fondo base gris claro y texto oscuro para toda la app */}
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-100 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}