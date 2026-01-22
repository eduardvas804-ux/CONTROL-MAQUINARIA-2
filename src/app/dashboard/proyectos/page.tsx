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

export default async function ProyectosPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: proyectos, error } = await supabase
        .from("proyectos")
        .select(`
      *,
      empresas (
        razon_social
      )
    `)
        .eq("activo", true)
        .order("codigo", { ascending: true });

    if (error) {
        console.error("Error fetching proyectos:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de proyectos de construcción
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/proyectos/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proyecto
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lista de Proyectos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!proyectos || proyectos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No hay proyectos registrados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    proyectos.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.codigo}</TableCell>
                                            <TableCell>{p.nombre}</TableCell>
                                            <TableCell>{p.cliente || "-"}</TableCell>
                                            <TableCell>{p.empresas?.razon_social || "-"}</TableCell>
                                            <TableCell className="max-w-xs truncate">{p.ubicacion || "-"}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/proyectos/${p.id}`}>Ver</Link>
                                                </Button>
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
