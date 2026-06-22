// src/app/(dashboard)/gestion-considerandos/components/GestionConsiderandos.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IconPlus, IconPencil, IconX, IconCheck, IconSearch } from "@tabler/icons-react";

export default function GestionConsiderandos() {
    const [considerandos, setConsiderandos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    // ESTADO: Para guardar lo que el usuario escribe en el buscador
    const [busqueda, setBusqueda] = useState("");

    const [formulario, setFormulario] = useState({ id: null, titulo: "", texto_plantilla: "", activo: true });

    useEffect(() => {
        cargarConsiderandos();
    }, []);

    const cargarConsiderandos = async () => {
        setCargando(true);
        const { data, error } = await supabase.from('ConsiderandosCatalogo').select('*, CategoriaConsiderando(nombre)').order('id', { ascending: false });
        if (error) console.error("Error al cargar considerandos:", error);
        else if (data) setConsiderandos(data);
        setCargando(false);
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormulario({ ...formulario, [e.target.name]: value });
    };

    const abrirModalCrear = () => {
        setFormulario({ id: null, titulo: "", texto_plantilla: "", activo: true });
        setModoEdicion(false);
        setMostrarModal(true);
    };

    const abrirModalEditar = (considerando: any) => {
        setFormulario(considerando);
        setModoEdicion(true);
        setMostrarModal(true);
    };

    const guardarConsiderando = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await fetch('/api/considerandos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formulario) });
            } else {
                await fetch('/api/considerandos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formulario) });
            }
            setMostrarModal(false);
            cargarConsiderandos();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Ocurrió un error al guardar el considerando.");
        }
    };

    // LÓGICA DE BÚSQUEDA: Filtramos el catálogo según el texto ingresado
    const considerandosFiltrados = considerandos.filter((item) =>
        item.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.texto_plantilla.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">
            {/* AJUSTE: Encabezado flex-col en móvil y flex-row en PC */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Gestión de Considerandos</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Administra las plantillas de base legal para las resoluciones.</p>
                </div>
                <button onClick={abrirModalCrear} className="w-full sm:w-auto justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                    <IconPlus size={20} /> Nueva Plantilla
                </button>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative mb-6 flex items-center rounded-xl border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
                <div className="pl-3 sm:pl-4 text-gray-400 flex items-center justify-center shrink-0">
                    <IconSearch size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por título o palabra clave en el texto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full p-3 sm:p-4 pl-2 sm:pl-3 bg-transparent text-sm sm:text-base text-gray-900 font-medium placeholder-gray-400 outline-none"
                />
            </div>

            {cargando ? (
                <div className="text-center p-8 text-gray-500 font-medium animate-pulse">Cargando catálogo...</div>
            ) : considerandosFiltrados.length === 0 ? (
                <div className="text-center p-8 sm:p-12 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm sm:text-base">
                    No se encontraron considerandos que coincidan con tu búsqueda.
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar pb-2 rounded-lg border border-gray-100">
                    {/* AJUSTE: min-w-[800px] para proteger la columna de texto largo */}
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-xs sm:text-sm uppercase border-b border-gray-200">
                                <th className="p-3 sm:p-4 font-bold rounded-tl-lg w-1/4">Título / Etiqueta</th>
                                <th className="p-3 sm:p-4 font-bold w-1/2">Texto Base</th>
                                <th className="p-3 sm:p-4 font-bold text-center w-28">Estado</th>
                                <th className="p-3 sm:p-4 font-bold text-center rounded-tr-lg w-28">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {considerandosFiltrados.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm sm:text-base">
                                    {/* AJUSTE: align-top para que no se descentren si el texto es muy largo */}
                                    <td className="p-3 sm:p-4 font-bold text-gray-800 align-top">{item.titulo}</td>
                                    <td className="p-3 sm:p-4 text-gray-600 text-xs sm:text-sm align-top">
                                        <div className="whitespace-pre-line leading-relaxed">{item.texto_plantilla}</div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-center align-top">
                                        {item.activo ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-green-200 flex items-center justify-center gap-1 w-max mx-auto"><IconCheck size={14} /> Activo</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-red-200 w-max mx-auto block">Inactivo</span>
                                        )}
                                    </td>
                                    <td className="p-3 sm:p-4 align-top">
                                        <button onClick={() => abrirModalEditar(item)} className="bg-blue-100 text-blue-700 py-1.5 px-3 rounded-lg hover:bg-blue-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1 w-full sm:w-max mx-auto"><IconPencil size={16} /> Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL CREAR/EDITAR */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-200 animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-900 p-4 sm:p-5 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                {modoEdicion ? "Editar Considerando" : "Nueva Plantilla de Considerando"}
                            </h3>
                            <button onClick={() => setMostrarModal(false)} className="text-blue-200 hover:text-white transition-colors shrink-0"><IconX size={24} /></button>
                        </div>
                        <form onSubmit={guardarConsiderando} className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block font-medium text-gray-700 text-xs sm:text-sm mb-1">Título / Nombre Corto *</label>
                                <input type="text" name="titulo" value={formulario.titulo} onChange={manejarCambio} required placeholder="Ej. Reglamento General Art. 45" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white min-w-0" />
                            </div>

                            <div>
                                {/* AJUSTE: flex-col en móvil para que el letrero naranja no choque con el texto */}
                                <label className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-end gap-2 sm:gap-0 font-medium text-gray-700 text-xs sm:text-sm mb-2">
                                    <span>Texto de la Plantilla *</span>
                                    <span className="text-[10px] sm:text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Usa [VARIABLES] para campos dinámicos</span>
                                </label>
                                <textarea name="texto_plantilla" value={formulario.texto_plantilla} onChange={manejarCambio} required rows={6} placeholder="Ej. Que el estudiante [NOMBRE_ESTUDIANTE] cumplió con los requisitos..." className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-gray-900 font-medium outline-none bg-white resize-y" />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" name="activo" id="activo" checked={formulario.activo} onChange={manejarCambio} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer shrink-0" />
                                <label htmlFor="activo" className="font-medium text-gray-700 text-sm sm:text-base cursor-pointer">Plantilla Activa (Visible en el generador)</label>
                            </div>

                            {/* AJUSTE: Botones apilados en móvil */}
                            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setMostrarModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
                                    {modoEdicion ? "Guardar Cambios" : "Crear Plantilla"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}