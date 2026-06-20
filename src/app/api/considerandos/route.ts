// src/app/api/considerandos/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inicializamos el cliente administrador para saltar las políticas de RLS y operar con seguridad
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// 1. CREAR NUEVO CONSIDERANDO (POST)
// ==========================================
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { titulo, texto_plantilla, activo } = body;

        // Insertamos los datos en la tabla. 
        // Agregamos categoria_id por defecto para cumplir con la nueva llave foránea
        const { error: dbError } = await supabaseAdmin.from('ConsiderandosCatalogo').insert({
            titulo,
            texto_plantilla,
            activo,
            categoria_id: 1,
        });

        if (dbError) throw new Error(`Error al guardar en BD: ${dbError.message}`);

        return NextResponse.json({ success: true, message: "Plantilla creada exitosamente." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// ==========================================
// 2. ACTUALIZAR CONSIDERANDO EXISTENTE (PUT)
// ==========================================
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, titulo, texto_plantilla, activo } = body;

        // Actualizamos usando el ID como referencia
        const { error: dbError } = await supabaseAdmin.from('ConsiderandosCatalogo')
            .update({
                titulo,
                texto_plantilla,
                activo
            })
            .eq('id', id);

        if (dbError) throw new Error(`Error al actualizar BD: ${dbError.message}`);

        return NextResponse.json({ success: true, message: "Plantilla actualizada correctamente." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}