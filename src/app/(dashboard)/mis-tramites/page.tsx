"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MisTramitesPage() {
  const [rolUsuario, setRolUsuario] = useState("");

  useEffect(() => {
    const recuperarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const cedulaFormateada = session.user.email.split('@')[0].toUpperCase();
        const { data } = await supabase.from('Usuario').select('rol').eq('cedula', cedulaFormateada).single();
        if (data) setRolUsuario(data.rol);
      }
    };
    recuperarSesion();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center mt-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">
        {rolUsuario === "estudiante" ? "Estatus de mis Trámites" : "Historial de Resoluciones"}
      </h2>
      <p className="text-gray-500">
        {rolUsuario === "estudiante"
          ? "Aquí podrás ver si tu solicitud fue Aprobada o Negada y descargar el PDF. (En construcción)"
          : "Aquí podrás ver todas las resoluciones que has firmado. (En construcción)"}
      </p>
    </div>
  );
}
