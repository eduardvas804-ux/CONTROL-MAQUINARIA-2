import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, FolderKanban, FileSpreadsheet, AlertTriangle, Clock, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getStats() {
    const supabase = createServerComponentClient({ cookies });

    const [
        { count: equiposCount },
        { count: proyectosCount },
        { count: valorizacionesCount },
        { data: valorizaciones },
        { count: alertasCount },
        { count: mantenimientosCount },
    ] = await Promise.all([
        supabase.from("equipos").select("*", { count: "exact", head: true }).eq("activo", true),
        supabase.from("proyectos").select("*", { count: "exact", head: true }).eq("activo", true),
        supabase.from("valorizaciones").select("*", { count: "exact", head: true }),
        supabase.from("valorizaciones").select("monto_total").eq("estado", "aprobada"),
        supabase.from("alertas").select("*", { count: "exact", head: true }).eq("enviado", false),
        supabase.from("mantenimientos").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    ]);

    const totalValorizado = valorizaciones?.reduce((sum, v) => sum + (v.monto_total || 0), 0) || 0;

    return {
        equipos: equiposCount || 0,
        proyectos: proyectosCount || 0,
        valorizaciones: valorizacionesCount || 0,
        totalValorizado,
        alertas: alertasCount || 0,
        mantenimientos: mantenimientosCount || 0,
    };
}

export default async function DashboardPage() {
    const stats = await getStats();

    const cards = [
        {
            title: "Equipos Activos",
            value: stats.equipos.toString(),
            icon: Truck,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Proyectos Activos",
            value: stats.proyectos.toString(),
            icon: FolderKanban,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            title: "Valorizaciones",
            value: stats.valorizaciones.toString(),
            icon: FileSpreadsheet,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Total Valorizado",
            value: formatCurrency(stats.totalValorizado),
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-100",
        },
        {
            title: "Alertas Pendientes",
            value: stats.alertas.toString(),
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-100",
        },
        {
            title: "Mantenimientos Pendientes",
            value: stats.mantenimientos.toString(),
            icon: Wrench,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Resumen general del sistema de gestión de maquinaria
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Alertas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.alertas === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No hay alertas pendientes
                            </p>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                {stats.alertas} alertas requieren atención
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Próximos Mantenimientos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.mantenimientos === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No hay mantenimientos programados
                            </p>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                {stats.mantenimientos} mantenimientos pendientes
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
