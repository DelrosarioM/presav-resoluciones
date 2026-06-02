// src/app/(dashboard)/gestion-considerandos/components/GestionConsiderandos.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IconPlus, IconPencil, IconX, IconCheck, IconSearch } from "@tabler/icons-react"; // <-- IMPORTAMOS IconSearch

export default function GestionConsiderandos() {
    const [considerandos, setConsiderandos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    // NUEVO ESTADO: Para guardar lo que el usuario escribe en el buscador
    const [busqueda, setBusqueda] = useState("");

    const [formulario, setFormulario] = useState({ id: null, titulo: "", texto_plantilla: "", activo: true });

    useEffect(() => {
        cargarConsiderandos();
    }, []);

    const cargarConsiderandos = async () => {
        setCargando(true);
        const { data, error } = await supabase.from('ConsiderandosCatalogo').select('*').order('id', { ascending: false });
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Gestión de Considerandos</h2>
                    <p className="text-gray-500 text-sm mt-1">Administra las plantillas de base legal para las resoluciones.</p>
                </div>
                <button onClick={abrirModalCrear} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                    <IconPlus size={20} /> Nueva Plantilla
                </button>
            </div>

            {/* NUEVO BARRA DE BÚSQUEDA */}
            <div className="relative mb-6 flex items-center rounded-xl border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
                <div className="pl-4 text-gray-400 flex items-center justify-center">
                    <IconSearch size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por título o palabra clave en el texto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full p-4 pl-3 bg-transparent text-gray-900 font-medium placeholder-gray-400 outline-none"
                />
            </div>

            {cargando ? (
                <div className="text-center p-8 text-gray-500 font-medium animate-pulse">Cargando catálogo...</div>
            ) : considerandosFiltrados.length === 0 ? (
                // MENSAJE CUANDO NO HAY RESULTADOS DE BÚSQUEDA
                <div className="text-center p-12 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No se encontraron considerandos que coincidan con tu búsqueda.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-sm uppercase border-b border-gray-200">
                                <th className="p-4 font-bold rounded-tl-lg w-1/4">Título / Etiqueta</th>
                                <th className="p-4 font-bold w-1/2">Texto Base</th>
                                <th className="p-4 font-bold text-center">Estado</th>
                                <th className="p-4 font-bold text-center rounded-tr-lg">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* USAMOS EL ARREGLO FILTRADO EN LUGAR DEL ARREGLO ORIGINAL */}
                            {considerandosFiltrados.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">{item.titulo}</td>
                                    {/* MUESTRA EL TEXTO COMPLETO RESPETANDO SALTOS DE LÍNEA */}
                                    <td className="p-4 text-gray-600 text-sm">
                                        <div className="whitespace-pre-line leading-relaxed">{item.texto_plantilla}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.activo ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center justify-center gap-1 w-max mx-auto"><IconCheck size={14} /> Activo</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 w-max mx-auto block">Inactivo</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => abrirModalEditar(item)} className="bg-blue-100 text-blue-700 py-1.5 px-3 rounded-lg hover:bg-blue-200 font-semibold text-xs transition-colors flex items-center gap-1"><IconPencil size={16} /> Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear/Editar se mantiene igual */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-900 p-5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {modoEdicion ? "Editar Considerando" : "Nueva Plantilla de Considerando"}
                            </h3>
                            <button onClick={() => setMostrarModal(false)} className="text-blue-200 hover:text-white transition-colors"><IconX size={24} /></button>
                        </div>
                        <form onSubmit={guardarConsiderando} className="p-6 space-y-4">
                            <div>
                                <label className="block font-medium text-gray-700 text-sm mb-1">Título / Nombre Corto *</label>
                                <input type="text" name="titulo" value={formulario.titulo} onChange={manejarCambio} required placeholder="Ej. Reglamento General Art. 45" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium outline-none bg-white" />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 text-sm mb-1 flex justify-between items-end">
                                    Texto de la Plantilla *
                                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Usa [VARIABLES] para campos dinámicos</span>
                                </label>
                                <textarea name="texto_plantilla" value={formulario.texto_plantilla} onChange={manejarCambio} required rows={6} placeholder="Ej. Que el estudiante [NOMBRE_ESTUDIANTE] cumplió con los requisitos..." className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium outline-none bg-white resize-y" />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" name="activo" id="activo" checked={formulario.activo} onChange={manejarCambio} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
                                <label htmlFor="activo" className="font-medium text-gray-700 cursor-pointer">Plantilla Activa (Visible en el generador)</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setMostrarModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
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