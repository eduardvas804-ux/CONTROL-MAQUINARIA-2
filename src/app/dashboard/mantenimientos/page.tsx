import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency, cn, getStatusColor } from "@/lib/utils";
import { differenceInDays } from "date-fns";

function getSemaforoColor(fecha: string) {
    const dias = differenceInDays(new Date(fecha), new Date());
    if (dias < 0) return "bg-red-500";
    if (dias <= 7) return "bg-red-400";
    if (dias <= 15) return "bg-yellow-400";
    return "bg-green-400";
}

export default async function MantenimientosPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: mantenimientos, error } = await supabase
        .from("mantenimientos")
        .select(`
      *,
      equipos (
        codigo,
        tipo
      )
    `)
        .order("fecha_programada", { ascending: true });

    if (error) {
        console.error("Error fetching mantenimientos:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mantenimientos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de mantenimientos preventivos y correctivos
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/mantenimientos/importar">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Excel
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/mantenimientos/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Mantenimiento
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Leyenda de semáforos */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Vencido / Urgente (&lt; 7 días)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span>Próximo (7-15 días)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span>OK (&gt; 15 días)</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lista de Mantenimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Fecha Programada</TableHead>
                                    <TableHead className="text-right">Costo</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!mantenimientos || mantenimientos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No hay mantenimientos registrados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    mantenimientos.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell>
                                                {m.fecha_programada && m.estado === "pendiente" && (
                                                    <div className={cn("w-3 h-3 rounded-full", getSemaforoColor(m.fecha_programada))} />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{m.equipos?.codigo}</TableCell>
                                            <TableCell className="capitalize">{m.tipo}</TableCell>
                                            <TableCell className="max-w-xs truncate">{m.descripcion}</TableCell>
                                            <TableCell>{m.fecha_programada ? formatDate(m.fecha_programada) : "-"}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(m.costo || 0)}</TableCell>
                                            <TableCell>{m.proveedor || "-"}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    getStatusColor(m.estado)
                                                )}>
                                                    {m.estado.replace("_", " ").charAt(0).toUpperCase() + m.estado.replace("_", " ").slice(1)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
