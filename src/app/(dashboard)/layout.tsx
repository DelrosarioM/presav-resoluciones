"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconFileDescription,
  IconUsersGroup,
  IconSchool,
  IconBooks,
  IconSettings,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
  IconMenu2 // <-- Importamos el ícono de hamburguesa
} from '@tabler/icons-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpandida, setSidebarExpandida] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Si es pantalla grande de computadora, lo abrimos por defecto
    if (window.innerWidth >= 768) {
      setSidebarExpandida(true);
    }

    const recuperarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const cedulaFormateada = session.user.email.split('@')[0].toUpperCase();
        const { data } = await supabase.from('Usuario').select('*').eq('cedula', cedulaFormateada).single();

        if (data) {
          setRolUsuario(data.rol);
          setNombreUsuario(`${data.primer_nombre} ${data.primer_apellido}`);
        }
      } else {
        router.push("/login");
      }
    };

    recuperarSesion();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    let temporizador: NodeJS.Timeout;

    const reiniciarTemporizador = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(async () => {
        alert("Tu sesión ha expirado por inactividad para proteger tus datos.");
        await cerrarSesion();
      }, 15 * 60 * 1000);
    };

    reiniciarTemporizador();

    window.addEventListener("mousemove", reiniciarTemporizador);
    window.addEventListener("keydown", reiniciarTemporizador);
    window.addEventListener("click", reiniciarTemporizador);
    window.addEventListener("scroll", reiniciarTemporizador);

    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("mousemove", reiniciarTemporizador);
      window.removeEventListener("keydown", reiniciarTemporizador);
      window.removeEventListener("click", reiniciarTemporizador);
      window.removeEventListener("scroll", reiniciarTemporizador);
    };
  }, []);

  if (!rolUsuario) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-blue-900">Cargando sistema PRESAV...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 overflow-hidden relative">

      {/* BARRA SUPERIOR PARA MÓVILES (Menú Hamburguesa) */}
      <div className="md:hidden bg-blue-900 text-white flex items-center justify-between p-4 shadow-md z-30 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarExpandida(true)}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <IconMenu2 size={24} />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-none">PRESAV</h1>
            <p className="text-blue-300 text-[10px] uppercase tracking-widest leading-none mt-1">
              {rolUsuario === "administrador" ? "Panel Admin" : rolUsuario === "profesor" ? "Panel Docente" : "Panel Estudiante"}
            </p>
          </div>
        </div>
      </div>

      {/* FONDO OSCURO PARA MÓVILES */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${sidebarExpandida ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarExpandida(false)}
      />

      {/* SIDEBAR */}
      {/* En móvil: Oculta a la izquierda (-translate-x-full) y desliza hacia adentro. En PC: posición relativa normal */}
      <aside className={`bg-blue-900 text-white flex flex-col shadow-2xl z-50 shrink-0 transition-transform md:transition-all duration-300 h-screen fixed md:relative left-0 top-0 
        ${sidebarExpandida ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'}
      `}>

        {/* Botón flotante para PC (oculto en móviles) */}
        <button
          onClick={() => setSidebarExpandida(!sidebarExpandida)}
          className="hidden md:block absolute -right-3.5 top-8 bg-orange-500 text-white rounded-full p-1.5 shadow-lg hover:bg-orange-600 transition-colors z-50"
          title={sidebarExpandida ? "Ocultar panel" : "Mostrar panel"}
        >
          {sidebarExpandida ? <IconChevronLeft size={16} stroke={3} /> : <IconChevronRight size={16} stroke={3} />}
        </button>

        <div className={`p-6 text-center border-b border-blue-800 h-24 flex flex-col justify-center transition-all ${!sidebarExpandida && 'md:px-2'}`}>
          {/* En móvil siempre mostramos el título expandido. En PC depende del estado. */}
          {sidebarExpandida || typeof window !== 'undefined' && window.innerWidth < 768 ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight flex items-center justify-between md:justify-center">
                PRESAV
                {/* Botón de cerrar (X) visible solo en móvil cuando está expandido */}
                <button onClick={() => setSidebarExpandida(false)} className="md:hidden p-1 text-blue-200 hover:text-white">
                  <IconChevronLeft size={24} />
                </button>
              </h2>
              <p className="text-blue-300 text-xs mt-1 uppercase tracking-widest truncate">
                {rolUsuario === "administrador" ? "Panel Admin" : rolUsuario === "profesor" ? "Panel Docente" : "Panel Estudiante"}
              </p>
            </>
          ) : (
            <h2 className="text-2xl font-bold tracking-tight">PR</h2>
          )}
        </div>

        <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {(rolUsuario === "administrador" || rolUsuario === "profesor") && (
            <Link
              href="/resoluciones"
              onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/resoluciones" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'md:justify-center'}`}
            >
              <IconFileDescription size={20} className="shrink-0" />
              {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Generar Resolución</span>}
            </Link>
          )}

          {rolUsuario === "administrador" && (
            <Link
              href="/usuarios"
              onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/usuarios" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'md:justify-center'}`}
            >
              <IconUsersGroup size={20} className="shrink-0" />
              {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Gestión de Usuarios</span>}
            </Link>
          )}

          {(rolUsuario === "administrador" || rolUsuario === "profesor") && (
            <Link
              href="/gestion-considerandos"
              onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/gestion-considerandos" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'md:justify-center'}`}
            >
              <IconClipboardList size={20} className="shrink-0" />
              {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Gestión Considerandos</span>}
            </Link>
          )}

          <Link
            href="/mis-tramites"
            onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
            className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/mis-tramites" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'md:justify-center'}`}
          >
            {rolUsuario === "estudiante" ? <IconSchool size={20} className="shrink-0" /> : <IconBooks size={20} className="shrink-0" />}
            {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Mis Trámites</span>}
          </Link>

          <Link
            href="/perfil"
            onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
            className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/perfil" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'md:justify-center'}`}
          >
            <IconSettings size={20} className="shrink-0" />
            {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Mi Perfil</span>}
          </Link>
        </nav>

        <div className={`p-4 border-t border-blue-800 transition-all ${!sidebarExpandida && 'md:flex md:justify-center'}`}>
          {sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
            <>
              <div className="mb-4">
                <p className="text-xs text-blue-300 uppercase">Conectado como:</p>
                <p className="font-bold truncate" title={nombreUsuario}>{nombreUsuario}</p>
              </div>
              <button onClick={cerrarSesion} className="w-full bg-red-500 hover:bg-red-600 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                <IconLogout size={18} /> Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={cerrarSesion} title="Cerrar Sesión" className="bg-red-500 hover:bg-red-600 p-3 rounded-xl font-bold transition-colors flex items-center justify-center shadow-sm w-full">
              <IconLogout size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL: Eliminamos el ml-20 en móvil porque el sidebar está oculto */}
      <main className="flex-1 h-[calc(100vh-72px)] md:h-screen overflow-y-auto bg-gray-100 transition-all duration-300 relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}