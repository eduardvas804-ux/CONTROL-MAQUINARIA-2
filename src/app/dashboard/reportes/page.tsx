import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileSpreadsheet, TrendingUp, Calendar } from "lucide-react";

export default function ReportesPage() {
    const reportes = [
        {
            title: "Reporte de Horas por Equipo",
            description: "Resumen de horas trabajadas por equipo en un periodo",
            icon: BarChart3,
            href: "/dashboard/reportes/horas-equipo",
        },
        {
            title: "Reporte de Valorizaciones",
            description: "Estado y monto de valorizaciones por periodo",
            icon: FileSpreadsheet,
            href: "/dashboard/reportes/valorizaciones",
        },
        {
            title: "Rentabilidad por Proyecto",
            description: "Análisis de ingresos vs costos por proyecto",
            icon: TrendingUp,
            href: "/dashboard/reportes/rentabilidad",
        },
        {
            title: "Calendario de Mantenimientos",
            description: "Mantenimientos programados y vencimientos",
            icon: Calendar,
            href: "/dashboard/reportes/mantenimientos",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
                <p className="text-muted-foreground mt-1">
                    Generación de reportes y análisis del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportes.map((reporte, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <reporte.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{reporte.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {reporte.description}
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reportes Personalizados</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                    <p>Los reportes personalizados estarán disponibles próximamente.</p>
                    <p className="text-sm mt-2">
                        Podrá generar reportes con filtros avanzados y exportar a Excel/PDF.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
