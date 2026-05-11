// src/components/Paso2Considerandos.tsx
import React from "react";
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
    IconMinus
} from "@tabler/icons-react"; // <-- IMPORTAMOS LOS ICONOS

export default function Paso2Considerandos({ busqueda, setBusqueda, cargandoConsiderandos, considerandosBD, considerandosSeleccionados, toggleConsiderando, quitarConsiderando, actualizarTextoConsiderando, setPaso, formulario, setTextoResolucion }: any) {
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* LADO IZQUIERDO: Biblioteca */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-sm p-6 border border-gray-200 flex flex-col">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <IconBooks className="text-blue-600" size={24} /> Biblioteca de Reglamentos
                </h2>

                {/* Buscador con icono integrado */}
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

            {/* LADO DERECHO: Selección EDITABLE */}
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
                        considerandosSeleccionados.map((item: any, index: number) => (
                            <div key={item.id} className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm relative group">
                                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                                    <h3 className="font-bold text-gray-800">{index + 1}. {item.titulo}</h3>
                                    <button onClick={() => quitarConsiderando(item.id)} className="text-red-500 hover:text-red-700 text-xs font-bold shrink-0 transition-colors ml-4 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                        <IconX stroke={3} size={14} /> Quitar
                                    </button>
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={item.texto}
                                        onChange={(e) => actualizarTextoConsiderando(item.id, e.target.value)}
                                        className="w-full text-sm text-gray-900 font-medium text-justify leading-relaxed p-3 border border-yellow-300 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-35 resize-y"
                                    />
                                    <span className="absolute bottom-2 right-2 text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded shadow-sm opacity-80 pointer-events-none flex items-center gap-1">
                                        <IconPencil size={12} /> Editable
                                    </span>
                                </div>
                            </div>
                        ))
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