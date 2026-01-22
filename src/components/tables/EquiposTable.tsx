"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Edit, Trash2, Search, Eye } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Equipo {
    id: string;
    codigo: string;
    tipo: string;
    marca: string | null;
    modelo: string | null;
    serie: string | null;
    placa: string | null;
    anio: number | null;
    horometro_actual: number;
    tarifa_hora_default: number;
    empresas?: {
        razon_social: string;
    };
}

interface EquiposTableProps {
    equipos: Equipo[];
}

export function EquiposTable({ equipos }: EquiposTableProps) {
    const [search, setSearch] = useState("");
    const router = useRouter();

    const filtered = equipos.filter((equipo) => {
        const searchLower = search.toLowerCase();
        return (
            equipo.codigo.toLowerCase().includes(searchLower) ||
            equipo.tipo.toLowerCase().includes(searchLower) ||
            equipo.marca?.toLowerCase().includes(searchLower) ||
            equipo.modelo?.toLowerCase().includes(searchLower) ||
            equipo.placa?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código, tipo, marca, modelo o placa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <span className="text-sm text-muted-foreground">
                    {filtered.length} de {equipos.length} equipos
                </span>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Código</TableHead>
                            <TableHead className="font-semibold">Tipo</TableHead>
                            <TableHead className="font-semibold">Marca/Modelo</TableHead>
                            <TableHead className="font-semibold">Serie</TableHead>
                            <TableHead className="font-semibold">Placa</TableHead>
                            <TableHead className="font-semibold text-right">Horómetro</TableHead>
                            <TableHead className="font-semibold text-right">Tarifa/Hr</TableHead>
                            <TableHead className="font-semibold">Empresa</TableHead>
                            <TableHead className="font-semibold text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No se encontraron equipos
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((equipo) => (
                                <TableRow key={equipo.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{equipo.codigo}</TableCell>
                                    <TableCell>{equipo.tipo}</TableCell>
                                    <TableCell>
                                        {equipo.marca && equipo.modelo
                                            ? `${equipo.marca} ${equipo.modelo}`
                                            : equipo.marca || equipo.modelo || "-"}
                                    </TableCell>
                                    <TableCell>{equipo.serie || "-"}</TableCell>
                                    <TableCell>{equipo.placa || "-"}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {formatNumber(equipo.horometro_actual)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        S/ {formatNumber(equipo.tarifa_hora_default)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {equipo.empresas?.razon_social || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/equipos/${equipo.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/equipos/${equipo.id}/editar`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
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
