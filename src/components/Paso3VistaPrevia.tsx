// src/components/Paso3VistaPrevia.tsx
import React from "react";
import { IconCheck, IconX, IconArrowLeft, IconPrinter } from "@tabler/icons-react";

export default function Paso3VistaPrevia({ setPaso, veredicto, setVeredicto, textoResolucion, setTextoResolucion, formulario, considerandosSeleccionados }: any) {

    // Mudamos la función de PDF aquí porque solo se usa en el Paso 3
    const generarPDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const elemento = document.getElementById('documento-pdf') as HTMLElement;
        const opciones: any = {
            margin: 0,
            filename: `Resolucion_PRESAV_${formulario.correlativo}_${formulario.cedula}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css', before: '.salto-pagina' }
        };
        html2pdf().set(opciones).from(elemento).save();
    };

    const EncabezadoDocumento = () => (
        <div className="flex justify-between items-center mb-8 border-b-2 pb-4" style={{ borderColor: '#000000' }}>
            <div className="shrink-0 w-48 flex justify-start"><img src="/logo-unellez.png" alt="Logo UNELLEZ" className="h-24 w-auto object-contain" /></div>
            <div className="text-center font-bold leading-tight flex-1 px-4 text-[15px]" style={{ color: '#000000' }}>
                <p>UNIVERSIDAD NACIONAL EXPERIMENTAL</p><p>DE LOS LLANOS OCCIDENTALES</p><p>"EZEQUIEL ZAMORA"</p><p>UNELLEZ VIPI COJEDES</p>
            </div>
            <div className="shrink-0 w-48 flex justify-end"><img src="/logo-presav.png" alt="Logo PRESAV" className="h-24 w-auto object-contain" /></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-start max-w-4xl mx-auto w-full">
                <button onClick={() => setPaso(2)} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2">
                    <IconArrowLeft size={20} /> Volver a editar Considerandos
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto w-full">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Decisión de la Comisión</h2>
                <div className="mb-6">
                    <label className="block font-medium text-gray-700 mb-3 text-sm">Veredicto Final:</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setVeredicto("Aprobado")}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all flex justify-center items-center gap-2 ${veredicto === "Aprobado" ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                        >
                            <IconCheck size={20} /> APROBAR Solicitud
                        </button>
                        <button
                            onClick={() => setVeredicto("Negado")}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all flex justify-center items-center gap-2 ${veredicto === "Negado" ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                        >
                            <IconX size={20} /> NEGAR Solicitud
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm">Redacción de la Resolución:</label>
                    <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 bg-white overflow-hidden shadow-sm transition-all">
                        <div className="py-4 px-5 bg-gray-50 border-r border-gray-200 font-bold text-gray-800 shrink-0 select-none flex items-center">
                            ÚNICO: {veredicto ? (veredicto === "Aprobado" ? "APROBAR" : "NEGAR") : "[SELECCIONE VEREDICTO]"}
                        </div>
                        <textarea
                            rows={4}
                            value={textoResolucion}
                            onChange={(e) => setTextoResolucion(e.target.value)}
                            className="w-full p-4 text-gray-900 font-medium text-sm outline-none resize-y"
                            placeholder="la solicitud de REINGRESO EN FORMA EXCEPCIONAL..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-200 p-8 rounded-xl flex flex-col items-center overflow-x-auto shadow-inner border border-gray-300">
                <div id="documento-pdf" className="flex flex-col">
                    {/* HOJA 1 */}
                    <div className="bg-white text-black w-[21cm] min-h-[29.7cm] shadow-xl p-16 font-serif text-sm flex flex-col mb-4" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        <div className="flex-1">
                            <EncabezadoDocumento />
                            <div className="text-center font-bold mb-6 text-[15px]" style={{ color: '#000000' }}>
                                <p>COMISIÓN ASESORA DEL PROGRAMA ESTUDIOS AVANZADOS</p>
                                <p>RESOLUCIÓN {formulario.tipoResolucion} CAPRESA Nº{formulario.ano}/{formulario.correlativo || "[NUMERO]"}</p>
                            </div>
                            <div className="mb-4 text-justify" style={{ color: '#000000' }}>
                                <p><span className="font-bold">UNIDAD EJECUTORA:</span> SUBPROGRAMA CIENCIAS DE LA EDUCACIÓN Y HUMANIDADES</p>
                            </div>
                            <div className="mb-4 text-justify" style={{ color: '#000000' }}>
                                <p><span className="font-bold">PLANTEAMIENTO:</span> Solicitud de REINGRESO EN FORMA EXCEPCIONAL, a fin de proseguir estudios en el Programa de Estudios Avanzados en la {formulario.programa || "[MAESTRÍA]"}, para el período académico [PERIODO_ACADEMICO], sede San Carlos, por parte de la ciudadana: {formulario.nombre.toUpperCase() || "[NOMBRE]"}, titular de la cédula de identidad Nº {formulario.nacionalidad}-{formulario.cedula || "[CEDULA]"}. La solicitud la realiza la Dra. Carmen R. Pinto V., Jefa del Programa de Estudios Avanzados Cojedes.</p>
                            </div>
                            <div className="mb-6 font-bold flex justify-center gap-8" style={{ color: '#000000' }}>
                                <p>FECHA: {new Date().toLocaleDateString('es-VE')}</p>
                                <p>ACTA Nº: {formulario.acta || "[ACTA]"} {formulario.tipoResolucion}</p>
                                <p>PUNTO: {formulario.punto || "[PUNTO]"}</p>
                            </div>
                            <div className="mb-4" style={{ color: '#000000' }}>
                                <p>Luego de leída y discutida la documentación correspondiente por parte de los Consejeros:</p>
                            </div>
                            {considerandosSeleccionados.map((item: any, index: number) => (
                                <div key={index} className="mb-4 text-justify" style={{ color: '#000000' }}>
                                    <p className="font-bold text-center mb-1">CONSIDERANDO</p>
                                    <p>{item.texto}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HOJA 2 */}
                    <div className="salto-pagina bg-white text-black w-[21cm] min-h-[29.7cm] shadow-xl p-16 font-serif text-sm flex flex-col" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        <div className="flex-1">
                            <EncabezadoDocumento />
                            <div className="text-center font-bold mb-8" style={{ color: '#000000' }}>
                                <p>LA COMISIÓN ASESORA RESUELVE:</p>
                            </div>
                            <div className="text-justify mb-8" style={{ color: '#000000' }}>
                                <p><span className="font-bold">ÚNICO: {veredicto ? (veredicto === "Aprobado" ? "APROBAR" : "NEGAR") : "[VEREDICTO]"}</span> {textoResolucion || "[Redacción de la resolución final irá aquí...]"}</p>
                            </div>
                            <div className="text-justify" style={{ color: '#000000' }}>
                                <p>Notifíquese a la parte interesada. La documentación digitalizada se archiva. Cúmplase.</p>
                                <p className="mt-4">Firmado y sellado en la sede del Programa de Estudios Avanzados (PRESAV), del Vicerrectorado de Infraestructura y Procesos Industriales (VIPI), de la UNELLEZ, ubicado en la ciudad de San Carlos, capital del estado Cojedes, a los {new Date().getDate()} días del mes de {new Date().toLocaleString('es-VE', { month: 'long' })} del {new Date().getFullYear()}.</p>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-between mb-12 text-center font-bold" style={{ color: '#000000' }}>
                                <div className="w-1/2">
                                    <div className="border-t w-3/4 mx-auto pt-2" style={{ borderColor: '#000000' }}>
                                        <p>Dr. Reynaldo Mujica</p><p>Presidente</p>
                                    </div>
                                </div>
                                <div className="w-1/2">
                                    <div className="border-t w-3/4 mx-auto pt-2" style={{ borderColor: '#000000' }}>
                                        <p>Dra. Carmen Pinto</p><p>Secretaria</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-4 max-w-4xl mx-auto w-full">
                <button onClick={() => setPaso(2)} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2">
                    <IconArrowLeft size={20} /> Volver a Considerandos
                </button>
                <button
                    onClick={generarPDF}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-base shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                    <IconPrinter size={20} /> Generar Resolución (PDF)
                </button>
            </div>
        </div>
    );
}