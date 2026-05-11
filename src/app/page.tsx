// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  IconFileDescription,
  IconUsersGroup,
  IconSchool,
  IconBooks,
  IconSettings,
  IconLogout,
  IconRefresh,
  IconChevronLeft,    // <-- NUEVO: Para colapsar
  IconChevronRight    // <-- NUEVO: Para expandir
} from '@tabler/icons-react';

import Paso1Formulario from "../components/Paso1Formulario";
import Paso2Considerandos from "../components/Paso2Considerandos";
import Paso3VistaPrevia from "../components/Paso3VistaPrevia";
import Login from "../components/Login";
import GestionUsuarios from "../components/GestionUsuarios";
import MiPerfil from "../components/MiPerfil";

export default function Home() {
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");

  const [vistaActiva, setVistaActiva] = useState<"resoluciones" | "usuarios" | "mis-resoluciones" | "perfil">("resoluciones");

  // NUEVO ESTADO: Controla si el panel lateral está expandido o colapsado
  const [sidebarExpandida, setSidebarExpandida] = useState(true);

  const [paso, setPaso] = useState(1);
  const [considerandosBD, setConsiderandosBD] = useState<any[]>([]);
  const [cargandoConsiderandos, setCargandoConsiderandos] = useState(true);
  const [considerandosSeleccionados, setConsiderandosSeleccionados] = useState<any[]>([]);
  const [veredicto, setVeredicto] = useState<"Aprobado" | "Negado" | "">("");
  const [textoResolucion, setTextoResolucion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [formulario, setFormulario] = useState({
    tipoResolucion: "ORDINARIA",
    ano: new Date().getFullYear().toString(),
    correlativo: "",
    acta: "",
    punto: "",
    fechaComision: "",
    nacionalidad: "V",
    cedula: "",
    nombre: "",
    programa: "",
    planteamiento: ""
  });

  useEffect(() => {
    const recuperarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const cedulaFormateada = session.user.email.split('@')[0].toUpperCase();
        const { data } = await supabase.from('Usuario').select('*').eq('cedula', cedulaFormateada).single();

        if (data) {
          setRolUsuario(data.rol);
          setNombreUsuario(`${data.primer_nombre} ${data.primer_apellido}`);
          setUsuarioAutenticado(true);
          if (data.rol === "estudiante") setVistaActiva("mis-resoluciones");
        }
      }
      setVerificandoSesion(false);
    };

    recuperarSesion();
  }, []);

  useEffect(() => {
    if (usuarioAutenticado && (rolUsuario === "administrador" || rolUsuario === "profesor")) {
      async function cargarConsiderandos() {
        try {
          const { data, error } = await supabase.from('ConsiderandosCatalogo').select('*').eq('activo', true);
          if (error) console.error("Error de Supabase:", error);
          else if (data) setConsiderandosBD(data);
        } catch (err) {
          console.error("Error inesperado:", err);
        } finally {
          setCargandoConsiderandos(false);
        }
      }
      cargarConsiderandos();
    }
  }, [usuarioAutenticado, rolUsuario]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
    if (errores[e.target.name]) setErrores({ ...errores, [e.target.name]: "" });
  };

  const validarYContinuar = () => {
    let nuevosErrores: Record<string, string> = {};
    if (!formulario.correlativo.trim()) nuevosErrores.correlativo = "Requerido";
    else if (!/^\d+$/.test(formulario.correlativo)) nuevosErrores.correlativo = "Solo números";
    if (!formulario.acta.trim()) nuevosErrores.acta = "Requerido";
    else if (!/^\d+$/.test(formulario.acta)) nuevosErrores.acta = "Solo números";
    if (!formulario.punto.trim()) nuevosErrores.punto = "Requerido";
    else if (!/^\d+$/.test(formulario.punto)) nuevosErrores.punto = "Solo números";
    if (!formulario.cedula.trim()) nuevosErrores.cedula = "Requerido";
    else if (!/^\d{7,9}$/.test(formulario.cedula)) nuevosErrores.cedula = "Solo números";
    if (!formulario.nombre.trim()) nuevosErrores.nombre = "Requerido";
    else if (formulario.nombre.trim().length < 5) nuevosErrores.nombre = "Ingrese el nombre completo";
    if (!formulario.programa) nuevosErrores.programa = "Seleccione un programa";
    if (!formulario.fechaComision) nuevosErrores.fechaComision = "Requerido";
    if (!formulario.planteamiento.trim()) nuevosErrores.planteamiento = "Requerido";

    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
    localStorage.setItem('presav_historial_form', JSON.stringify(formulario));
    setPaso(2);
  };

  const toggleConsiderando = (considerando: any) => {
    const yaExiste = considerandosSeleccionados.find(c => c.id === considerando.id);
    if (yaExiste) setConsiderandosSeleccionados(considerandosSeleccionados.filter(c => c.id !== considerando.id));
    else setConsiderandosSeleccionados([...considerandosSeleccionados, { ...considerando, texto: considerando.texto_plantilla }]);
  };

  const quitarConsiderando = (id: number) => setConsiderandosSeleccionados(considerandosSeleccionados.filter(c => c.id !== id));
  const actualizarTextoConsiderando = (id: number, nuevoTexto: string) => setConsiderandosSeleccionados(considerandosSeleccionados.map(c => c.id === id ? { ...c, texto: nuevoTexto } : c));

  const alIniciarSesion = (rol: string, nombre: string) => {
    setRolUsuario(rol);
    setNombreUsuario(nombre);
    setUsuarioAutenticado(true);
    if (rol === "estudiante") setVistaActiva("mis-resoluciones");
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuarioAutenticado(false);
    setRolUsuario("");
    setNombreUsuario("");
    setPaso(1);
    setVistaActiva("resoluciones");
  };

  useEffect(() => {
    let temporizador: NodeJS.Timeout;

    const reiniciarTemporizador = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(async () => {
        if (usuarioAutenticado) {
          alert("Tu sesión ha expirado por inactividad para proteger tus datos.");
          await cerrarSesion();
        }
      }, 15 * 60 * 1000);
    };

    if (usuarioAutenticado) {
      reiniciarTemporizador();

      window.addEventListener("mousemove", reiniciarTemporizador);
      window.addEventListener("keydown", reiniciarTemporizador);
      window.addEventListener("click", reiniciarTemporizador);
      window.addEventListener("scroll", reiniciarTemporizador);
    }

    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("mousemove", reiniciarTemporizador);
      window.removeEventListener("keydown", reiniciarTemporizador);
      window.removeEventListener("click", reiniciarTemporizador);
      window.removeEventListener("scroll", reiniciarTemporizador);
    };
  }, [usuarioAutenticado]);

  const limpiarFormulario = () => {
    if (window.confirm("¿Estás seguro de que deseas reiniciar la resolución? Se perderán los datos ingresados.")) {
      setPaso(1);
      setFormulario({
        tipoResolucion: "ORDINARIA",
        ano: new Date().getFullYear().toString(),
        correlativo: "",
        acta: "",
        punto: "",
        fechaComision: "",
        nacionalidad: "V",
        cedula: "",
        nombre: "",
        programa: "",
        planteamiento: ""
      });
      setConsiderandosSeleccionados([]);
      setVeredicto("");
      setTextoResolucion("");
    }
  };

  if (verificandoSesion) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-blue-900">Cargando sistema PRESAV...</div>;
  }

  if (!usuarioAutenticado) {
    return <Login onLoginExitoso={alIniciarSesion} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">

      {/* SIDEBAR CON LÓGICA DE COLAPSO */}
      <aside className={`bg-blue-900 text-white flex flex-col shadow-2xl z-20 shrink-0 transition-all duration-300 relative ${sidebarExpandida ? 'w-64' : 'w-20'}`}>

        {/* Botón flotante para expandir/colapsar */}
        <button
          onClick={() => setSidebarExpandida(!sidebarExpandida)}
          className="absolute -right-3.5 top-8 bg-orange-500 text-white rounded-full p-1.5 shadow-lg hover:bg-orange-600 transition-colors z-30"
          title={sidebarExpandida ? "Ocultar panel" : "Mostrar panel"}
        >
          {sidebarExpandida ? <IconChevronLeft size={16} stroke={3} /> : <IconChevronRight size={16} stroke={3} />}
        </button>

        <div className={`p-6 text-center border-b border-blue-800 h-24 flex flex-col justify-center transition-all ${!sidebarExpandida && 'px-2'}`}>
          {sidebarExpandida ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight">PRESAV</h2>
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
            <button
              onClick={() => setVistaActiva("resoluciones")}
              title="Generar Resolución"
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${vistaActiva === "resoluciones" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'justify-center'}`}
            >
              <IconFileDescription size={20} className="shrink-0" />
              {sidebarExpandida && <span className="truncate">Generar Resolución</span>}
            </button>
          )}

          {rolUsuario === "administrador" && (
            <button
              onClick={() => setVistaActiva("usuarios")}
              title="Gestión de Usuarios"
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${vistaActiva === "usuarios" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'justify-center'}`}
            >
              <IconUsersGroup size={20} className="shrink-0" />
              {sidebarExpandida && <span className="truncate">Gestión de Usuarios</span>}
            </button>
          )}

          {(rolUsuario === "profesor" || rolUsuario === "estudiante") && (
            <>
              <button
                onClick={() => setVistaActiva("mis-resoluciones")}
                title="Mis Trámites"
                className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${vistaActiva === "mis-resoluciones" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'justify-center'}`}
              >
                {rolUsuario === "estudiante" ? <IconSchool size={20} className="shrink-0" /> : <IconBooks size={20} className="shrink-0" />}
                {sidebarExpandida && <span className="truncate">Mis Trámites</span>}
              </button>
              <button
                onClick={() => setVistaActiva("perfil")}
                title="Mi Perfil"
                className={`p-3 rounded-xl transition-all font-medium flex items-center gap-3 ${vistaActiva === "perfil" ? 'bg-orange-500 shadow-md' : 'hover:bg-blue-800 text-blue-100'} ${!sidebarExpandida && 'justify-center'}`}
              >
                <IconSettings size={20} className="shrink-0" />
                {sidebarExpandida && <span className="truncate">Mi Perfil</span>}
              </button>
            </>
          )}
        </nav>

        <div className={`p-4 border-t border-blue-800 transition-all ${!sidebarExpandida && 'flex justify-center'}`}>
          {sidebarExpandida ? (
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

      <main className="flex-1 h-screen overflow-y-auto bg-gray-100 relative">
        <div className="p-8 max-w-7xl mx-auto">

          {vistaActiva === "usuarios" && rolUsuario === "administrador" && <GestionUsuarios />}

          {vistaActiva === "mis-resoluciones" && (
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
          )}

          {vistaActiva === "perfil" && (rolUsuario === "profesor" || rolUsuario === "estudiante") && <MiPerfil />}

          {vistaActiva === "resoluciones" && (rolUsuario === "administrador" || rolUsuario === "profesor") && (
            <>
              <header className="mb-8 text-center relative">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">Sistema de Resoluciones PRESAV</h1>
                <p className="text-lg text-gray-600">
                  {paso === 1 && "Paso 1: Datos Generales y del Solicitante"}
                  {paso === 2 && "Paso 2: Selección y Edición de Considerandos"}
                  {paso === 3 && "Paso 3: Veredicto y Vista Previa del Documento"}
                </p>
                <div className="flex justify-center mt-6 gap-4">
                  <div className={`h-2 w-24 rounded-full transition-colors ${paso >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <div className={`h-2 w-24 rounded-full transition-colors ${paso >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <div className={`h-2 w-24 rounded-full transition-colors ${paso >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                </div>

                {paso > 1 && (
                  <button onClick={limpiarFormulario} className="absolute right-0 top-0 mt-2 mr-2 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2">
                    <IconRefresh size={18} /> Reiniciar
                  </button>
                )}
              </header>

              {paso === 1 && <Paso1Formulario formulario={formulario} setFormulario={setFormulario} errores={errores} manejarCambio={manejarCambio} validarYContinuar={validarYContinuar} />}
              {paso === 2 && <Paso2Considerandos busqueda={busqueda} setBusqueda={setBusqueda} cargandoConsiderandos={cargandoConsiderandos} considerandosBD={considerandosBD} considerandosSeleccionados={considerandosSeleccionados} toggleConsiderando={toggleConsiderando} quitarConsiderando={quitarConsiderando} actualizarTextoConsiderando={actualizarTextoConsiderando} setPaso={setPaso} formulario={formulario} setTextoResolucion={setTextoResolucion} />}
              {paso === 3 && <Paso3VistaPrevia setPaso={setPaso} veredicto={veredicto} setVeredicto={setVeredicto} textoResolucion={textoResolucion} setTextoResolucion={setTextoResolucion} formulario={formulario} considerandosSeleccionados={considerandosSeleccionados} />}
              // probando despliegue automatico
            </>
          )}
        </div>
      </main>
    </div>
  );
}