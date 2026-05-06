// src/components/Paso1Formulario.tsx
import React from "react";
import { IconFileDescription, IconUser, IconArrowRight } from "@tabler/icons-react"; // <-- IMPORTAMOS LOS ICONOS

export default function Paso1Formulario({ formulario, errores, manejarCambio, validarYContinuar }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10 max-w-4xl mx-auto">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()} autoComplete="off">
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-6 flex items-center gap-2">
                        <IconFileDescription className="text-blue-600" size={24} /> Datos del Documento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-medium text-gray-700">Tipo de Resolución *</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-2 cursor-pointer p-4 border rounded-xl flex-1 transition-colors ${formulario.tipoResolucion === 'ORDINARIA' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                                    <input type="radio" name="tipoResolucion" value="ORDINARIA" checked={formulario.tipoResolucion === 'ORDINARIA'} onChange={manejarCambio} className="w-5 h-5 text-blue-600" />
                                    <span className="text-lg font-bold">ORDINARIA</span>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer p-4 border rounded-xl flex-1 transition-colors ${formulario.tipoResolucion === 'EXTRAORDINARIA' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                                    <input type="radio" name="tipoResolucion" value="EXTRAORDINARIA" checked={formulario.tipoResolucion === 'EXTRAORDINARIA'} onChange={manejarCambio} className="w-5 h-5 text-blue-600" />
                                    <span className="text-lg font-bold">EXTRAORDINARIA</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700">Identificador de Resolución *</label>
                            <div className={`flex items-center rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white ${errores.correlativo ? 'border-red-500' : 'border-gray-300'}`}>
                                <span className="bg-gray-100 p-4 text-gray-600 font-bold border-r border-gray-300">CAPRESA Nº</span>
                                <input type="text" name="ano" value={formulario.ano} onChange={manejarCambio} className="w-20 p-4 text-center focus:outline-none text-lg bg-gray-50 text-gray-900 font-bold" maxLength={4} readOnly title="El año se genera automáticamente" />
                                <span className="text-gray-400 text-xl font-light">/</span>
                                <input type="text" name="correlativo" value={formulario.correlativo} onChange={manejarCambio} placeholder="0231" className="flex-1 p-4 focus:outline-none text-lg text-gray-900 font-medium placeholder-gray-400" maxLength={4} />
                            </div>
                            {errores.correlativo && <span className="text-red-500 text-sm font-bold">{errores.correlativo}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700">Acta Nº y Punto *</label>
                            <div className="flex gap-2">
                                <div className="w-1/2 flex flex-col">
                                    <input type="text" name="acta" value={formulario.acta} onChange={manejarCambio} placeholder="Acta (Ej. 113)" className={`p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-lg text-gray-900 font-medium placeholder-gray-400 focus:outline-none ${errores.acta ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errores.acta && <span className="text-red-500 text-sm font-bold mt-1">{errores.acta}</span>}
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <input type="text" name="punto" value={formulario.punto} onChange={manejarCambio} placeholder="Punto (Ej. 50)" className={`p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-lg text-gray-900 font-medium placeholder-gray-400 focus:outline-none ${errores.punto ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errores.punto && <span className="text-red-500 text-sm font-bold mt-1">{errores.punto}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-6 flex items-center gap-2">
                        <IconUser className="text-blue-600" size={24} /> Datos del Solicitante
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700">Cédula de Identidad *</label>
                            <div className={`flex items-center rounded-xl border overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 ${errores.cedula ? 'border-red-500' : 'border-gray-300'}`}>
                                <select name="nacionalidad" value={formulario.nacionalidad} onChange={manejarCambio} className="bg-gray-100 p-4 text-gray-900 font-bold border-r border-gray-300 focus:outline-none cursor-pointer">
                                    <option value="V">V-</option>
                                    <option value="E">E-</option>
                                </select>
                                <input type="text" name="cedula" value={formulario.cedula} onChange={manejarCambio} placeholder="16425388" className="flex-1 p-4 focus:outline-none text-lg text-gray-900 font-medium placeholder-gray-400" maxLength={9} />
                            </div>
                            {errores.cedula && <span className="text-red-500 text-sm font-bold">{errores.cedula}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700">Nombre Completo *</label>
                            <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} placeholder="Ej. Yailmar Galindez" className={`p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-lg text-gray-900 font-medium placeholder-gray-400 ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`} />
                            {errores.nombre && <span className="text-red-500 text-sm font-bold">{errores.nombre}</span>}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-medium text-gray-700">Programa / Maestría *</label>
                            <select name="programa" value={formulario.programa} onChange={manejarCambio} className={`p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 text-lg bg-white text-gray-900 font-medium ${errores.programa ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="" className="text-gray-400">Seleccione un programa...</option>
                                <option value="Maestría en Educación mención Docencia Universitaria">Maestría en Educación mención Docencia Universitaria</option>
                                <option value="Maestría en Gerencia Pública">Maestría en Gerencia Pública</option>
                            </select>
                            {errores.programa && <span className="text-red-500 text-sm font-bold">{errores.programa}</span>}
                        </div>
                    </div>
                </section>

                <div className="pt-6 flex justify-end border-t border-gray-200 mt-8">
                    <button type="button" onClick={validarYContinuar} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-base transition-colors shadow-sm flex items-center gap-2">
                        Siguiente: Seleccionar Considerandos <IconArrowRight size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}