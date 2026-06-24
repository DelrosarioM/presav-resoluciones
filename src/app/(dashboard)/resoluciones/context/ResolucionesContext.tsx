"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface FormulariosState {
  tipoResolucion: string;
  ano: string;
  correlativo: string;
  acta: string;
  punto: string;
  fechaComision: string;
  nacionalidad: string;
  cedula: string;
  nombre: string;
  programa: string;
  sede: string;
  planteamiento: string;
  unidadEjecutora: string;
}

interface ResolucionesContextType {
  paso: number;
  setPaso: React.Dispatch<React.SetStateAction<number>>;
  considerandosBD: any[];
  cargandoConsiderandos: boolean;
  considerandosSeleccionados: any[];
  setConsiderandosSeleccionados: React.Dispatch<React.SetStateAction<any[]>>;
  veredicto: "Aprobado" | "Negado" | "Diferido" | "Elevado" | "";
  setVeredicto: React.Dispatch<React.SetStateAction<"Aprobado" | "Negado" | "Diferido" | "Elevado" | "">>;
  textoResolucion: string;
  setTextoResolucion: React.Dispatch<React.SetStateAction<string>>;
  busqueda: string;
  setBusqueda: React.Dispatch<React.SetStateAction<string>>;
  errores: Record<string, string>;
  setErrores: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  formulario: FormulariosState;
  setFormulario: React.Dispatch<React.SetStateAction<FormulariosState>>;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  validarYContinuar: () => void;
  toggleConsiderando: (considerando: any) => void;
  quitarConsiderando: (id: number) => void;
  actualizarTextoConsiderando: (id: number, nuevoTexto: string) => void;
  limpiarFormulario: () => void;
  idEdicion: string | null;
}

const ResolucionesContext = createContext<ResolucionesContextType | undefined>(undefined);

