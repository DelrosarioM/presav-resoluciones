import React from "react";
import { IconCheck, IconX, IconArrowLeft, IconFileWord, IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconClock, IconArrowUp } from "@tabler/icons-react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { supabase } from "@/lib/supabase";

import { useResoluciones } from "../context/ResolucionesContext";

export default function Paso3VistaPrevia() {
    const { setPaso, veredicto, setVeredicto, textoResolucion, setTextoResolucion, formulario, considerandosSeleccionados, idEdicion } = useResoluciones();

    const formatearFecha = (fechaISO: string) => {
        if (!fechaISO) return "[FECHA]";
        const [año, mes, dia] = fechaISO.split('-');
        return `${dia}/${mes}/${año}`;
    };

    const unidadEjecutoraDinamica = formulario.unidadEjecutora || "SUBPROGRAMA CIENCIAS DE LA EDUCACIÓN Y HUMANIDADES";

    const generarWord = async () => {
        if (!veredicto) {
            alert("Por favor, seleccione un veredicto antes de generar el documento.");
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            let creadoPorId = null;

            if (session?.user?.email) {
                const cedulaFormateada = session.user.email.split('@')[0].toUpperCase();
                const { data: userData } = await supabase.from('Usuario').select('id').eq('cedula', cedulaFormateada).single();
                if (userData) creadoPorId = userData.id;
            }

            const tipoResolucionFormateado = formulario.tipoResolucion.toLowerCase();

            const veredictoMapper: Record<string, string> = {
                "Aprobado": "aprobado",
                "Negado": "negado",
                "Diferido": "diferido",
                "Elevado": "elevado"
            };
            const veredictoFormateado = veredictoMapper[veredicto] || "diferido";

            // OBJETO DE DATOS UNIFICADO CON LOS NUEVOS CAMPOS
            const payloadResolucion = {
                tipo_resolucion: tipoResolucionFormateado,
                anio: parseInt(formulario.ano),
                correlativo: parseInt(formulario.correlativo),
                autoridad_solicitante: formulario.nombre,
                fecha_comision: formulario.fechaComision,
                acta_numero: formulario.acta,
                punto_numero: formulario.punto,
                tipo_solicitud: formulario.planteamiento,
                veredicto: veredictoFormateado,
                texto_unico: textoResolucion,
                profesor_autor_id: creadoPorId,
                unidad_ejecutora: formulario.unidadEjecutora,

                // --- ¡AQUÍ ESTÁN LOS CAMPOS NUEVOS QUE FALTABAN! ---
                nacionalidad_solicitante: formulario.nacionalidad,
                cedula_solicitante: formulario.cedula,
                programa_academico: formulario.programa,
                sede: formulario.sede,
                considerandos_guardados: considerandosSeleccionados
            };

            // LÓGICA DE DECISIÓN DINÁMICA: ¿Es edición o creación nueva?
            if (idEdicion) {
                // EDICIÓN PROTÉGIDA
                const { error: updateError } = await supabase
                    .from('Resoluciones')
                    .update(payloadResolucion)
                    .eq('id', idEdicion);

                if (updateError) throw updateError;
                console.log("Resolución existente actualizada con éxito en la base de datos.");
            } else {
                // CREACIÓN TRADICIONAL
                const { error: insertError } = await supabase
                    .from('Resoluciones')
                    .insert(payloadResolucion);

                if (insertError) throw insertError;
                console.log("Nueva resolución registrada con éxito en la base de datos.");
            }

            // Generación del Archivo Word
            const response = await fetch('/plantilla_resolucion.docx');
            if (!response.ok) throw new Error("No se pudo cargar la plantilla base.");
            const arrayBuffer = await response.arrayBuffer();

            const zip = new PizZip(arrayBuffer);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const considerandosFormateados = considerandosSeleccionados.map((item: any) => ({
                texto: item.texto.replace(/<[^>]*>?/gm, '')
            }));

            doc.render({
                tipo_resolucion: formulario.tipoResolucion === "EXTRAORDINARIA" ? "EXTRAORDINARIA" : "ORDINARIA",
                anio: formulario.ano || new Date().getFullYear(),
                correlativo: formulario.correlativo || "[NUMERO]",
                unidad_ejecutora: formulario.unidadEjecutora,
                planteamiento: formulario.planteamiento || "[PLANTEAMIENTO]",
                fecha: formatearFecha(formulario.fechaComision),
                acta: formulario.acta || "[ACTA]",
                punto: formulario.punto || "[PUNTO]",
                considerandos: considerandosFormateados,
                veredicto: veredicto === "Aprobado" ? "APROBAR" : veredicto === "Negado" ? "NEGAR" : veredicto === "Diferido" ? "DIFERIR" : "CONSEJO DIRECTIVO (ELEVADO)",
                texto_resolucion: textoResolucion || "[Redacción de la resolución final]",
                presidente: "Dr. Reynaldo Mujica",
                secretaria: "Dra. Carmen Pinto"
            });

            const blob = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            saveAs(blob, `Resolucion_PRESAV_${formulario.correlativo || "Borrador"}.docx`);

        } catch (error) {
            console.error("Error procesando el documento:", error);
            alert("Ocurrió un error al guardar o descargar el documento.");
        }
    };

    const EncabezadoDocumento = () => (
        <div className="flex justify-between items-center mb-6 sm:mb-8 border-b-2 pb-4 gap-2 sm:gap-0" style={{ borderColor: '#000000' }}>
            <div className="shrink-0 w-16 sm:w-48 flex justify-start"><img src="/logo-unellez.png" alt="Logo UNELLEZ" className="h-12 sm:h-24 w-auto object-contain" /></div>
            <div className="text-center font-bold leading-tight flex-1 px-1 sm:px-4 text-[8px] sm:text-[15px]" style={{ color: '#000000' }}>
                <p>UNIVERSIDAD NACIONAL EXPERIMENTAL</p><p>DE LOS LLANOS OCCIDENTALES</p><p>"EZEQUIEL ZAMORA"</p><p>UNELLEZ VIPI COJEDES</p>
            </div>
            <div className="shrink-0 w-16 sm:w-48 flex justify-end"><img src="/logo-presav.png" alt="Logo PRESAV" className="h-12 sm:h-24 w-auto object-contain" /></div>
        </div>
    );

    const PieDePaginaDocumento = () => (
        <div className="mt-auto pt-6 text-center text-[9px] sm:text-[11px] leading-tight w-full" style={{ color: '#000000' }}>
            <p className="font-bold text-[10px] sm:text-[13px] mb-2" style={{ color: '#d92718' }}>
                La ciencia y la tecnología al servicio de la liberación permanente de la humanización del hombre"
            </p>
            <p>Dirección: Urb. Cantaclaro final avenida Principal, San Carlos Edo. Cojedes</p>
            <p>Teléfono: (0258) 4331718. / Correo electrónico: <span className="text-blue-600 underline break-all">estudiosavanzadoscojedes@gmail.com</span></p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-8 mt-3 font-bold text-black text-[10px] sm:text-[12px]">
                <span className="flex items-center gap-1.5"><div className="bg-blue-400 text-white rounded p-0.5"><IconBrandFacebook size={12} className="sm:w-[14px] sm:h-[14px]" /></div> Presav.vipi</span>
                <span className="flex items-center gap-1.5"><div className="bg-blue-400 text-white rounded p-0.5"><IconBrandTwitter size={12} className="sm:w-[14px] sm:h-[14px]" /></div> Presav_vipi</span>
                <span className="flex items-center gap-1.5"><div className="bg-blue-400 text-white rounded p-0.5"><IconBrandInstagram size={12} className="sm:w-[14px] sm:h-[14px]" /></div> Presav_vipi</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-start max-w-4xl mx-auto w-full px-2 sm:px-0">
                <button onClick={() => setPaso(2)} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2">
                    <IconArrowLeft size={20} /> Volver a editar Considerandos
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8 max-w-4xl mx-auto w-full">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 border-b border-gray-100 pb-3">Decisión de la Comisión</h2>
                <div className="mb-6">
                    <label className="block font-medium text-gray-700 mb-3 text-sm">Veredicto Final:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <button
                            onClick={() => setVeredicto("Aprobado")}
                            className={`py-3 rounded-xl font-bold text-sm border transition-all flex justify-center items-center gap-2 ${veredicto === "Aprobado" ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                        >
                            <IconCheck size={20} /> APROBAR
                        </button>
                        <button
                            onClick={() => setVeredicto("Negado")}
                            className={`py-3 rounded-xl font-bold text-sm border transition-all flex justify-center items-center gap-2 ${veredicto === "Negado" ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                        >
                            <IconX size={20} /> NEGAR
                        </button>
                        <button
                            onClick={() => setVeredicto("Diferido")}
                            className={`py-3 rounded-xl font-bold text-sm border transition-all flex justify-center items-center gap-2 ${veredicto === "Diferido" ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                        >
                            <IconClock size={20} /> DIFERIR
                        </button>
                        <button
                            onClick={() => setVeredicto("Elevado")}
                            className={`py-3 rounded-xl font-bold text-sm border transition-all flex justify-center items-center gap-2 ${veredicto === "Elevado" ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                        >
                            <IconArrowUp size={20} /> ELEVAR
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm">Redacción de la Resolución:</label>
                    <div className="flex flex-col sm:flex-row rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 bg-white overflow-hidden shadow-sm transition-all">
                        <div className="py-3 sm:py-4 px-4 sm:px-5 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 font-bold text-gray-800 shrink-0 select-none flex items-center justify-center sm:justify-start w-full sm:w-auto">
                            ÚNICO: {veredicto ? (veredicto === "Aprobado" ? "APROBAR" : veredicto === "Negado" ? "NEGAR" : veredicto === "Diferido" ? "DIFERIR" : "ELEVAR") : "[SELECCIONE VEREDICTO]"}
                        </div>
                        <textarea
                            rows={4}
                            value={textoResolucion}
                            onChange={(e) => setTextoResolucion(e.target.value)}
                            className="w-full p-3 sm:p-4 text-gray-900 font-medium text-sm outline-none resize-y"
                            placeholder="Redacte la resolución final aquí..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-200 p-3 sm:p-8 rounded-xl flex flex-col items-center shadow-inner border border-gray-300 w-full">
                <div id="documento-pdf" className="flex flex-col w-full max-w-[21cm] gap-6">
                    <div className="bg-white text-black w-full min-h-[100vh] sm:min-h-[29.7cm] shadow-xl p-6 sm:p-16 font-serif text-xs sm:text-sm flex flex-col" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        <div className="flex-1">
                            <EncabezadoDocumento />
                            <div className="text-center font-bold mb-6 text-[12px] sm:text-[15px]" style={{ color: '#000000' }}>
                                <p>COMISIÓN ASESORA DEL PROGRAMA ESTUDIOS AVANZADOS</p>
                                <p>RESOLUCIÓN {formulario.tipoResolucion} CAPRESAV Nº{formulario.ano}/{formulario.correlativo || "[NUMERO]"}</p>
                            </div>
                            <div className="mb-4 text-justify" style={{ color: '#000000', lineHeight: '1.5' }}>
                                <p><span className="font-bold">UNIDAD EJECUTORA:</span> {unidadEjecutoraDinamica}</p>
                            </div>
                            <div className="mb-4 text-justify" style={{ color: '#000000', lineHeight: '1.5' }}>
                                <p><span className="font-bold">PLANTEAMIENTO:</span> {formulario.planteamiento || "[PLANTEAMIENTO DEL CASO]"}</p>
                            </div>
                            <div className="mb-6 font-bold flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-8" style={{ color: '#000000' }}>
                                <p>FECHA: {formatearFecha(formulario.fechaComision)}</p>
                                <p>ACTA Nº: {formulario.acta || "[ACTA]"} {formulario.tipoResolucion}</p>
                                <p>PUNTO: {formulario.punto || "[PUNTO]"}</p>
                            </div>
                            <div className="mb-4" style={{ color: '#000000' }}>
                                <p>Luego de leída y discutida la documentación correspondiente por parte de los Consejeros:</p>
                            </div>
                            {considerandosSeleccionados.map((item: any, index: number) => (
                                <div key={index} className="mb-4 text-justify" style={{ color: '#000000' }}>
                                    <p className="font-bold text-center mb-1">CONSIDERANDO</p>
                                    <p dangerouslySetInnerHTML={{ __html: item.texto.replace(/\n/g, '<br/>') }} style={{ lineHeight: '1.5' }}></p>
                                </div>
                            ))}
                        </div>
                        <PieDePaginaDocumento />
                    </div>

                    <div className="bg-white text-black w-full min-h-[100vh] sm:min-h-[29.7cm] shadow-xl p-6 sm:p-16 font-serif text-xs sm:text-sm flex flex-col" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        <div className="flex-1">
                            <EncabezadoDocumento />
                            <div className="text-center font-bold mb-6 sm:mb-8 text-[12px] sm:text-[15px]" style={{ color: '#000000' }}>
                                <p>LA COMISIÓN ASESORA RESUELVE:</p>
                            </div>
                            <div className="text-justify mb-6 sm:mb-8" style={{ color: '#000000', lineHeight: '1.5' }}>
                                <p><span className="font-bold">ÚNICO: {veredicto ? (veredicto === "Aprobado" ? "APROBAR" : veredicto === "Negado" ? "NEGAR" : veredicto === "Diferido" ? "DIFERIR" : "ELEVAR") : "[VEREDICTO]"}</span> {textoResolucion || "[Redacción de la resolución final irá aquí...]"}</p>
                            </div>
                            <div className="text-justify" style={{ color: '#000000', lineHeight: '1.5' }}>
                                <p>Notifíquese a la parte interesada. La documentación digitalizada se archiva. Cúmplase.</p>
                                <p className="mt-4">Firmado y sellado en la sede del Programa de Estudios Avanzados (PRESAV), del Vicerrectorado de Infraestructura y Procesos Industriales (VIPI), de la UNELLEZ, ubicado en la ciudad de San Carlos, capital del estado Cojedes, a los {new Date().getDate()} días del mes de {new Date().toLocaleString('es-VE', { month: 'long' })} del {new Date().getFullYear()}.</p>
                            </div>
                        </div>
                        <div className="mt-8 mb-auto">
                            <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-0 mb-8 sm:mb-12 text-center font-bold" style={{ color: '#000000' }}>
                                <div className="w-full sm:w-1/2">
                                    <div className="border-t w-3/4 mx-auto pt-2" style={{ borderColor: '#000000' }}>
                                        <p>Dr. Reynaldo Mujica</p><p>Presidente</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <div className="border-t w-3/4 mx-auto pt-2" style={{ borderColor: '#000000' }}>
                                        <p>Dra. Carmen Pinto</p><p>Secretaria</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <PieDePaginaDocumento />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-4 max-w-4xl mx-auto w-full gap-4 px-2 sm:px-0">
                <button onClick={() => setPaso(2)} className="w-full sm:w-auto justify-center text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2 py-2">
                    <IconArrowLeft size={20} /> Volver a Considerandos
                </button>
                <button
                    onClick={generarWord}
                    className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-base shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                    <IconFileWord size={20} /> {idEdicion ? "Guardar Edición y Descargar" : "Generar Resolución (Word)"}
                </button>
            </div>
        </div>
    );
}