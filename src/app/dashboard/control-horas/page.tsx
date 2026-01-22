import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function ControlHorasPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: registros, error } = await supabase
        .from("control_horas")
        .select(`
      *,
      equipos (
        codigo,
        tipo
      ),
      proyectos (
        nombre,
        codigo
      )
    `)
        .order("fecha", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Error fetching control_horas:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Control de Horas</h1>
                    <p className="text-muted-foreground mt-1">
                        Registro diario de horas trabajadas por equipo
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/control-horas/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Registro
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Registros Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Proyecto</TableHead>
                                    <TableHead>Turno</TableHead>
                                    <TableHead className="text-right">HM Inicio</TableHead>
                                    <TableHead className="text-right">HM Fin</TableHead>
                                    <TableHead className="text-right">Horas</TableHead>
                                    <TableHead>Operador</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!registros || registros.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No hay registros de control de horas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>{formatDate(r.fecha)}</TableCell>
                                            <TableCell>
                                                <span className="font-medium">{r.equipos?.codigo}</span>
                                                <span className="text-muted-foreground text-sm ml-2">{r.equipos?.tipo}</span>
                                            </TableCell>
                                            <TableCell>{r.proyectos?.nombre || "-"}</TableCell>
                                            <TableCell className="capitalize">{r.turno || "-"}</TableCell>
                                            <TableCell className="text-right font-mono">{formatNumber(r.horometro_inicio)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatNumber(r.horometro_fin)}</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">{formatNumber(r.horas_trabajadas)}</TableCell>
                                            <TableCell>{r.operador || "-"}</TableCell>
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
