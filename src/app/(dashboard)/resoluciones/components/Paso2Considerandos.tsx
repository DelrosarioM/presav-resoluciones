// src/components/Paso2Considerandos.tsx
import React, { useState } from "react";
import {
    IconBooks,
    IconSearch,
    IconFileText,
    IconFiles,
    IconX,
    IconPencil,
    IconArrowLeft,
    IconArrowRight,
    IconPlus,
    IconMinus,
    IconWand,
    IconLock,
    IconLockOpen
} from "@tabler/icons-react";

import { useResoluciones } from "../context/ResolucionesContext";

export default function Paso2Considerandos() {
    const { busqueda, setBusqueda, cargandoConsiderandos, considerandosBD, considerandosSeleccionados, toggleConsiderando, quitarConsiderando, actualizarTextoConsiderando, setPaso, setTextoResolucion } = useResoluciones();

    // ESTADOS INTELIGENTES:
    // 1. Guardamos los valores que el usuario escribe en las cajitas de las variables
    const [valoresVariables, setValoresVariables] = useState<Record<number, Record<string, string>>>({});
    // 2. Guardamos qué considerandos el usuario decidió "desbloquear" para edición manual
    const [desbloqueados, setDesbloqueados] = useState<Record<number, boolean>>({});

    // Función que se ejecuta cada vez que el usuario escribe en una cajita de variable
    const manejarCambioVariable = (idConsiderando: number, plantilla: string, variable: string, nuevoValor: string, todasLasVariables: string[]) => {
        // Guardamos el valor en nuestro estado local
        const nuevosValores = {
            ...(valoresVariables[idConsiderando] || {}),
            [variable]: nuevoValor
        };
        setValoresVariables({ ...valoresVariables, [idConsiderando]: nuevosValores });

        // Reconstruimos el texto completo desde la plantilla original
        let textoFinal = plantilla;
        todasLasVariables.forEach(v => {
            const valorIngresado = nuevosValores[v];
            // Si el usuario escribió algo, lo reemplazamos envuelto en <b>. Si no, dejamos el corchete original [VARIABLE]
            textoFinal = textoFinal.split(v).join(valorIngresado ? `<b>${valorIngresado}</b>` : v);
        });

        // Enviamos el texto armado al estado general de la aplicación
        actualizarTextoConsiderando(idConsiderando, textoFinal);
    };

    const toggleDesbloqueo = (id: number) => {
        setDesbloqueados({ ...desbloqueados, [id]: !desbloqueados[id] });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* LADO IZQUIERDO: Biblioteca */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-sm p-6 border border-gray-200 flex flex-col">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <IconBooks className="text-blue-600" size={24} /> Biblioteca de Reglamentos
                </h2>

                <div className="relative mb-4 flex items-center rounded-xl border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
                    <div className="pl-4 text-gray-400 flex items-center justify-center">
                        <IconSearch size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por palabra clave..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full p-4 pl-3 bg-transparent text-gray-900 font-medium placeholder-gray-400 outline-none"
                    />
                </div>

                <div className="space-y-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {cargandoConsiderandos ? (
                        <div className="text-center p-8 text-gray-500 font-medium animate-pulse">Cargando considerandos...</div>
                    ) : considerandosBD.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 italic">No hay considerandos registrados.</div>
                    ) : (
                        considerandosBD.filter((item: any) => item.titulo.toLowerCase().includes(busqueda.toLowerCase()) || item.texto_plantilla.toLowerCase().includes(busqueda.toLowerCase())).map((item: any) => {
                            const estaSeleccionado = considerandosSeleccionados.some((c: any) => c.id === item.id);
                            return (
                                <div key={item.id} className={`border p-4 rounded-xl flex gap-4 transition-all duration-300 ${estaSeleccionado ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-white hover:border-gray-400 shadow-sm'}`}>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-blue-900 mb-2">{item.titulo}</h3>
                                        <p className="text-sm text-gray-700 text-justify leading-relaxed">{item.texto_plantilla}</p>
                                    </div>
                                    <div className="flex items-start">
                                        <button onClick={() => toggleConsiderando(item)} className={`h-12 w-12 flex items-center justify-center rounded-xl transition-colors shadow-sm ${estaSeleccionado ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'}`}>
                                            {estaSeleccionado ? <IconMinus stroke={3} size={24} /> : <IconPlus stroke={3} size={24} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* LADO DERECHO: Selección EDITABLE (Ahora con Inteligencia) */}
            <div className="w-full lg:w-1/2 bg-blue-50 rounded-2xl shadow-sm p-6 flex flex-col border border-blue-200">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><IconFileText size={24} /> Considerandos a Editar</span>
                    <span className="bg-blue-200 text-blue-800 text-sm py-1 px-3 rounded-full font-bold">{considerandosSeleccionados.length}</span>
                </h2>

                <div className="flex-1 space-y-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                    {considerandosSeleccionados.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 italic text-center">
                            <IconFiles size={56} className="mb-3 opacity-40" />
                            <p>Aún no has seleccionado ningún considerando.</p>
                        </div>
                    ) : (
                        considerandosSeleccionados.map((item: any, index: number) => {
                            // 1. Extraemos las variables (todo lo que esté entre corchetes, ej: [MATERIA])
                            const coincidencias = item.texto_plantilla ? item.texto_plantilla.match(/\[(.*?)\]/g) : null;
                            const variablesUnicas = coincidencias ? Array.from(new Set(coincidencias)) as string[] : [];

                            // 2. Determinamos si este considerando debe comportarse como manual o automático
                            // Por defecto se bloquea solo si tiene variables y el usuario no le ha dado al candado
                            const estaBloqueado = variablesUnicas.length > 0 && !desbloqueados[item.id];

                            return (
                                <div key={item.id} className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm relative group">
                                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                                        <h3 className="font-bold text-gray-800 flex-1 pr-2 leading-tight">{index + 1}. {item.titulo}</h3>

                                        <div className="flex gap-2 shrink-0">
                                            {/* Botón de Candado (Solo aparece si hay variables detectadas) */}
                                            {variablesUnicas.length > 0 && (
                                                <button
                                                    onClick={() => toggleDesbloqueo(item.id)}
                                                    title={estaBloqueado ? "Desbloquear para edición manual" : "Volver al autocompletado"}
                                                    className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${estaBloqueado ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                                                >
                                                    {estaBloqueado ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                                                </button>
                                            )}
                                            {/* Botón de Quitar */}
                                            <button onClick={() => quitarConsiderando(item.id)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                <IconX stroke={3} size={14} /> Quitar
                                            </button>
                                        </div>
                                    </div>

                                    {/* SECCIÓN INTELIGENTE: Inputs generados automáticamente */}
                                    {estaBloqueado && variablesUnicas.length > 0 && (
                                        <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-1">
                                                <IconWand size={14} /> Completa los datos requeridos:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {variablesUnicas.map((variable: string) => (
                                                    <div key={variable} className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{variable.replace(/\[|\]/g, '')}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`Ej. Escriba aquí`}
                                                            value={valoresVariables[item.id]?.[variable] || ''}
                                                            onChange={(e) => manejarCambioVariable(item.id, item.texto_plantilla, variable, e.target.value, variablesUnicas)}
                                                            className="p-2.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white shadow-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ÁREA DE TEXTO LEGAL */}
                                    <div className="relative">
                                        {estaBloqueado ? (
                                            <div
                                                className="w-full text-sm font-medium text-justify leading-relaxed p-3 rounded-lg outline-none min-h-35 transition-colors border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed overflow-y-auto"
                                                dangerouslySetInnerHTML={{ __html: item.texto.replace(/\n/g, '<br/>') }}
                                            />
                                        ) : (
                                            <textarea
                                                value={item.texto.replace(/<\/?b>/g, '')}
                                                onChange={(e) => actualizarTextoConsiderando(item.id, e.target.value)}
                                                className="w-full text-sm font-medium text-justify leading-relaxed p-3 rounded-lg outline-none min-h-35 resize-y transition-colors border border-yellow-300 bg-yellow-50 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                        <span className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-1 rounded shadow-sm pointer-events-none flex items-center gap-1 ${estaBloqueado ? 'bg-gray-200 text-gray-500' : 'bg-white text-yellow-600 opacity-80'}`}>
                                            {estaBloqueado ? <><IconLock size={12} /> Autogenerado</> : <><IconPencil size={12} /> Libre</>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-blue-200 pt-6">
                    <button onClick={() => setPaso(1)} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2">
                        <IconArrowLeft size={20} /> Volver al Paso 1
                    </button>
                    <button disabled={considerandosSeleccionados.length === 0} onClick={() => { setTextoResolucion(""); setPaso(3); }} className={`font-bold py-3 px-8 rounded-xl text-white text-base transition-all shadow-sm flex items-center gap-2 ${considerandosSeleccionados.length > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed opacity-70'}`}>
                        Paso 3: Vista Previa <IconArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}