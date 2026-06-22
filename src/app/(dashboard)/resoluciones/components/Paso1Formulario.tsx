// src/components/Paso1Formulario.tsx
import React, { useState, useEffect } from "react";
import { IconFileDescription, IconUser, IconHistory } from "@tabler/icons-react";

import { useResoluciones } from "../context/ResolucionesContext";

export default function Paso1Formulario() {
    const { formulario, setFormulario, errores, manejarCambio, validarYContinuar } = useResoluciones();
    const [historial, setHistorial] = useState<any>(null);

    useEffect(() => {
        const datosGuardados = localStorage.getItem('presav_historial_form');
        if (datosGuardados) {
            setHistorial(JSON.parse(datosGuardados));
        }
    }, []);

    const hoy = new Date().toISOString().split('T')[0];

    const acortarTexto = (texto: string, max: number) => {
        if (!texto) return "";
        return texto.length > max ? texto.substring(0, max) + "..." : texto;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8 md:p-10 max-w-4xl mx-auto">
            <form className="space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()} autoComplete="off">
                <section>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4 sm:mb-6 flex items-center gap-2">
                        <IconFileDescription className="text-blue-600" size={24} /> Datos del Documento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Tipo de Resolución *</label>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <label className={`flex items-center gap-2 cursor-pointer p-3 sm:p-4 border rounded-xl flex-1 transition-colors ${formulario.tipoResolucion === 'ORDINARIA' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                                    <input type="radio" name="tipoResolucion" value="ORDINARIA" checked={formulario.tipoResolucion === 'ORDINARIA'} onChange={manejarCambio} className="w-5 h-5 text-blue-600 shrink-0" />
                                    <span className="text-base sm:text-lg font-bold">ORDINARIA</span>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer p-3 sm:p-4 border rounded-xl flex-1 transition-colors ${formulario.tipoResolucion === 'EXTRAORDINARIA' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                                    <input type="radio" name="tipoResolucion" value="EXTRAORDINARIA" checked={formulario.tipoResolucion === 'EXTRAORDINARIA'} onChange={manejarCambio} className="w-5 h-5 text-blue-600 shrink-0" />
                                    <span className="text-base sm:text-lg font-bold">EXTRAORDINARIA</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Identificador de Resolución *</label>
                            <div className={`flex items-center rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white ${(errores.correlativo || errores.ano) ? 'border-red-500' : 'border-gray-300'}`}>
                                <span className="bg-gray-100 py-3 px-2 sm:p-4 text-xs sm:text-base text-gray-600 font-bold border-r border-gray-300 shrink-0 whitespace-nowrap">CAPRESAV Nº</span>
                                <input type="text" name="ano" value={formulario.ano} onChange={manejarCambio} className="w-16 sm:w-20 py-3 px-0 sm:p-4 text-center focus:outline-none text-sm sm:text-lg bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-colors shrink-0" maxLength={4} placeholder="YYYY" />
                                <span className="text-gray-400 text-base sm:text-xl font-light px-1 sm:px-2 shrink-0">/</span>
                                <input type="text" name="correlativo" value={formulario.correlativo} onChange={manejarCambio} placeholder="0231" className="flex-1 min-w-0 py-3 px-2 sm:p-4 focus:outline-none text-sm sm:text-lg text-gray-900 font-medium placeholder-gray-400" maxLength={4} />
                            </div>
                            {(errores.correlativo || errores.ano) && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.ano ? errores.ano : errores.correlativo}</span>}
                            {historial?.correlativo && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, correlativo: historial.correlativo, ano: historial.ano || new Date().getFullYear().toString() })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} /> Última: <span className="font-semibold text-gray-600">{historial.ano || new Date().getFullYear()}/{historial.correlativo}</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Acta Nº y Punto *</label>
                            <div className="flex gap-2">
                                <div className="w-1/2 flex flex-col">
                                    <input type="text" name="acta" value={formulario.acta} onChange={manejarCambio} placeholder="Acta (Ej. 113)" className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg text-gray-900 font-medium placeholder-gray-400 focus:outline-none min-w-0 ${errores.acta ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errores.acta && <span className="text-red-500 text-xs sm:text-sm font-bold mt-1">{errores.acta}</span>}
                                    {historial?.acta && (
                                        <button type="button" onClick={() => setFormulario({ ...formulario, acta: historial.acta })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                            <IconHistory size={12} /> Última: <span className="font-semibold text-gray-600">{historial.acta}</span>
                                        </button>
                                    )}
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <input type="text" name="punto" value={formulario.punto} onChange={manejarCambio} placeholder="Punto (Ej. 50)" className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg text-gray-900 font-medium placeholder-gray-400 focus:outline-none min-w-0 ${errores.punto ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errores.punto && <span className="text-red-500 text-xs sm:text-sm font-bold mt-1">{errores.punto}</span>}
                                    {historial?.punto && (
                                        <button type="button" onClick={() => setFormulario({ ...formulario, punto: historial.punto })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                            <IconHistory size={12} /> Último: <span className="font-semibold text-gray-600">{historial.punto}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Fecha de la Comisión *</label>
                            <input
                                type="date"
                                name="fechaComision"
                                value={formulario.fechaComision}
                                onChange={manejarCambio}
                                max={hoy}
                                className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg text-gray-900 font-medium bg-white focus:outline-none cursor-pointer w-full ${errores.fechaComision ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.fechaComision && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.fechaComision}</span>}
                            {historial?.fechaComision && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, fechaComision: historial.fechaComision })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} /> Última: <span className="font-semibold text-gray-600">{historial.fechaComision}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4 sm:mb-6 flex items-center gap-2 mt-4">
                        <IconUser className="text-blue-600" size={24} /> Datos del Solicitante
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Cédula de Identidad *</label>
                            <div className={`flex items-center rounded-xl border overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 ${errores.cedula ? 'border-red-500' : 'border-gray-300'}`}>
                                <select name="nacionalidad" value={formulario.nacionalidad} onChange={manejarCambio} className="bg-gray-100 p-3 sm:p-4 text-sm sm:text-lg text-gray-900 font-bold border-r border-gray-300 focus:outline-none cursor-pointer shrink-0">
                                    <option value="V">V-</option>
                                    <option value="E">E-</option>
                                </select>
                                <input type="text" name="cedula" value={formulario.cedula} onChange={manejarCambio} placeholder="16425388" className="flex-1 min-w-0 p-3 sm:p-4 focus:outline-none text-sm sm:text-lg text-gray-900 font-medium placeholder-gray-400" maxLength={9} />
                            </div>
                            {errores.cedula && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.cedula}</span>}
                            {historial?.cedula && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, cedula: historial.cedula, nacionalidad: historial.nacionalidad || 'V' })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} /> Última: <span className="font-semibold text-gray-600">{historial.nacionalidad || 'V'}-{historial.cedula}</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Nombre Completo *</label>
                            <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} placeholder="Ej. Yailmar Galindez" className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg text-gray-900 font-medium placeholder-gray-400 min-w-0 ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`} />
                            {errores.nombre && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.nombre}</span>}
                            {historial?.nombre && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, nombre: historial.nombre })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} className="shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-xs">Último: <span className="font-semibold text-gray-600">{acortarTexto(historial.nombre, 25)}</span></span>
                                </button>
                            )}
                        </div>

                        {/* Programa Académico */}
                        <div className="flex flex-col gap-2 md:col-span-1">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Programa académico *</label>
                            <select name="programa" value={formulario.programa} onChange={manejarCambio} className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg bg-white text-gray-900 font-medium w-full text-ellipsis overflow-hidden pr-8 ${errores.programa ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="" className="text-gray-400">Seleccione un programa...</option>
                                <option value="Maestría en Educación mención Docencia Universitaria">Maestría en Educación mención Docencia Universitaria</option>
                                <option value="Maestría en Gerencia Pública">Maestría en Gerencia Pública</option>
                            </select>
                            {errores.programa && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.programa}</span>}
                            {historial?.programa && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, programa: historial.programa })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} className="shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-xs">Último: <span className="font-semibold text-gray-600">{acortarTexto(historial.programa, 25)}</span></span>
                                </button>
                            )}
                        </div>

                        {/* Sede */}
                        <div className="flex flex-col gap-2 md:col-span-1">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Sede *</label>
                            <select name="sede" value={formulario.sede || ""} onChange={manejarCambio} className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg bg-white text-gray-900 font-medium w-full text-ellipsis overflow-hidden pr-8 ${errores?.sede ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="" className="text-gray-400">Seleccione una sede...</option>
                                <option value="VIPI San Carlos">VIPI San Carlos</option>
                                <option value="VPDS Barinas">VPDS Barinas</option>
                                <option value="VPA Guanare">VPA Guanare</option>
                                <option value="VPRR San Fernando">VPRR San Fernando</option>
                            </select>
                            {errores?.sede && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.sede}</span>}
                            {historial?.sede && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, sede: historial.sede })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} /> Última: <span className="font-semibold text-gray-600">{historial.sede}</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-medium text-gray-700 text-sm sm:text-base">Planteamiento de la Solicitud *</label>
                            <textarea
                                name="planteamiento"
                                value={formulario.planteamiento}
                                onChange={manejarCambio}
                                rows={4}
                                placeholder="Ej. Solicitud de REINGRESO EN FORMA EXCEPCIONAL, a fin de proseguir estudios..."
                                className={`p-3 sm:p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm sm:text-lg text-gray-900 font-medium bg-white focus:outline-none resize-y w-full ${errores.planteamiento ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.planteamiento && <span className="text-red-500 text-xs sm:text-sm font-bold">{errores.planteamiento}</span>}
                            {historial?.planteamiento && (
                                <button type="button" onClick={() => setFormulario({ ...formulario, planteamiento: historial.planteamiento })} className="text-[10px] sm:text-[11px] text-gray-400 hover:text-blue-600 mt-1 flex items-center gap-1 transition-colors text-left w-max">
                                    <IconHistory size={12} className="shrink-0" /> <span className="truncate w-full max-w-[200px] sm:max-w-md">Último: <span className="font-semibold text-gray-600">{acortarTexto(historial.planteamiento, 50)}</span></span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <div className="pt-4 sm:pt-6 flex justify-end border-t border-gray-200 mt-6 sm:mt-8">
                    <button type="button" onClick={validarYContinuar} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-3 px-8 rounded-xl text-base transition-colors shadow-sm flex items-center justify-center gap-2">
                        <span>Siguiente: Seleccionar Considerandos</span>
                        <span className="text-3xl sm:text-base leading-none mb-1 sm:mb-0">→</span>
                    </button>
                </div>
            </form>
        </div>
    );
}