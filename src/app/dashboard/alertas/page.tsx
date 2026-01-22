import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Shield, Wrench, ClipboardCheck, Check, Clock } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import Link from "next/link";

function getPrioridadColor(prioridad: string) {
    switch (prioridad) {
        case "urgente": return "bg-red-100 text-red-800 border-red-200";
        case "alta": return "bg-orange-100 text-orange-800 border-orange-200";
        case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
}

function getTipoIcon(tipo: string) {
    switch (tipo) {
        case "mantenimiento": return Wrench;
        case "soat": return Shield;
        case "revision_tecnica": return ClipboardCheck;
        default: return AlertTriangle;
    }
}

export default async function AlertasPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: alertas } = await supabase
        .from("alertas")
        .select(`
      *,
      equipos (
        codigo,
        tipo,
        placa
      )
    `)
        .order("fecha_alerta", { ascending: true });

    const pendientes = alertas?.filter((a) => !a.enviado) || [];
    const enviadas = alertas?.filter((a) => a.enviado) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de alertas y notificaciones del sistema
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/api/cron/verificar-alertas" target="_blank">
                        <Bell className="h-4 w-4 mr-2" />
                        Verificar Nuevas Alertas
                    </Link>
                </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Urgentes</p>
                                <p className="text-2xl font-bold">
                                    {pendientes.filter((a) => a.prioridad === "urgente").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-orange-100">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pendientes</p>
                                <p className="text-2xl font-bold">{pendientes.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-100">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Enviadas</p>
                                <p className="text-2xl font-bold">{enviadas.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <Bell className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{alertas?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de alertas pendientes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Alertas Pendientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pendientes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No hay alertas pendientes 🎉
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {pendientes.map((alerta) => {
                                const Icon = getTipoIcon(alerta.tipo);
                                const diasRestantes = differenceInDays(new Date(alerta.fecha_alerta), new Date());

                                return (
                                    <div
                                        key={alerta.id}
                                        className={cn(
                                            "p-4 rounded-lg border flex items-start gap-4",
                                            getPrioridadColor(alerta.prioridad)
                                        )}
                                    >
                                        <div className="p-2 rounded-lg bg-white/50">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-semibold">{alerta.titulo}</h4>
                                                    <p className="text-sm mt-1">{alerta.mensaje}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-medium uppercase">
                                                        {alerta.prioridad}
                                                    </span>
                                                    <p className="text-sm font-mono mt-1">
                                                        {diasRestantes <= 0 ? "Vencido" : `${diasRestantes} días`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs">
                                                <span>Equipo: {alerta.equipos?.codigo}</span>
                                                <span>Fecha: {formatDate(alerta.fecha_alerta)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
