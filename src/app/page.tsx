"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Podríamos redirigir según el rol aquí si lo buscamos, pero simplificamos enviando al panel principal
        // El layout o cada página se encargará de rechazar si no tiene permisos.
        router.push("/resoluciones"); // o /mis-tramites si es estudiante, pero lo derivamos.
      } else {
        router.push("/login");
      }
    };
    
    verificarSesion();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-blue-900">
      Redirigiendo...
    </div>
  );
}