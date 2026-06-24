"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { IconEdit, IconTrash, IconUser, IconCalendar, IconUserEdit, IconDownload } from "@tabler/icons-react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export default function HistorialResolucionesPage() {
    const [resoluciones, setResoluciones] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [rolUsuario, setRolUsuario] = useState("");
    const router = useRouter();

    useEffect(() => {
        obtenerHistorial();
    }, []);

    const obtenerHistorial = async () => {
        try {
            setCargando(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;

            // 1. Extraemos el prefijo del correo y TAMBIÉN solo los números para evitar problemas de formato (V- vs V vs nada)
            const correoPrefijo = session.user.email.split('@')[0].toUpperCase();
            const cedulaNumerica = correoPrefijo.replace(/\D/g, ''); // Saca solo los números puros

            console.log("🕵️‍♀️ [DEBUG] Correo completo:", session.user.email);
            console.log("🕵️‍♀️ [DEBUG] Buscando con Cédula Numérica:", cedulaNumerica);

            // 2. Obtener el rol y datos del usuario logueado
            const { data: userData } = await supabase
                .from('Usuario')
                .select('id, rol')
                .eq('cedula', correoPrefijo)
                .single();

            const rol = userData?.rol || "administrador";
            setRolUsuario(rol);
            console.log("🕵️‍♀️ [DEBUG] Rol detectado:", rol);

            // 3. Definir la consulta base
            let query = supabase
                .from('Resoluciones')
                .select('*, Usuario!fk_profesor_usuario(primer_nombre, primer_apellido)');

            // 4. FILTRADO INTELIGENTE
            if (rol === "profesor" && userData?.id) {
                query = query.eq('profesor_autor_id', userData.id);
            } else if (rol === "estudiante") {

                // Buscamos si existe en la tabla Estudiante
                const { data: estudianteData } = await supabase
                    .from('Estudiante')
                    .select('id')
                    .eq('cedula', correoPrefijo)
                    .single();

                if (estudianteData?.id) {
                    // Búsqueda flexible (ilike) para que encuentre la cédula aunque esté guardada distinto
                    query = query.or(`cedula_solicitante.ilike.%${cedulaNumerica}%,estudiante_id.eq.${estudianteData.id}`);
                } else {
                    // Búsqueda flexible solo por texto
                    query = query.ilike('cedula_solicitante', `%${cedulaNumerica}%`);
                }
            }

            // Ordenar cronológicamente
            const { data: resolucionesData, error: queryError } = await query.order('creado_el', { ascending: false });

            if (queryError) throw queryError;

            console.log("🕵️‍♀️ [DEBUG] Resoluciones encontradas:", resolucionesData?.length);
            setResoluciones(resolucionesData || []);

        } catch (error) {
            console.error("Error cargando el historial de resoluciones:", error);
        } finally {
            setCargando(false);
        }
    };

    const eliminarResolucion = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta resolución permanentemente del historial?")) {
            try {
                const { error } = await supabase.from('Resoluciones').delete().eq('id', id);
                if (error) throw error;
                setResoluciones(resoluciones.filter(res => res.id !== id));
            } catch (error) {
                console.error("Error al eliminar la resolución:", error);
            }
        }
    };

    const descargarResolucion = async (res: any) => {
        try {
            const response = await fetch('/plantilla_resolucion.docx');
            if (!response.ok) throw new Error("No se pudo cargar la plantilla base.");
            const arrayBuffer = await response.arrayBuffer();

            const zip = new PizZip(arrayBuffer);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const formatearFecha = (fechaISO: string) => {
                if (!fechaISO) return "[FECHA]";
                const [año, mes, dia] = fechaISO.split('-');
                return `${dia}/${mes}/${año}`;
            };

            let veredictoFormateado = "RESOLVER";
            if (res.veredicto === "aprobado") veredictoFormateado = "APROBAR";
            else if (res.veredicto === "negado") veredictoFormateado = "NEGAR";
            else if (res.veredicto === "diferido") veredictoFormateado = "DIFERIR";
            else if (res.veredicto === "elevado") veredictoFormateado = "CONSEJO DIRECTIVO (ELEVADO)";

            doc.render({
                tipo_resolucion: res.tipo_resolucion ? res.tipo_resolucion.toUpperCase() : "ORDINARIA",
                anio: res.anio || new Date().getFullYear(),
                correlativo: res.correlativo || "[NUMERO]",
                unidad_ejecutora: res.unidad_ejecutora || "SUBPROGRAMA CIENCIAS DE LA EDUCACIÓN Y HUMANIDADES",
                planteamiento: res.tipo_solicitud || "[PLANTEAMIENTO]",
                fecha: formatearFecha(res.fecha_comision),
                acta: res.acta_numero || "[ACTA]",
                punto: res.punto_numero || "[PUNTO]",
                considerandos: [],
                veredicto: veredictoFormateado,
                texto_resolucion: res.texto_unico || "[Redacción de la resolución final]",
                presidente: "Dr. Reynaldo Mujica",
                secretaria: "Dra. Carmen Pinto"
            });

            const blob = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            saveAs(blob, `Resolucion_PRESAV_${res.correlativo}_Historial.docx`);
        } catch (error) {
            console.error("Error al descargar el documento:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
            <header className="mb-6 md:mb-8 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white tracking-wide mb-2">
                    Historial de Resoluciones
                </h1>
                <p className="text-gray-600 dark:text-blue-100/90 text-xs sm:text-sm">
                    {rolUsuario === "administrador" ? "Visualizando todas las resoluciones del sistema PRESAV." :
                        rolUsuario === "profesor" ? "Visualizando las resoluciones generadas por ti." :
                            "Visualizando tus resoluciones universitarias emitidas asociadas a tu cédula."}
                </p>
            </header>

            {cargando ? (
                <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Cargando historial...</div>
            ) : resoluciones.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 shadow-sm">
                    No hay resoluciones registradas asociadas a tu cuenta.
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                                <tr>
                                    <th className="p-4">Identificador</th>
                                    <th className="p-4">Solicitante</th>
                                    <th className="p-4">Fecha Comisión</th>
                                    <th className="p-4">Generado por</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {resoluciones.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50 transition-colors text-gray-800">
                                        <td className="p-4 font-semibold">
                                            CAPRESAV Nº {res.anio}/{res.correlativo}
                                            <span className="ml-2 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">{res.tipo_resolucion}</span>
                                        </td>
                                        <td className="p-4">{res.autoridad_solicitante || "No especificado"}</td>
                                        <td className="p-4">{res.fecha_comision}</td>
                                        <td className="p-4">{res.Usuario ? `${res.Usuario.primer_nombre} ${res.Usuario.primer_apellido}` : "Sistema"}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button onClick={() => descargarResolucion(res)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Descargar Word"><IconDownload size={18} /></button>

                                            {rolUsuario !== "estudiante" && (
                                                <>
                                                    <button onClick={() => router.push(`/resoluciones?id=${res.id}`)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar"><IconEdit size={18} /></button>
                                                    <button onClick={() => eliminarResolucion(res.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"><IconTrash size={18} /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}