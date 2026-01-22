"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileSpreadsheet, Check, X, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface EquipoImport {
    codigo: string;
    tipo: string;
    marca?: string;
    modelo?: string;
    serie?: string;
    placa?: string;
    anio?: number;
    horometro_actual?: number;
    tarifa_hora_default?: number;
    valid?: boolean;
    error?: string;
}

export default function ImportarEquiposPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [preview, setPreview] = useState<EquipoImport[]>([]);
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

            const equipos: EquipoImport[] = jsonData.map((row: any) => {
                const equipo: EquipoImport = {
                    codigo: row["Código"] || row["codigo"] || row["CODIGO"] || "",
                    tipo: row["Tipo"] || row["tipo"] || row["TIPO"] || "",
                    marca: row["Marca"] || row["marca"] || row["MARCA"] || "",
                    modelo: row["Modelo"] || row["modelo"] || row["MODELO"] || "",
                    serie: row["Serie"] || row["serie"] || row["SERIE"] || "",
                    placa: row["Placa"] || row["placa"] || row["PLACA"] || "",
                    anio: parseInt(row["Año"] || row["año"] || row["AÑO"] || row["anio"]) || undefined,
                    horometro_actual: parseFloat(row["Horómetro"] || row["horometro"] || row["Horometro"] || row["HOROMETRO"]) || 0,
                    tarifa_hora_default: parseFloat(row["Tarifa"] || row["tarifa"] || row["TARIFA"] || row["Tarifa/Hora"]) || 0,
                };

                // Validar
                if (!equipo.codigo) {
                    equipo.valid = false;
                    equipo.error = "Código requerido";
                } else if (!equipo.tipo) {
                    equipo.valid = false;
                    equipo.error = "Tipo requerido";
                } else {
                    equipo.valid = true;
                }

                return equipo;
            });

            setPreview(equipos);
        } catch (err) {
            setError("Error al leer el archivo Excel");
            console.error(err);
        }
    };

    const handleImport = async () => {
        const validEquipos = preview.filter((e) => e.valid);
        if (validEquipos.length === 0) {
            setError("No hay equipos válidos para importar");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("equipos").insert(
                validEquipos.map((e) => ({
                    codigo: e.codigo,
                    tipo: e.tipo,
                    marca: e.marca || null,
                    modelo: e.modelo || null,
                    serie: e.serie || null,
                    placa: e.placa || null,
                    anio: e.anio || null,
                    horometro_actual: e.horometro_actual || 0,
                    tarifa_hora_default: e.tarifa_hora_default || 0,
                }))
            );

            if (insertError) throw insertError;

            setSuccess(`${validEquipos.length} equipos importados correctamente`);
            setTimeout(() => {
                router.push("/dashboard/equipos");
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Error al importar equipos");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                "Código": "EQ-001",
                "Tipo": "Excavadora",
                "Marca": "Caterpillar",
                "Modelo": "320D",
                "Serie": "CAT320D001",
                "Placa": "ABC-123",
                "Año": 2020,
                "Horómetro": 1500,
                "Tarifa": 180,
            },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Equipos");
        XLSX.writeFile(wb, "plantilla_equipos.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/equipos">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">Importar Equipos</h1>
                    <p className="text-muted-foreground mt-1">Importar equipos desde archivo Excel</p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Plantilla
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Archivo</CardTitle>
                    <CardDescription>
                        Sube un archivo Excel (.xlsx, .xls) con los datos de los equipos.
                        Las columnas esperadas son: Código, Tipo, Marca, Modelo, Serie, Placa, Año, Horómetro, Tarifa
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        {fileName ? (
                            <p className="text-lg font-medium">{fileName}</p>
                        ) : (
                            <>
                                <p className="text-lg font-medium">Haz clic para seleccionar archivo</p>
                                <p className="text-sm text-muted-foreground">o arrastra y suelta aquí</p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {preview.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Vista Previa ({preview.length} registros)</CardTitle>
                        <CardDescription>
                            {preview.filter((e) => e.valid).length} válidos, {preview.filter((e) => !e.valid).length} con errores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Código</th>
                                        <th className="p-2 text-left">Tipo</th>
                                        <th className="p-2 text-left">Marca</th>
                                        <th className="p-2 text-left">Modelo</th>
                                        <th className="p-2 text-left">Serie</th>
                                        <th className="p-2 text-left">Placa</th>
                                        <th className="p-2 text-right">Horómetro</th>
                                        <th className="p-2 text-right">Tarifa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i} className={row.valid ? "" : "bg-destructive/10"}>
                                            <td className="p-2">
                                                {row.valid ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <span className="flex items-center gap-1 text-destructive">
                                                        <X className="h-4 w-4" />
                                                        <span className="text-xs">{row.error}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-2 font-medium">{row.codigo || "-"}</td>
                                            <td className="p-2">{row.tipo || "-"}</td>
                                            <td className="p-2">{row.marca || "-"}</td>
                                            <td className="p-2">{row.modelo || "-"}</td>
                                            <td className="p-2">{row.serie || "-"}</td>
                                            <td className="p-2">{row.placa || "-"}</td>
                                            <td className="p-2 text-right font-mono">{row.horometro_actual?.toFixed(2) || "0"}</td>
                                            <td className="p-2 text-right font-mono">{row.tarifa_hora_default?.toFixed(2) || "0"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {error && (
                            <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mt-4 text-sm text-green-700 bg-green-100 p-3 rounded-md flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                {success}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/dashboard/equipos">Cancelar</Link>
                            </Button>
                            <Button onClick={handleImport} disabled={loading || preview.filter((e) => e.valid).length === 0}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Importar {preview.filter((e) => e.valid).length} Equipos
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
