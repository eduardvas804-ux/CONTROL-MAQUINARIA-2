import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addDays, differenceInDays } from "date-fns";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const hoy = new Date();
        const alertasCreadas: any[] = [];

        // 1. Buscar mantenimientos próximos (15 días)
        const { data: mantenimientos } = await supabase
            .from("mantenimientos")
            .select("*, equipos(codigo, tipo)")
            .eq("estado", "pendiente")
            .not("fecha_programada", "is", null)
            .gte("fecha_programada", hoy.toISOString().split("T")[0])
            .lte("fecha_programada", addDays(hoy, 15).toISOString().split("T")[0]);

        for (const m of mantenimientos || []) {
            const dias = differenceInDays(new Date(m.fecha_programada), hoy);
            const { data: existente } = await supabase
                .from("alertas")
                .select("id")
                .eq("referencia_id", m.id)
                .eq("tipo", "mantenimiento")
                .single();

            if (!existente) {
                const { data: alerta } = await supabase.from("alertas").insert({
                    tipo: "mantenimiento",
                    equipo_id: m.equipo_id,
                    referencia_id: m.id,
                    titulo: `Mantenimiento ${m.tipo} próximo`,
                    mensaje: `El equipo ${m.equipos?.codigo} tiene un mantenimiento ${m.tipo} programado para ${m.fecha_programada}. Faltan ${dias} días.`,
                    fecha_alerta: m.fecha_programada,
                    dias_anticipacion: dias,
                    prioridad: dias <= 7 ? "urgente" : "normal",
                }).select().single();
                if (alerta) alertasCreadas.push(alerta);
            }
        }

        // 2. Buscar SOATs próximos a vencer (30 días)
        const { data: soats } = await supabase
            .from("soat")
            .select("*, equipos(codigo, tipo, placa)")
            .eq("activo", true)
            .lte("fecha_vencimiento", addDays(hoy, 30).toISOString().split("T")[0])
            .gte("fecha_vencimiento", hoy.toISOString().split("T")[0]);

        for (const s of soats || []) {
            const dias = differenceInDays(new Date(s.fecha_vencimiento), hoy);
            const { data: existente } = await supabase
                .from("alertas")
                .select("id")
                .eq("referencia_id", s.id)
                .eq("tipo", "soat")
                .single();

            if (!existente) {
                const { data: alerta } = await supabase.from("alertas").insert({
                    tipo: "soat",
                    equipo_id: s.equipo_id,
                    referencia_id: s.id,
                    titulo: "SOAT próximo a vencer",
                    mensaje: `El SOAT del equipo ${s.equipos?.codigo} (${s.equipos?.placa || "S/P"}) vence el ${s.fecha_vencimiento}. Faltan ${dias} días.`,
                    fecha_alerta: s.fecha_vencimiento,
                    dias_anticipacion: dias,
                    prioridad: dias <= 15 ? "urgente" : dias <= 30 ? "alta" : "normal",
                }).select().single();
                if (alerta) alertasCreadas.push(alerta);
            }
        }

        // 3. Buscar revisiones técnicas próximas a vencer (15 días)
        const { data: revisiones } = await supabase
            .from("revisiones_tecnicas")
            .select("*, equipos(codigo, tipo, placa)")
            .lte("fecha_vencimiento", addDays(hoy, 15).toISOString().split("T")[0])
            .gte("fecha_vencimiento", hoy.toISOString().split("T")[0]);

        for (const r of revisiones || []) {
            const dias = differenceInDays(new Date(r.fecha_vencimiento), hoy);
            const { data: existente } = await supabase
                .from("alertas")
                .select("id")
                .eq("referencia_id", r.id)
                .eq("tipo", "revision_tecnica")
                .single();

            if (!existente) {
                const { data: alerta } = await supabase.from("alertas").insert({
                    tipo: "revision_tecnica",
                    equipo_id: r.equipo_id,
                    referencia_id: r.id,
                    titulo: "Revisión técnica próxima a vencer",
                    mensaje: `La revisión técnica del equipo ${r.equipos?.codigo} (${r.equipos?.placa || "S/P"}) vence el ${r.fecha_vencimiento}. Faltan ${dias} días.`,
                    fecha_alerta: r.fecha_vencimiento,
                    dias_anticipacion: dias,
                    prioridad: dias <= 7 ? "urgente" : "alta",
                }).select().single();
                if (alerta) alertasCreadas.push(alerta);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${alertasCreadas.length} alertas creadas`,
            alertas: alertasCreadas,
        });
    } catch (error: any) {
        console.error("Error en cron de alertas:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Configuración para Vercel Cron (ejecutar diariamente a las 8 AM)
export const dynamic = "force-dynamic";
