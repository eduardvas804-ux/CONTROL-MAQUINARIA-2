"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Download, Search } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, cn } from "@/lib/utils";

interface Valorizacion {
    id: string;
    numero_valorizacion: string;
    periodo_inicio: string;
    periodo_fin: string;
    monto_total: number;
    estado: string;
    proyectos?: {
        nombre: string;
        codigo: string;
    };
    empresas?: {
        razon_social: string;
    };
}

interface ValorizacionesTableProps {
    valorizaciones: Valorizacion[];
}

export function ValorizacionesTable({ valorizaciones }: ValorizacionesTableProps) {
    const [search, setSearch] = useState("");

    const filtered = valorizaciones.filter((v) => {
        const searchLower = search.toLowerCase();
        return (
            v.numero_valorizacion.toLowerCase().includes(searchLower) ||
            v.proyectos?.nombre.toLowerCase().includes(searchLower) ||
            v.proyectos?.codigo.toLowerCase().includes(searchLower) ||
            v.empresas?.razon_social.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por número, proyecto o empresa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <span className="text-sm text-muted-foreground">
                    {filtered.length} de {valorizaciones.length} valorizaciones
                </span>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">N° Valorización</TableHead>
                            <TableHead className="font-semibold">Proyecto</TableHead>
                            <TableHead className="font-semibold">Empresa</TableHead>
                            <TableHead className="font-semibold">Periodo</TableHead>
                            <TableHead className="font-semibold text-right">Monto Total</TableHead>
                            <TableHead className="font-semibold text-center">Estado</TableHead>
                            <TableHead className="font-semibold text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No se encontraron valorizaciones
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((v) => (
                                <TableRow key={v.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{v.numero_valorizacion}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{v.proyectos?.nombre || "-"}</p>
                                            <p className="text-sm text-muted-foreground">{v.proyectos?.codigo}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{v.empresas?.razon_social || "-"}</TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {formatDate(v.periodo_inicio)} - {formatDate(v.periodo_fin)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-semibold">
                                        {formatCurrency(v.monto_total)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            getStatusColor(v.estado)
                                        )}>
                                            {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/valorizaciones/${v.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/valorizaciones/${v.id}/editar`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
