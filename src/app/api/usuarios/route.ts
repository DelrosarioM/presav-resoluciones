// src/app/api/usuarios/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // <-- Importamos la librería de encriptación

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// 1. CREAR USUARIO (POST)
// ==========================================
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nacionalidad, cedula, primer_nombre, primer_apellido, password, rol } = body;

        const cedulaFormateada = `${nacionalidad}-${cedula}`;
        const correoInterno = `${cedulaFormateada.toLowerCase()}@presav.unellez.edu.ve`;

        // 1. Guardamos la clave en la bóveda de Supabase Auth (Para que funcione el Login)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: correoInterno,
            password: password,
            email_confirm: true
        });

        if (authError) throw new Error(`Error Auth: ${authError.message}`);

        // 2. ENCRIPTAMOS LA CONTRASEÑA para tu tabla independiente
        // El "10" es el nivel de seguridad (Salt rounds). Es el estándar recomendado.
        const passwordEncriptada = bcrypt.hashSync(password, 10);

        // 3. Guardamos el perfil con la contraseña encriptada en TU tabla
        const { error: dbError } = await supabaseAdmin.from('Usuario').insert({
            cedula: cedulaFormateada,
            primer_nombre,
            primer_apellido,
            rol,
            password: passwordEncriptada // <-- ¡Aquí guardamos el hash!
        });

        if (dbError) throw new Error(`Error BD: ${dbError.message}`);

        return NextResponse.json({ success: true, message: "Usuario creado exitosamente con contraseña encriptada." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// ==========================================
// 2. EDITAR USUARIO (PUT)
// ==========================================
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { cedula_original, primer_nombre, primer_apellido, password_nueva } = body;

        // 1. Actualizamos nombre y apellido
        const actualizaciones: any = { primer_nombre, primer_apellido };

        // 2. Si el Admin escribió una contraseña nueva, la procesamos
        if (password_nueva && password_nueva.trim() !== "") {
            const correo = `${cedula_original.toLowerCase()}@presav.unellez.edu.ve`;

            // A. Actualizamos en la bóveda de Auth
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            const authUser = users.find(u => u.email === correo);

            if (authUser) {
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password: password_nueva });
                if (updateError) throw new Error(`Error al actualizar clave en bóveda: ${updateError.message}`);
            } else {
                throw new Error("No se encontró al usuario en la bóveda de seguridad.");
            }

            // B. Encriptamos y preparamos para actualizar en tu tabla
            actualizaciones.password = bcrypt.hashSync(password_nueva, 10);
        }

        // 3. Ejecutamos la actualización en tu tabla 'Usuario'
        const { error: dbError } = await supabaseAdmin.from('Usuario')
            .update(actualizaciones)
            .eq('cedula', cedula_original);

        if (dbError) throw new Error(`Error BD al actualizar: ${dbError.message}`);

        return NextResponse.json({ success: true, message: "Usuario actualizado correctamente." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// ==========================================
// 3. ELIMINAR USUARIO (DELETE)
// ==========================================
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { cedula } = body;

        const correo = `${cedula.toLowerCase()}@presav.unellez.edu.ve`;

        // 1. Lo borramos de la Bóveda (Auth)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = users.find(u => u.email === correo);

        if (authUser) {
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        }

        // 2. Lo borramos de tu tabla pública
        const { error: dbError } = await supabaseAdmin.from('Usuario').delete().eq('cedula', cedula);
        if (dbError) throw new Error(`Error BD al eliminar: ${dbError.message}`);

        return NextResponse.json({ success: true, message: "Usuario eliminado." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}