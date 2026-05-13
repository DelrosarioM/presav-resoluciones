"use client";

import { IconRefresh } from '@tabler/icons-react';
import Paso1Formulario from "./components/Paso1Formulario";
import Paso2Considerandos from "./components/Paso2Considerandos";
import Paso3VistaPrevia from "./components/Paso3VistaPrevia";
import { ResolucionesProvider, useResoluciones } from "./context/ResolucionesContext";

function ResolucionesContent() {
  const { paso, limpiarFormulario } = useResoluciones();

  return (
    <>
      <header className="mb-8 text-center relative">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Sistema de Resoluciones PRESAV</h1>
        <p className="text-lg text-gray-600">
          {paso === 1 && "Paso 1: Datos Generales y del Solicitante"}
          {paso === 2 && "Paso 2: Selección y Edición de Considerandos"}
          {paso === 3 && "Paso 3: Veredicto y Vista Previa del Documento"}
        </p>
        <div className="flex justify-center mt-6 gap-4">
          <div className={`h-2 w-24 rounded-full transition-colors ${paso >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-24 rounded-full transition-colors ${paso >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-24 rounded-full transition-colors ${paso >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
        </div>

        {paso > 1 && (
          <button onClick={limpiarFormulario} className="absolute right-0 top-0 mt-2 mr-2 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <IconRefresh size={18} /> Reiniciar
          </button>
        )}
      </header>

      {paso === 1 && <Paso1Formulario />}
      {paso === 2 && <Paso2Considerandos />}
      {paso === 3 && <Paso3VistaPrevia />}
    </>
  );
}

export default function ResolucionesPage() {
  return (
    <ResolucionesProvider>
      <ResolucionesContent />
    </ResolucionesProvider>
  );
}
