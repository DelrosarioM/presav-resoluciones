// src/app/(dashboard)/usuarios/components/GestionUsuarios.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IconUserPlus, IconTrash, IconShieldLock, IconX, IconSearch, IconId } from "@tabler/icons-react";

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const [filtroActivo, setFiltroActivo] = useState<"todos" | "administrador" | "profesor" | "estudiante">("todos");

    // NUEVOS ESTADOS DE BÚSQUEDA
    const [busquedaNombre, setBusquedaNombre] = useState("");
    const [busquedaCedula, setBusquedaCedula] = useState("");

    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalSeguridad, setMostrarModalSeguridad] = useState(false);

    const [accionPendiente, setAccionPendiente] = useState<"crear" | "editar" | "eliminar" | "">("");

    const [passwordAdmin, setPasswordAdmin] = useState("");
    const [errorSeguridad, setErrorSeguridad] = useState("");
    const [verificando, setVerificando] = useState(false);

    const [nuevoUsuario, setNuevoUsuario] = useState({ nacionalidad: "V", cedula: "", primer_nombre: "", primer_apellido: "", password: "", rol: "profesor" });
    const [usuarioEditando, setUsuarioEditando] = useState({ cedula_original: "", primer_nombre: "", primer_apellido: "", password_nueva: "" });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        const { data, error } = await supabase.from('Usuario').select('*').order('id', { ascending: true });
        if (error) console.error("Error al cargar usuarios:", error);
        else if (data) setUsuarios(data);
        setCargando(false);
    };

    const manejarCambioNuevo = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
    const manejarCambioEditar = (e: React.ChangeEvent<HTMLInputElement>) => setUsuarioEditando({ ...usuarioEditando, [e.target.name]: e.target.value });

    const abrirModalCrear = () => { setAccionPendiente("crear"); setMostrarModalCrear(true); };

    const abrirModalEditar = (user: any) => {
        setUsuarioEditando({ cedula_original: user.cedula, primer_nombre: user.primer_nombre, primer_apellido: user.primer_apellido, password_nueva: "" });
        setAccionPendiente("editar"); setMostrarModalEditar(true);
    };

    const gatillarSeguridad = (e?: React.FormEvent, accion: "crear" | "editar" | "eliminar" = "crear") => {
        if (e) e.preventDefault(); setAccionPendiente(accion); setMostrarModalSeguridad(true);
    };

    const verificarYEjecutar = async () => {
        setErrorSeguridad(""); setVerificando(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error("No se pudo identificar la sesión.");

            const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: passwordAdmin });
            if (authError) throw new Error("Contraseña de administrador incorrecta.");

            if (accionPendiente === "crear") await peticionAPI('/api/usuarios', 'POST', nuevoUsuario);
            if (accionPendiente === "editar") await peticionAPI('/api/usuarios', 'PUT', usuarioEditando);
            if (accionPendiente === "eliminar") await peticionAPI('/api/usuarios', 'DELETE', { cedula: usuarioEditando.cedula_original });

            setPasswordAdmin(""); setMostrarModalSeguridad(false); setMostrarModalCrear(false); setMostrarModalEditar(false);
            cargarUsuarios();
        } catch (err: any) { setErrorSeguridad(err.message || "Error al verificar seguridad."); }
        finally { setVerificando(false); }
    };

    const peticionAPI = async (url: string, metodo: string, bodyData: any) => {
        const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert(`✅ Éxito: ${data.message}`);
    };

    // LÓGICA DE FILTRADO COMBINADA (Rol + Nombre + Cédula)
    const usuariosFiltrados = usuarios.filter(user => {
        // 1. Filtro por Rol
        const pasaFiltroRol = filtroActivo === "todos" || user.rol === filtroActivo;

        // 2. Filtro por Nombre
        const nombreCompleto = `${user.primer_nombre} ${user.primer_apellido}`.toLowerCase();
        const pasaFiltroNombre = nombreCompleto.includes(busquedaNombre.toLowerCase());

        // 3. Filtro por Cédula
        const pasaFiltroCedula = user.cedula.toLowerCase().includes(busquedaCedula.toLowerCase());

        return pasaFiltroRol && pasaFiltroNombre && pasaFiltroCedula;
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 relative">
            {/* AJUSTE: Encabezado flex-col en móvil y flex-row en PC */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Gestión de Usuarios</h2>
                <button onClick={abrirModalCrear} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                    <IconUserPlus size={20} /> Nuevo Usuario
                </button>
            </div>

            {/* PESTAÑAS DE ROLES - AJUSTE: Scroll horizontal en móviles */}
            <div className="flex gap-4 sm:gap-6 mb-6 border-b border-gray-200 overflow-x-auto custom-scrollbar whitespace-nowrap">
                <button onClick={() => setFiltroActivo("todos")} className={`pb-3 px-1 font-semibold transition-all border-b-2 shrink-0 ${filtroActivo === "todos" ? "border-blue-900 text-blue-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>Todos</button>
                <button onClick={() => setFiltroActivo("administrador")} className={`pb-3 px-1 font-semibold transition-all border-b-2 shrink-0 ${filtroActivo === "administrador" ? "border-red-500 text-red-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}>Administradores</button>
                <button onClick={() => setFiltroActivo("profesor")} className={`pb-3 px-1 font-semibold transition-all border-b-2 shrink-0 ${filtroActivo === "profesor" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}>Profesores</button>
                <button onClick={() => setFiltroActivo("estudiante")} className={`pb-3 px-1 font-semibold transition-all border-b-2 shrink-0 ${filtroActivo === "estudiante" ? "border-green-500 text-green-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}>Estudiantes</button>
            </div>

            {/* NUEVOS BUSCADORES DE TEXTO Y CÉDULA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Buscador de Cédula */}
                <div className="relative flex items-center rounded-xl border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
                    <div className="pl-3 sm:pl-4 text-gray-400 flex items-center justify-center shrink-0">
                        <IconId size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por cédula..."
                        value={busquedaCedula}
                        onChange={(e) => setBusquedaCedula(e.target.value)}
                        className="w-full p-3 sm:p-4 pl-2 sm:pl-3 bg-transparent text-sm sm:text-base text-gray-900 font-medium placeholder-gray-400 outline-none"
                    />
                </div>

                {/* Buscador de Nombre */}
                <div className="relative flex items-center rounded-xl border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
                    <div className="pl-3 sm:pl-4 text-gray-400 flex items-center justify-center shrink-0">
                        <IconSearch size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={busquedaNombre}
                        onChange={(e) => setBusquedaNombre(e.target.value)}
                        className="w-full p-3 sm:p-4 pl-2 sm:pl-3 bg-transparent text-sm sm:text-base text-gray-900 font-medium placeholder-gray-400 outline-none"
                    />
                </div>
            </div>

            {cargando ? (
                <div className="text-center p-8 text-gray-500 font-medium animate-pulse">Cargando base de datos...</div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar pb-2 rounded-lg border border-gray-100">
                    {usuariosFiltrados.length === 0 ? (
                        <div className="text-center p-8 sm:p-12 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm sm:text-base">
                            No hay usuarios que coincidan con los filtros seleccionados.
                        </div>
                    ) : (
                        // AJUSTE: min-w-[700px] asegura que la tabla no se aplaste en pantallas pequeñas
                        <table className="w-full min-w-[700px] text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700 text-xs sm:text-sm uppercase border-b border-gray-200">
                                    <th className="p-3 sm:p-4 font-bold rounded-tl-lg w-16">ID</th>
                                    <th className="p-3 sm:p-4 font-bold">Cédula</th>
                                    <th className="p-3 sm:p-4 font-bold">Nombre Completo</th>
                                    <th className="p-3 sm:p-4 font-bold w-32">Rol</th>
                                    <th className="p-3 sm:p-4 font-bold text-center rounded-tr-lg w-28">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm sm:text-base">
                                        <td className="p-3 sm:p-4 font-medium text-gray-500">#{user.id}</td>
                                        <td className="p-3 sm:p-4 font-bold text-gray-800">{user.cedula}</td>
                                        <td className="p-3 sm:p-4 text-gray-700">{user.primer_nombre} {user.primer_apellido}</td>
                                        <td className="p-3 sm:p-4">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border inline-block text-center w-full ${user.rol === 'administrador' ? 'bg-red-50 text-red-600 border-red-200' : user.rol === 'profesor' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 flex justify-center gap-2">
                                            <button onClick={() => abrirModalEditar(user)} className="bg-blue-100 text-blue-700 py-1.5 px-3 rounded-lg hover:bg-blue-200 font-semibold text-xs transition-colors w-full sm:w-auto">Editar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* MODAL CREAR USUARIO */}
            {mostrarModalCrear && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] border border-gray-200 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                        <div className="bg-blue-900 p-4 sm:p-5 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                <IconUserPlus size={24} /> Registrar Nuevo
                            </h3>
                            <button onClick={() => setMostrarModalCrear(false)} className="text-blue-200 hover:text-white transition-colors"><IconX size={24} /></button>
                        </div>
                        <form onSubmit={(e) => gatillarSeguridad(e, "crear")} className="p-4 sm:p-6 space-y-4" autoComplete="off">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Rol *</label>
                                    <select name="rol" value={nuevoUsuario.rol} onChange={manejarCambioNuevo} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base text-gray-900 font-medium bg-white">
                                        <option value="estudiante">Estudiante</option><option value="profesor">Profesor</option><option value="administrador">Administrador</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Cédula *</label>
                                    <div className="flex rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                                        <select name="nacionalidad" value={nuevoUsuario.nacionalidad} onChange={manejarCambioNuevo} className="bg-gray-100 p-3 text-sm sm:text-base font-bold border-r border-gray-300 outline-none text-gray-900"><option value="V">V-</option><option value="E">E-</option></select>
                                        <input type="text" name="cedula" value={nuevoUsuario.cedula} onChange={manejarCambioNuevo} placeholder="12345678" required className="flex-1 p-3 text-sm sm:text-base outline-none text-gray-900 font-medium min-w-0" maxLength={9} />
                                    </div>
                                </div>
                                <div><label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Nombre</label><input type="text" name="primer_nombre" onChange={manejarCambioNuevo} required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white min-w-0" /></div>
                                <div><label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Apellido</label><input type="text" name="primer_apellido" onChange={manejarCambioNuevo} required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white min-w-0" /></div>
                                <div className="sm:col-span-2"><label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Contraseña Inicial</label><input type="password" name="password" onChange={manejarCambioNuevo} required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white min-w-0" /></div>
                            </div>
                            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setMostrarModalCrear(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">Crear Usuario</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR USUARIO */}
            {mostrarModalEditar && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-200 custom-scrollbar">
                        <div className="bg-gray-100 border-b border-gray-200 p-4 sm:p-5 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">Editar: {usuarioEditando.cedula_original}</h3>
                            <button onClick={() => setMostrarModalEditar(false)} className="text-gray-400 hover:text-gray-800 transition-colors shrink-0"><IconX size={24} /></button>
                        </div>

                        <form onSubmit={(e) => gatillarSeguridad(e, "editar")} className="p-4 sm:p-6 space-y-4" autoComplete="off">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Primer Nombre</label>
                                    <input type="text" name="primer_nombre" value={usuarioEditando.primer_nombre} onChange={manejarCambioEditar} required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white min-w-0" />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Primer Apellido</label>
                                    <input type="text" name="primer_apellido" value={usuarioEditando.primer_apellido} onChange={manejarCambioEditar} required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white min-w-0" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Restablecer Contraseña</label>
                                    <input type="password" name="password_nueva" value={usuarioEditando.password_nueva} onChange={manejarCambioEditar} placeholder="Dejar en blanco para NO cambiarla" className="w-full p-3 rounded-xl border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base text-gray-900 font-medium outline-none min-w-0" />
                                </div>
                            </div>

                            {/* AJUSTE: Botones de Editar apilados en móvil */}
                            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 mt-6 gap-4 sm:gap-0">
                                <button type="button" onClick={() => gatillarSeguridad(undefined, "eliminar")} className="w-full sm:w-auto justify-center text-red-600 hover:bg-red-50 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                                    <IconTrash size={20} /> Eliminar Usuario
                                </button>
                                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                                    <button type="button" onClick={() => setMostrarModalEditar(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                    <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">Guardar Cambios</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL SEGURIDAD */}
            {mostrarModalSeguridad && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-red-500">
                        <div className="bg-red-500 p-4 sm:p-5 text-center">
                            <div className="bg-white/20 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-white">
                                <IconShieldLock size={28} className="sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white">Validación de Seguridad</h3>
                        </div>
                        <div className="p-5 sm:p-6">
                            <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center">
                                Confirmando acción: <strong className="uppercase text-red-600">{accionPendiente}</strong>. Por favor, ingrese su contraseña de administrador.
                            </p>
                            {errorSeguridad && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg mb-4 text-center border border-red-200">{errorSeguridad}</div>}
                            <input type="password" value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} placeholder="Contraseña de Admin" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none text-gray-900 text-sm sm:text-base text-center font-medium mb-6 bg-gray-50 min-w-0" autoFocus onKeyDown={(e) => e.key === 'Enter' && verificarYEjecutar()} />
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button onClick={() => { setMostrarModalSeguridad(false); setPasswordAdmin(""); }} className="flex-1 py-2.5 text-sm sm:text-base text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                                <button onClick={verificarYEjecutar} disabled={verificando || !passwordAdmin} className={`flex-1 py-2.5 text-sm sm:text-base text-white font-bold rounded-xl transition-colors ${verificando || !passwordAdmin ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{verificando ? "Procesando..." : "Confirmar"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}