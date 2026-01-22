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
    if (dias <= 15) return "bg-red-400";
    if (dias <= 30) return "bg-yellow-400";
    return "bg-green-400";
}

export default async function RevisionesPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: revisiones, error } = await supabase
        .from("revisiones_tecnicas")
        .select(`
      *,
      equipos (
        codigo,
        tipo,
        placa
      )
    `)
        .order("fecha_vencimiento", { ascending: true });

    if (error) {
        console.error("Error fetching revisiones_tecnicas:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Revisiones Técnicas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de revisiones técnicas vehiculares
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/revisiones/importar">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Excel
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/revisiones/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Revisión
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
                    <CardTitle className="text-lg">Lista de Revisiones Técnicas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Placa</TableHead>
                                    <TableHead>N° Certificado</TableHead>
                                    <TableHead>Taller</TableHead>
                                    <TableHead>Fecha Revisión</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead className="text-center">Resultado</TableHead>
                                    <TableHead className="text-right">Costo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!revisiones || revisiones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No hay revisiones técnicas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    revisiones.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>
                                                <div className={cn("w-3 h-3 rounded-full", getSemaforoColor(r.fecha_vencimiento))} />
                                            </TableCell>
                                            <TableCell className="font-medium">{r.equipos?.codigo}</TableCell>
                                            <TableCell>{r.equipos?.placa || "-"}</TableCell>
                                            <TableCell>{r.numero_certificado || "-"}</TableCell>
                                            <TableCell>{r.taller || "-"}</TableCell>
                                            <TableCell>{formatDate(r.fecha_revision)}</TableCell>
                                            <TableCell className="font-medium">{formatDate(r.fecha_vencimiento)}</TableCell>
                                            <TableCell className="text-center">
                                                {r.resultado && (
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-medium",
                                                        r.resultado === "aprobado" ? "bg-green-100 text-green-800" :
                                                            r.resultado === "observado" ? "bg-yellow-100 text-yellow-800" :
                                                                "bg-red-100 text-red-800"
                                                    )}>
                                                        {r.resultado.charAt(0).toUpperCase() + r.resultado.slice(1)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(r.costo || 0)}</TableCell>
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
