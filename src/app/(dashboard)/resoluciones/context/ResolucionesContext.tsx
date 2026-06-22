"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Definimos la estructura del Contexto
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
}

interface ResolucionesContextType {
  paso: number;
  setPaso: React.Dispatch<React.SetStateAction<number>>;
  considerandosBD: any[];
  cargandoConsiderandos: boolean;
  considerandosSeleccionados: any[];
  setConsiderandosSeleccionados: React.Dispatch<React.SetStateAction<any[]>>;
  // AJUSTE: Agregamos "Elevado" a la lista de tipos permitidos
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
}

const ResolucionesContext = createContext<ResolucionesContextType | undefined>(undefined);

export function ResolucionesProvider({ children }: { children: React.ReactNode }) {
  const [paso, setPaso] = useState(1);
  const [considerandosBD, setConsiderandosBD] = useState<any[]>([]);
  const [cargandoConsiderandos, setCargandoConsiderandos] = useState(true);
  const [considerandosSeleccionados, setConsiderandosSeleccionados] = useState<any[]>([]);
  // AJUSTE: Actualizamos el estado inicial para aceptar "Elevado"
  const [veredicto, setVeredicto] = useState<"Aprobado" | "Negado" | "Diferido" | "Elevado" | "">("");
  const [textoResolucion, setTextoResolucion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

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
    planteamiento: ""
  });

  useEffect(() => {
    async function cargarConsiderandos() {
      try {
        const { data, error } = await supabase.from('ConsiderandosCatalogo').select('*, CategoriaConsiderando(nombre)').eq('activo', true);
        if (error) console.error("Error de Supabase:", error);
        else if (data) setConsiderandosBD(data);
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setCargandoConsiderandos(false);
      }
    }
    cargarConsiderandos();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormulario((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errores[e.target.name]) {
      setErrores((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validarYContinuar = () => {
    let nuevosErrores: Record<string, string> = {};
    if (!formulario.ano.trim()) nuevosErrores.ano = "Año requerido";
    else if (!/^\d{4}$/.test(formulario.ano)) nuevosErrores.ano = "Año inválido";
    if (!formulario.correlativo.trim()) nuevosErrores.correlativo = "Requerido";
    else if (!/^\d+$/.test(formulario.correlativo)) nuevosErrores.correlativo = "Solo números";
    if (!formulario.acta.trim()) nuevosErrores.acta = "Requerido";
    else if (!/^\d+$/.test(formulario.acta)) nuevosErrores.acta = "Solo números";
    if (!formulario.punto.trim()) nuevosErrores.punto = "Requerido";
    else if (!/^\d+$/.test(formulario.punto)) nuevosErrores.punto = "Solo números";
    if (!formulario.cedula.trim()) nuevosErrores.cedula = "Requerido";
    else if (!/^\d{7,9}$/.test(formulario.cedula)) nuevosErrores.cedula = "Solo números";
    if (!formulario.nombre.trim()) nuevosErrores.nombre = "Requerido";
    else if (formulario.nombre.trim().length < 5) nuevosErrores.nombre = "Ingrese el nombre completo";

    if (!formulario.programa) nuevosErrores.programa = "Seleccione un programa";
    if (!formulario.sede) nuevosErrores.sede = "Seleccione una sede";

    if (!formulario.fechaComision) nuevosErrores.fechaComision = "Requerido";
    if (!formulario.planteamiento.trim()) nuevosErrores.planteamiento = "Requerido";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    localStorage.setItem('presav_historial_form', JSON.stringify(formulario));
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
      planteamiento: ""
    });
    setConsiderandosSeleccionados([]);
    setVeredicto("");
    setTextoResolucion("");
    setErrores({});
  };

  return (
    <ResolucionesContext.Provider
      value={{
        paso,
        setPaso,
        considerandosBD,
        cargandoConsiderandos,
        considerandosSeleccionados,
        setConsiderandosSeleccionados,
        veredicto,
        setVeredicto,
        textoResolucion,
        setTextoResolucion,
        busqueda,
        setBusqueda,
        errores,
        setErrores,
        formulario,
        setFormulario,
        manejarCambio,
        validarYContinuar,
        toggleConsiderando,
        quitarConsiderando,
        actualizarTextoConsiderando,
        limpiarFormulario,
      }}
    >
      {children}
    </ResolucionesContext.Provider>
  );
}

// Hook personalizado para acceder al contexto
export function useResoluciones() {
  const context = useContext(ResolucionesContext);
  if (context === undefined) {
    throw new Error("useResoluciones debe ser usado dentro de un ResolucionesProvider");
  }
  return context;
}