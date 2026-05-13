// src/components/MiPerfil.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { IconLock, IconCheck, IconAlertCircle } from "@tabler/icons-react"; // <-- IMPORTAMOS LOS ICONOS

export default function MiPerfil() {
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    // Estados para el formulario de contraseña
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        cargarDatosPerfil();
    }, []);

    const cargarDatosPerfil = async () => {
        // 1. Obtenemos quién está conectado en la bóveda de Auth
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.email) {
            // 2. Extraemos la cédula del correo (ej: de "v-29626161@..." sacamos "V-29626161")
            const cedulaFormateada = user.email.split('@')[0].toUpperCase();

            // 3. Buscamos sus datos reales en nuestra tabla
            const { data, error } = await supabase
                .from('Usuario')
                .select('*')
                .eq('cedula', cedulaFormateada)
                .single();

            if (data) setPerfil(data);
        }
        setCargando(false);
    };

    const cambiarPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje({ tipo: "", texto: "" });

        // Validaciones básicas
        if (nuevaPassword !== confirmarPassword) {
            return setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
        }
        if (nuevaPassword.length < 6) {
            return setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres." });
        }

        setGuardando(true);
        try {
            // ¡Reutilizamos nuestra API maestra para actualizar la clave y encriptarla!
            const res = await fetch('/api/usuarios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cedula_original: perfil.cedula,
                    primer_nombre: perfil.primer_nombre, // Se envían igual para no borrarlos
                    primer_apellido: perfil.primer_apellido,
                    password_nueva: nuevaPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMensaje({ tipo: "exito", texto: "¡Tu contraseña ha sido actualizada con éxito y encriptada de forma segura!" });
            setNuevaPassword("");
            setConfirmarPassword("");
        } catch (error: any) {
            setMensaje({ tipo: "error", texto: error.message });
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return <div className="text-center p-12 text-gray-500 font-medium animate-pulse bg-white rounded-2xl shadow-sm border border-gray-200 mt-10 max-w-3xl mx-auto">Cargando tu información...</div>;
    }

    if (!perfil) {
        return <div className="text-center p-12 text-red-500 bg-white rounded-2xl mt-10 max-w-3xl mx-auto">Error al cargar el perfil.</div>;
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mt-10 max-w-3xl mx-auto text-left">
            <div className="border-b border-gray-200 pb-6 mb-6 flex items-center gap-4">
                <div className="h-16 w-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
                    {perfil.primer_nombre.charAt(0)}{perfil.primer_apellido.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">{perfil.primer_nombre} {perfil.primer_apellido}</h2>
                    <p className="text-gray-500 font-medium">Cédula: <span className="text-gray-800">{perfil.cedula}</span></p>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-full border border-blue-200">
                        Rol: {perfil.rol}
                    </span>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconLock className="text-blue-600" size={24} /> Cambiar mi Contraseña
                </h3>

                {mensaje.texto && (
                    <div className={`p-4 rounded-xl mb-6 font-bold text-sm border flex items-start gap-2 ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {mensaje.tipo === 'exito' ? (
                            <IconCheck className="shrink-0 mt-0.5" size={20} />
                        ) : (
                            <IconAlertCircle className="shrink-0 mt-0.5" size={20} />
                        )}
                        <p>{mensaje.texto}</p>
                    </div>
                )}

                {/* Agregamos autoComplete="off" por seguridad */}
                <form onSubmit={cambiarPassword} className="space-y-4" autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700 text-sm mb-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={nuevaPassword}
                                onChange={(e) => setNuevaPassword(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium outline-none bg-white"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700 text-sm mb-1">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium outline-none bg-white"
                                placeholder="Repite la contraseña"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={guardando || !nuevaPassword || !confirmarPassword}
                            className={`font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 ${guardando || !nuevaPassword || !confirmarPassword ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {guardando ? 'Actualizando...' : 'Guardar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}