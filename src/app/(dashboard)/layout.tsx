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
  IconMenu2,
  IconSun,
  IconMoon
} from '@tabler/icons-react';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const [sidebarExpandida, setSidebarExpandida] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Control del modo oscuro (inicia en true por defecto)
  const [modoOscuro, setModoOscuro] = useState(true);

  useEffect(() => {
    const temaGuardado = localStorage.getItem('presav_tema');
    if (temaGuardado === 'light') {
      setModoOscuro(false);
    } else {
      setModoOscuro(true);
    }
  }, []);

  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('presav_tema', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('presav_tema', 'light');
    }
  }, [modoOscuro]);

  useEffect(() => {
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
    return <div className="min-h-screen bg-gray-100 dark:bg-[#0A1128] flex items-center justify-center font-bold text-blue-900 dark:text-blue-200 transition-colors">Cargando sistema PRESAV...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-[#0A1128] dark:to-[#16425B] transition-colors duration-500 overflow-hidden relative">

      {/* BARRA SUPERIOR MÓVIL */}
      <div className="md:hidden bg-blue-900 dark:bg-white/5 dark:backdrop-blur-md dark:border-b dark:border-white/10 text-white flex items-center justify-between p-4 shadow-md z-30 relative transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarExpandida(true)}
            className="p-2 hover:bg-blue-800 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <IconMenu2 size={24} />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-none">PRESAV</h1>
            <p className="text-blue-300 dark:text-orange-300 text-[10px] uppercase tracking-widest leading-none mt-1">
              {rolUsuario === "administrador" ? "Panel Admin" : rolUsuario === "profesor" ? "Panel Docente" : "Panel Estudiante"}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/60 dark:bg-black/80 z-40 md:hidden transition-opacity duration-300 ${sidebarExpandida ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarExpandida(false)}
      />

      {/* SIDEBAR CON GLASSMORPHISM */}
      <aside className={`bg-blue-900 dark:bg-[#0A1128]/40 dark:backdrop-blur-xl dark:border-r dark:border-white/10 text-white flex flex-col shadow-2xl z-50 shrink-0 transition-all duration-300 h-screen fixed md:relative left-0 top-0 
        ${sidebarExpandida ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'}
      `}>

        <button
          onClick={() => setSidebarExpandida(!sidebarExpandida)}
          className="hidden md:flex items-center justify-center absolute -right-3.5 top-8 bg-orange-500 text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:bg-orange-600 transition-colors z-50"
          title={sidebarExpandida ? "Ocultar panel" : "Mostrar panel"}
        >
          {sidebarExpandida ? <IconChevronLeft size={16} stroke={3} /> : <IconChevronRight size={16} stroke={3} />}
        </button>

        <div className={`p-6 text-center border-b border-blue-800 dark:border-white/10 h-24 flex flex-col justify-center transition-all ${!sidebarExpandida && 'md:px-2'}`}>
          {sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight flex items-center justify-between md:justify-center">
                PRESAV
                <button onClick={() => setSidebarExpandida(false)} className="md:hidden p-1 text-blue-200 dark:text-white/70 hover:text-white">
                  <IconChevronLeft size={24} />
                </button>
              </h2>
              <p className="text-blue-300 dark:text-orange-400 text-xs mt-1 uppercase tracking-widest truncate">
                {rolUsuario === "administrador" ? "Panel Admin" : rolUsuario === "profesor" ? "Panel Docente" : "Panel Estudiante"}
              </p>
            </>
          ) : (
            <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-orange-400">PR</h2>
          )}
        </div>

        <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {(rolUsuario === "administrador" || rolUsuario === "profesor") && (
            <Link
              href="/resoluciones"
              onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/resoluciones" ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'hover:bg-blue-800 dark:hover:bg-white/10 text-blue-100 dark:text-gray-300'} ${!sidebarExpandida && 'md:justify-center'}`}
            >
              <IconFileDescription size={20} className="shrink-0" />
              {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Generar Resolución</span>}
            </Link>
          )}

          {rolUsuario === "administrador" && (
            <Link
              href="/usuarios"
              onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/usuarios" ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'hover:bg-blue-800 dark:hover:bg-white/10 text-blue-100 dark:text-gray-300'} ${!sidebarExpandida && 'md:justify-center'}`}
            >
              <IconUsersGroup size={20} className="shrink-0" />
              {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Gestión de Usuarios</span>}
            </Link>
          )}

          {(rolUsuario === "administrador" || rolUsuario === "profesor") && (
            <Link
              href="/gestion-considerandos"
              onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/gestion-considerandos" ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'hover:bg-blue-800 dark:hover:bg-white/10 text-blue-100 dark:text-gray-300'} ${!sidebarExpandida && 'md:justify-center'}`}
            >
              <IconClipboardList size={20} className="shrink-0" />
              {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Gestión Considerandos</span>}
            </Link>
          )}

          {/* BOTÓN DEL HISTORIAL DE RESOLUCIONES */}
          <Link
            href="/historial"
            onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
            className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/historial" ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'hover:bg-blue-800 dark:hover:bg-white/10 text-blue-100 dark:text-gray-300'} ${!sidebarExpandida && 'md:justify-center'}`}
          >
            <IconBooks size={20} className="shrink-0" />
            {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Historial Resoluciones</span>}
          </Link>

          <Link
            href="/perfil"
            onClick={() => { if (window.innerWidth < 768) setSidebarExpandida(false) }}
            className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${pathname === "/perfil" ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'hover:bg-blue-800 dark:hover:bg-white/10 text-blue-100 dark:text-gray-300'} ${!sidebarExpandida && 'md:justify-center'}`}
          >
            <IconSettings size={20} className="shrink-0" />
            {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="truncate">Mi Perfil</span>}
          </Link>
        </nav>

        <div className={`p-4 border-t border-blue-800 dark:border-white/10 transition-all ${!sidebarExpandida && 'md:flex md:flex-col md:items-center'}`}>
          <button
            onClick={() => setModoOscuro(!modoOscuro)}
            className={`w-full mb-3 bg-blue-800 hover:bg-blue-700 dark:bg-white/10 dark:hover:bg-white/20 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${!sidebarExpandida && 'md:px-0 md:py-3'}`}
            title={modoOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {modoOscuro ? <IconSun size={18} className="text-yellow-400" /> : <IconMoon size={18} />}
            {(sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768)) && (modoOscuro ? "Modo Claro" : "Modo Oscuro")}
          </button>

          {sidebarExpandida || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
            <>
              <div className="mb-4 text-center">
                <p className="text-xs text-blue-300 dark:text-gray-400 uppercase">Conectado como:</p>
                <p className="font-bold truncate" title={nombreUsuario}>{nombreUsuario}</p>
              </div>
              <button onClick={cerrarSesion} className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-500 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                <IconLogout size={18} /> Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={cerrarSesion} title="Cerrar Sesión" className="bg-red-500 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-500 p-3 rounded-xl font-bold transition-colors flex items-center justify-center shadow-sm w-full">
              <IconLogout size={18} />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 h-[calc(100vh-72px)] md:h-screen overflow-y-auto transition-all duration-300 relative z-10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}