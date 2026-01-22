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
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

function getSemaforoColor(fecha: string) {
    const dias = differenceInDays(new Date(fecha), new Date());
    if (dias < 0) return "bg-red-500";
    if (dias <= 15) return "bg-red-400";
    if (dias <= 30) return "bg-yellow-400";
    return "bg-green-400";
}

export default async function SoatPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: soats, error } = await supabase
        .from("soat")
        .select(`
      *,
      equipos (
        codigo,
        tipo,
        placa
      )
    `)
        .eq("activo", true)
        .order("fecha_vencimiento", { ascending: true });

    if (error) {
        console.error("Error fetching soat:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">SOAT</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de seguros obligatorios de accidentes de tránsito
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/soat/importar">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Excel
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/soat/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo SOAT
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Vencido / Urgente (&lt; 15 días)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span>Próximo (15-30 días)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span>Vigente (&gt; 30 días)</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lista de SOAT</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Placa</TableHead>
                                    <TableHead>N° Póliza</TableHead>
                                    <TableHead>Aseguradora</TableHead>
                                    <TableHead>Inicio</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!soats || soats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No hay SOAT registrados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    soats.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className={cn("w-3 h-3 rounded-full", getSemaforoColor(s.fecha_vencimiento))} />
                                            </TableCell>
                                            <TableCell className="font-medium">{s.equipos?.codigo}</TableCell>
                                            <TableCell>{s.equipos?.placa || "-"}</TableCell>
                                            <TableCell>{s.numero_poliza}</TableCell>
                                            <TableCell>{s.aseguradora}</TableCell>
                                            <TableCell>{formatDate(s.fecha_inicio)}</TableCell>
                                            <TableCell className="font-medium">{formatDate(s.fecha_vencimiento)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(s.monto || 0)}</TableCell>
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
