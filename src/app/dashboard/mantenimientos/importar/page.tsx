"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileSpreadsheet, Check, X, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface MantenimientoImport {
    equipo_codigo: string;
    equipo_id?: string;
    tipo: string;
    descripcion: string;
    fecha_programada: string;
    costo?: number;
    proveedor?: string;
    valid?: boolean;
    error?: string;
}

export default function ImportarMantenimientosPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [preview, setPreview] = useState<MantenimientoImport[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);
        setSuccess(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            const { data: equipos } = await supabase.from("equipos").select("id, codigo").eq("activo", true);

            const items: MantenimientoImport[] = jsonData.map((row: any) => {
                const codigo = row["Código Equipo"] || row["codigo_equipo"] || row["Equipo"] || "";
                const equipo = equipos?.find((e) => e.codigo.toLowerCase() === codigo.toLowerCase());

                const item: MantenimientoImport = {
                    equipo_codigo: codigo,
                    equipo_id: equipo?.id,
                    tipo: (row["Tipo"] || row["tipo"] || "preventivo").toLowerCase(),
                    descripcion: row["Descripción"] || row["descripcion"] || "",
                    fecha_programada: row["Fecha Programada"] || row["fecha_programada"] || row["Fecha"] || "",
                    costo: parseFloat(row["Costo"] || row["costo"]) || 0,
                    proveedor: row["Proveedor"] || row["proveedor"] || "",
                };

                if (!equipo) {
                    item.valid = false;
                    item.error = "Equipo no encontrado";
                } else if (!item.descripcion) {
                    item.valid = false;
                    item.error = "Descripción requerida";
                } else {
                    item.valid = true;
                }

                return item;
            });

            setPreview(items);
        } catch (err) {
            setError("Error al leer el archivo Excel");
        }
    };

    const handleImport = async () => {
        const valid = preview.filter((m) => m.valid);
        if (valid.length === 0) {
            setError("No hay registros válidos");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("mantenimientos").insert(
                valid.map((m) => ({
                    equipo_id: m.equipo_id,
                    tipo: m.tipo,
                    descripcion: m.descripcion,
                    fecha_programada: m.fecha_programada || null,
                    costo: m.costo || 0,
                    proveedor: m.proveedor || null,
                    estado: "pendiente",
                }))
            );

            if (insertError) throw insertError;

            setSuccess(`${valid.length} mantenimientos importados`);
            setTimeout(() => {
                router.push("/dashboard/mantenimientos");
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [{
            "Código Equipo": "EQ-001",
            "Tipo": "preventivo",
            "Descripción": "Cambio de aceite y filtros",
            "Fecha Programada": "2024-02-15",
            "Costo": 500,
            "Proveedor": "Taller XYZ",
        }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mantenimientos");
        XLSX.writeFile(wb, "plantilla_mantenimientos.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/mantenimientos"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Importar Mantenimientos</h1>
                    <p className="text-muted-foreground mt-1">Importar desde Excel</p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />Plantilla
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Archivo</CardTitle>
                    <CardDescription>Columnas: Código Equipo, Tipo, Descripción, Fecha Programada, Costo, Proveedor</CardDescription>
                </CardHeader>
                <CardContent>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50">
                        <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        {fileName ? <p className="text-lg font-medium">{fileName}</p> : <p className="text-lg">Haz clic para seleccionar</p>}
                    </div>
                </CardContent>
            </Card>

            {preview.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Vista Previa ({preview.length})</CardTitle>
                        <CardDescription>{preview.filter((m) => m.valid).length} válidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Equipo</th>
                                        <th className="p-2 text-left">Tipo</th>
                                        <th className="p-2 text-left">Descripción</th>
                                        <th className="p-2 text-left">Fecha</th>
                                        <th className="p-2 text-right">Costo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i} className={row.valid ? "" : "bg-destructive/10"}>
                                            <td className="p-2">
                                                {row.valid ? <Check className="h-4 w-4 text-green-600" /> :
                                                    <span className="text-destructive text-xs flex items-center gap-1"><X className="h-4 w-4" />{row.error}</span>}
                                            </td>
                                            <td className="p-2 font-medium">{row.equipo_codigo}</td>
                                            <td className="p-2 capitalize">{row.tipo}</td>
                                            <td className="p-2 max-w-xs truncate">{row.descripcion}</td>
                                            <td className="p-2">{row.fecha_programada}</td>
                                            <td className="p-2 text-right font-mono">S/ {row.costo?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {error && <div className="mt-4 text-destructive bg-destructive/10 p-3 rounded-md text-sm">{error}</div>}
                        {success && <div className="mt-4 text-green-700 bg-green-100 p-3 rounded-md text-sm flex items-center gap-2"><Check className="h-4 w-4" />{success}</div>}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" asChild><Link href="/dashboard/mantenimientos">Cancelar</Link></Button>
                            <Button onClick={handleImport} disabled={loading || preview.filter((m) => m.valid).length === 0}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importando...</> :
                                    <><Upload className="mr-2 h-4 w-4" />Importar {preview.filter((m) => m.valid).length}</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
