"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { IconId, IconLock, IconLogin, IconAlertCircle } from "@tabler/icons-react";

export default function LoginPage() {
    const [nacionalidad, setNacionalidad] = useState("V");
    const [cedula, setCedula] = useState("");
    const [password, setPassword] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const manejarLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        if (!cedula || !password) {
            setError("Por favor, ingrese su cédula y contraseña.");
            setCargando(false);
            return;
        }

        const correoInterno = `${nacionalidad.toLowerCase()}-${cedula}@presav.unellez.edu.ve`;
        const cedulaFormateada = `${nacionalidad}-${cedula}`;

        try {
            const { data: authData, error: authError } =
                await supabase.auth.signInWithPassword({
                    email: correoInterno,
                    password: password,
                });

            if (authError) {
                throw new Error(
                    "Credenciales incorrectas. Verifique su cédula y contraseña.",
                );
            }

            const { data: usuarioData, error: dbError } = await supabase
                .from("Usuario")
                .select("rol, primer_nombre, primer_apellido")
                .eq("cedula", cedulaFormateada)
                .single();

            if (dbError || !usuarioData) {
                throw new Error(
                    "Su cuenta de seguridad es válida, pero no tiene un perfil en el sistema PRESAV. Contacte al administrador.",
                );
            }

            // REDIRECCIÓN BASADA EN ROLES ACTUALIZADA
            if (usuarioData.rol === "estudiante") {
                // Al estudiante lo mandamos directo al historial
                router.push("/historial");
            } else {
                // Administradores y profesores van al dashboard principal
                router.push("/resoluciones");
            }
        } catch (err: any) {
            setError(
                err.message ||
                "Ocurrió un error de conexión al intentar iniciar sesión.",
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            {/* Logos de la Institución (Adaptados a móvil) */}
            <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8 items-center">
                <img
                    src="/logo-unellez.png"
                    alt="UNELLEZ"
                    className="h-14 sm:h-20 object-contain"
                />
                <div className="h-10 sm:h-16 w-px bg-gray-300"></div>
                <img
                    src="/logo-presav.png"
                    alt="PRESAV"
                    className="h-14 sm:h-20 object-contain"
                />
            </div>

            {/* Tarjeta de Login */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
                <div className="bg-blue-900 p-5 sm:p-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Sistema PRESAV</h2>
                    <p className="text-blue-200 text-xs sm:text-sm mt-1">
                        Gestión de Resoluciones Académicas
                    </p>
                </div>

                {/* Padding reducido en móviles (p-5 en vez de p-8) */}
                <div className="p-5 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-5 sm:mb-6 text-center">
                        Ingresar al Sistema
                    </h3>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-5 sm:mb-6 rounded-r-lg flex items-start gap-3">
                            <IconAlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={manejarLogin} className="space-y-5 sm:space-y-6" autoComplete="off">
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700 text-xs sm:text-sm">
                                Cédula de Identidad
                            </label>
                            <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 bg-gray-50 transition-all">
                                <div className="bg-gray-100 pl-3 sm:pl-4 pr-2 flex items-center justify-center h-full">
                                    <IconId className="text-gray-500" size={20} />
                                </div>
                                <select
                                    value={nacionalidad}
                                    onChange={(e) => setNacionalidad(e.target.value)}
                                    className="bg-gray-100 py-3 pr-2 text-gray-700 font-bold border-r border-gray-300 focus:outline-none cursor-pointer text-sm sm:text-base"
                                >
                                    <option value="V">V-</option>
                                    <option value="E">E-</option>
                                </select>
                                <input
                                    type="text"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    placeholder="12345678"
                                    className="flex-1 p-3 pl-3 sm:pl-4 focus:outline-none bg-transparent text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base"
                                    maxLength={9}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700 text-xs sm:text-sm">
                                Contraseña
                            </label>
                            <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 bg-gray-50 transition-all">
                                <div className="pl-3 sm:pl-4 flex items-center justify-center">
                                    <IconLock className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="flex-1 p-3 pl-3 focus:outline-none bg-transparent text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className={`w-full font-bold py-3 px-4 rounded-xl text-white text-sm sm:text-base transition-all shadow-md flex justify-center items-center gap-2 ${cargando ? "bg-orange-400 cursor-wait" : "bg-orange-500 hover:bg-orange-600 active:scale-95"}`}
                        >
                            {cargando ? (
                                <>
                                    <span className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <IconLogin size={20} /> Entrar al Sistema
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 sm:mt-6 text-center">
                        <a
                            href="#"
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                            ¿Olvidó su contraseña?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}