function ResolucionesProviderContent({ children }: { children: React.ReactNode }) {
  const [paso, setPaso] = useState(1);
  const [considerandosBD, setConsiderandosBD] = useState<any[]>([]);
  const [cargandoConsiderandos, setCargandoConsiderandos] = useState(true);
  const [considerandosSeleccionados, setConsiderandosSeleccionados] = useState<any[]>([]);
  const [veredicto, setVeredicto] = useState<"Aprobado" | "Negado" | "Diferido" | "Elevado" | "">("");
  const [textoResolucion, setTextoResolucion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();
  const idEdicion = searchParams.get("id"); // Capturamos el ID de la URL

  const [formulario, setFormulario] = useState<FormulariosState>({
    tipoResolucion: "ORDINARIA",
    ano: new Date().getFullYear().toString(),
    correlativo: "",
    acta: "",
    punto: "",
    fechaComision: "",
    nacionalidad: "V",
    cedula: "",
    nombre: "",
    programa: "",
    sede: "",
    planteamiento: "",
    unidadEjecutora: ""
  });

  // EFECTO 1: Cargar catálogo base de considerandos
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const { data } = await supabase.from('ConsiderandosCatalogo').select('*, CategoriaConsiderando(nombre)').eq('activo', true);
        if (data) setConsiderandosBD(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoConsiderandos(false);
      }
    }
    cargarCatalogos();
  }, []);

  // EFECTO 2: Si viene un ID en la URL, se precargan todos los datos automáticamente
  useEffect(() => {
    async function precargarDatos() {
      if (!idEdicion) return;
      try {
        const { data, error } = await supabase
          .from("Resoluciones")
          .select("*")
          .eq("id", idEdicion)
          .single();

        if (error) throw error;

        if (data) {
          const veredictoMapper: Record<string, any> = {
            aprobado: "Aprobado",
            negado: "Negado",
            diferido: "Diferido",
            elevado: "Elevado",
            pendiente: "Diferido"
          };

          setFormulario({
            tipoResolucion: data.tipo_resolucion?.toUpperCase() || "ORDINARIA",
            ano: data.anio?.toString() || new Date().getFullYear().toString(),
            correlativo: data.correlativo?.toString() || "",
            acta: data.acta_numero?.toString() || "",
            punto: data.punto_numero?.toString() || "",
            fechaComision: data.fecha_comision || "",
            // ¡AHORA SÍ CARGAMOS LOS DATOS COMPLETOS DE LA BD!
            nacionalidad: data.nacionalidad_solicitante || "V",
            cedula: data.cedula_solicitante || "",
            nombre: data.autoridad_solicitante || "",
            programa: data.programa_academico || "",
            sede: data.sede || "",
            planteamiento: data.tipo_solicitud || "",
            unidadEjecutora: data.unidad_ejecutora || ""
          });

          setVeredicto(veredictoMapper[data.veredicto] || "");
          setTextoResolucion(data.texto_unico || "");

          // ¡CARGAMOS LOS CONSIDERANDOS GUARDADOS DEL PASO 2!
          if (data.considerandos_guardados && Array.isArray(data.considerandos_guardados)) {
            setConsiderandosSeleccionados(data.considerandos_guardados);
          }
        }
      } catch (err) {
        console.error("Error precargando datos de edición:", err);
      }
    }
    precargarDatos();
  }, [idEdicion]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormulario((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errores[e.target.name]) {
      setErrores((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validarYContinuar = () => {
    let nuevosErrores: Record<string, string> = {};
    if (!formulario.ano.trim()) nuevosErrores.ano = "Año requerido";
    if (!formulario.correlativo.trim()) nuevosErrores.correlativo = "Requerido";
    if (!formulario.acta.trim()) nuevosErrores.acta = "Requerido";
    if (!formulario.punto.trim()) nuevosErrores.punto = "Requerido";
    if (!formulario.nombre.trim()) nuevosErrores.nombre = "Nombre requerido";
    if (!formulario.unidadEjecutora) nuevosErrores.unidadEjecutora = "Unidad requerida";
    if (!formulario.fechaComision) nuevosErrores.fechaComision = "Fecha requerida";
    if (!formulario.planteamiento.trim()) nuevosErrores.planteamiento = "Planteamiento requerido";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setPaso(2);
  };

  const toggleConsiderando = (considerando: any) => {
    const yaExiste = considerandosSeleccionados.find(c => c.id === considerando.id);
    if (yaExiste) {
      setConsiderandosSeleccionados(considerandosSeleccionados.filter(c => c.id !== considerando.id));
    } else {
      setConsiderandosSeleccionados([...considerandosSeleccionados, { ...considerando, texto: considerando.texto_plantilla }]);
    }
  };

  const quitarConsiderando = (id: number) => {
    setConsiderandosSeleccionados(considerandosSeleccionados.filter(c => c.id !== id));
  };

  const actualizarTextoConsiderando = (id: number, nuevoTexto: string) => {
    setConsiderandosSeleccionados(considerandosSeleccionados.map(c => c.id === id ? { ...c, texto: nuevoTexto } : c));
  };

  const limpiarFormulario = () => {
    setPaso(1);
    setFormulario({
      tipoResolucion: "ORDINARIA",
      ano: new Date().getFullYear().toString(),
      correlativo: "",
      acta: "",
      punto: "",
      fechaComision: "",
      nacionalidad: "V",
      cedula: "",
      nombre: "",
      programa: "",
      sede: "",
      planteamiento: "",
      unidadEjecutora: ""
    });
    setConsiderandosSeleccionados([]);
    setVeredicto("");
    setTextoResolucion("");
    setErrores({});
  };

  return (
    <ResolucionesContext.Provider
      value={{
        paso, setPaso, considerandosBD, cargandoConsiderandos, considerandosSeleccionados,
        setConsiderandosSeleccionados, veredicto, setVeredicto, textoResolucion, setTextoResolucion,
        busqueda, setBusqueda, errores, setErrores, formulario, setFormulario, manejarCambio,
        validarYContinuar, toggleConsiderando, quitarConsiderando, actualizarTextoConsiderando,
        limpiarFormulario, idEdicion
      }}
    >
      {children}
    </ResolucionesContext.Provider>
  );
}

// Next.js requiere envolver el useSearchParams en un Suspense para evitar fallos de renderizado estático
export function ResolucionesProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-12 text-center">Cargando Módulos del Formulario...</div>}>
      <ResolucionesProviderContent>{children}</ResolucionesProviderContent>
    </Suspense>
  );
}

export function useResoluciones() {
  const context = useContext(ResolucionesContext);
  if (context === undefined) throw new Error("useResoluciones debe ser usado dentro de un ResolucionesProvider");
  return context;
}