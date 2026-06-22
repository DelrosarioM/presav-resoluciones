"use client";

import { useState } from 'react'; // <-- Importamos useState
import { IconRefresh, IconAlertTriangle } from '@tabler/icons-react'; // <-- Importamos IconAlertTriangle
import Paso1Formulario from "./components/Paso1Formulario";
import Paso2Considerandos from "./components/Paso2Considerandos";
import Paso3VistaPrevia from "./components/Paso3VistaPrevia";
import { ResolucionesProvider, useResoluciones } from "./context/ResolucionesContext";

function ResolucionesContent() {
  const { paso, limpiarFormulario } = useResoluciones();

  // NUEVO: Estado para controlar la visibilidad de la ventana emergente
  const [mostrarModalReinicio, setMostrarModalReinicio] = useState(false);

  const confirmarReinicio = () => {
    limpiarFormulario();
    setMostrarModalReinicio(false);
  };

  return (
    <>
      {/* AJUSTE: Añadimos flex-col y items-center al header para organizar el botón en móviles */}
      <header className="mb-8 text-center relative flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Sistema de Resoluciones PRESAV</h1>
        <p className="text-sm md:text-lg text-gray-600">
          {paso === 1 && "Paso 1: Datos Generales y del Solicitante"}
          {paso === 2 && "Paso 2: Selección y Edición de Considerandos"}
          {paso === 3 && "Paso 3: Veredicto y Vista Previa del Documento"}
        </p>
        <div className="flex justify-center mt-6 gap-2 md:gap-4">
          <div className={`h-2 w-16 md:w-24 rounded-full transition-colors ${paso >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-16 md:w-24 rounded-full transition-colors ${paso >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-16 md:w-24 rounded-full transition-colors ${paso >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
        </div>

        {paso > 1 && (
          <button
            onClick={() => setMostrarModalReinicio(true)}
            // AJUSTE: En móvil se posiciona debajo, en PC se queda absoluto a la derecha
            className="mt-6 md:mt-2 md:absolute md:right-0 md:top-0 md:mr-2 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <IconRefresh size={18} /> Reiniciar
          </button>
        )}
      </header>

      {paso === 1 && <Paso1Formulario />}
      {paso === 2 && <Paso2Considerandos />}
      {paso === 3 && <Paso3VistaPrevia />}

      {/* NUEVO: MODAL DE REINICIO DIFUMINADO */}
      {mostrarModalReinicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 text-center mt-2">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-inner">
                <IconAlertTriangle size={32} stroke={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Reiniciar resolución?</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Se perderán todos los datos ingresados y considerandos seleccionados. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalReinicio(false)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarReinicio}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
                >
                  Sí, reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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