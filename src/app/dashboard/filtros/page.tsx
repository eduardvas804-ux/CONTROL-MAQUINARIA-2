"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Printer, Filter } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FILTROS_POR_MODELO, getTipoFiltroLabel, getTipoFiltroIcon } from "@/lib/filtros-data";

interface Equipo {
    id: string;
    codigo: string;
    tipo: string;
    marca: string | null;
    modelo: string | null;
    serie: string | null;
}

export default function FiltrosPage() {
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchEquipos = async () => {
            const { data } = await supabase
                .from("equipos")
                .select("id, codigo, tipo, marca, modelo, serie")
                .eq("activo", true)
                .order("codigo");
            if (data) setEquipos(data);
        };
        fetchEquipos();
    }, [supabase]);

    const handleSelectEquipo = (codigo: string) => {
        const equipo = equipos.find((e) => e.codigo === codigo);
        setSelectedEquipo(equipo || null);
    };

    const getFiltrosEquipo = () => {
        if (!selectedEquipo?.modelo) return {};
        return FILTROS_POR_MODELO[selectedEquipo.modelo] || {};
    };

    const filteredEquipos = equipos.filter((e) =>
        e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modelosStats = Object.entries(FILTROS_POR_MODELO).map(([modelo, filtros]) => ({
        modelo,
        cantidadFiltros: Object.keys(filtros).length
    }));

    const imprimirFiltros = () => {
        if (!selectedEquipo) return;
        const filtros = getFiltrosEquipo();

        const contenido = `
      <html>
      <head>
        <title>Filtros - ${selectedEquipo.codigo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #1a365d; color: white; }
          tr:nth-child(even) { background: #f4f4f4; }
          .header-info { background: #f0f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .header-info p { margin: 5px 0; }
          .footer { margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>🛢️ FILTROS PARA MANTENIMIENTO</h1>
        <div class="header-info">
          <p><strong>Equipo:</strong> ${selectedEquipo.codigo} - ${selectedEquipo.tipo}</p>
          <p><strong>Modelo:</strong> ${selectedEquipo.modelo || '-'}</p>
          <p><strong>Marca:</strong> ${selectedEquipo.marca || '-'}</p>
          <p><strong>Serie:</strong> ${selectedEquipo.serie || '-'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo de Filtro</th>
              <th>Código</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(filtros).map(([tipo, filtro], i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${getTipoFiltroLabel(tipo)}</td>
                <td><strong>${filtro.codigo}</strong></td>
                <td>${filtro.descripcion}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generado: ${new Date().toLocaleString('es-PE')} | JOMEX CONSTRUCTORA</p>
          <p>Los códigos corresponden a filtros originales CATERPILLAR</p>
        </div>
      </body>
      </html>
    `;

        const ventana = window.open('', '_blank');
        if (ventana) {
            ventana.document.write(contenido);
            ventana.document.close();
            ventana.print();
        }
    };

    const filtros = getFiltrosEquipo();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Filtros por Equipo</h1>
                <p className="text-muted-foreground mt-1">
                    Base de datos de filtros para mantenimiento por modelo de maquinaria
                </p>
            </div>

            {/* Buscador */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label>Buscar Equipo</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                                    value={selectedEquipo?.codigo || ""}
                                    onChange={(e) => handleSelectEquipo(e.target.value)}
                                >
                                    <option value="">Seleccione un equipo...</option>
                                    {filteredEquipos.map((e) => (
                                        <option key={e.id} value={e.codigo}>
                                            {e.codigo} - {e.tipo} {e.modelo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <Input
                                placeholder="Filtrar por código, tipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedEquipo ? (
                <>
                    {/* Info del equipo */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-lg bg-primary/10">
                                    <Filter className="h-8 w-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold">{selectedEquipo.tipo} - {selectedEquipo.modelo}</h2>
                                    <p className="text-muted-foreground">{selectedEquipo.codigo}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Marca:</span>
                                        <span className="ml-2 font-medium">{selectedEquipo.marca || "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Serie:</span>
                                        <span className="ml-2 font-medium">{selectedEquipo.serie || "-"}</span>
                                    </div>
                                </div>
                                <Button onClick={imprimirFiltros}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Imprimir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de filtros */}
                    {Object.keys(filtros).length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🛢️ Filtros para Mantenimiento
                                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                                        {Object.keys(filtros).length} filtros registrados
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-12">#</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Descripción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(filtros).map(([tipo, filtro], i) => (
                                                <TableRow key={tipo}>
                                                    <TableCell className="font-medium">{i + 1}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                            <span>{getTipoFiltroIcon(tipo)}</span>
                                                            {getTipoFiltroLabel(tipo)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono font-bold text-lg text-primary">
                                                            {filtro.codigo}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{filtro.descripcion}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    💡 <strong>Nota:</strong> Los códigos corresponden a filtros originales CATERPILLAR.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="text-4xl mb-4">⚠️</div>
                                <h3 className="text-lg font-semibold">Filtros no registrados</h3>
                                <p className="text-muted-foreground">
                                    No hay información de filtros para el modelo {selectedEquipo.modelo}.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                <>
                    {/* Estado vacío y tabla de modelos */}
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="text-5xl mb-4">🛢️</div>
                            <h3 className="text-xl font-semibold">Base de Datos de Filtros</h3>
                            <p className="text-muted-foreground mt-2">
                                Seleccione un equipo para ver sus filtros de mantenimiento.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>📋 Modelos con Filtros Registrados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Modelo</TableHead>
                                            <TableHead className="text-center">Cantidad de Filtros</TableHead>
                                            <TableHead>Tipos de Filtro</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modelosStats.map(({ modelo, cantidadFiltros }) => (
                                            <TableRow key={modelo}>
                                                <TableCell className="font-bold">{modelo}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                                        {cantidadFiltros}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.keys(FILTROS_POR_MODELO[modelo]).map((tipo) => (
                                                            <span key={tipo} className="text-xs bg-muted px-2 py-0.5 rounded">
                                                                {getTipoFiltroIcon(tipo)} {getTipoFiltroLabel(tipo)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
