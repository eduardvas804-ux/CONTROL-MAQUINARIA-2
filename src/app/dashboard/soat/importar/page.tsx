"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileSpreadsheet, Check, X, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface SoatImport {
    equipo_codigo: string;
    equipo_id?: string;
    numero_poliza: string;
    aseguradora: string;
    fecha_inicio: string;
    fecha_vencimiento: string;
    monto?: number;
    valid?: boolean;
    error?: string;
}

export default function ImportarSoatPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [preview, setPreview] = useState<SoatImport[]>([]);
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

            // Obtener equipos para validar
            const { data: equipos } = await supabase
                .from("equipos")
                .select("id, codigo, placa")
                .eq("activo", true);

            const soats: SoatImport[] = jsonData.map((row: any) => {
                const codigo = row["Código Equipo"] || row["codigo_equipo"] || row["Equipo"] || row["equipo"] || "";
                const equipo = equipos?.find((e) =>
                    e.codigo.toLowerCase() === codigo.toLowerCase() ||
                    e.placa?.toLowerCase() === codigo.toLowerCase()
                );

                const soat: SoatImport = {
                    equipo_codigo: codigo,
                    equipo_id: equipo?.id,
                    numero_poliza: row["Número Póliza"] || row["numero_poliza"] || row["Poliza"] || "",
                    aseguradora: row["Aseguradora"] || row["aseguradora"] || "",
                    fecha_inicio: row["Fecha Inicio"] || row["fecha_inicio"] || "",
                    fecha_vencimiento: row["Fecha Vencimiento"] || row["fecha_vencimiento"] || row["Vencimiento"] || "",
                    monto: parseFloat(row["Monto"] || row["monto"]) || 0,
                };

                if (!equipo) {
                    soat.valid = false;
                    soat.error = "Equipo no encontrado";
                } else if (!soat.numero_poliza) {
                    soat.valid = false;
                    soat.error = "N° Póliza requerido";
                } else if (!soat.aseguradora) {
                    soat.valid = false;
                    soat.error = "Aseguradora requerida";
                } else if (!soat.fecha_inicio || !soat.fecha_vencimiento) {
                    soat.valid = false;
                    soat.error = "Fechas requeridas";
                } else {
                    soat.valid = true;
                }

                return soat;
            });

            setPreview(soats);
        } catch (err) {
            setError("Error al leer el archivo Excel");
            console.error(err);
        }
    };

    const handleImport = async () => {
        const validSoats = preview.filter((s) => s.valid);
        if (validSoats.length === 0) {
            setError("No hay registros válidos para importar");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("soat").insert(
                validSoats.map((s) => ({
                    equipo_id: s.equipo_id,
                    numero_poliza: s.numero_poliza,
                    aseguradora: s.aseguradora,
                    fecha_inicio: s.fecha_inicio,
                    fecha_vencimiento: s.fecha_vencimiento,
                    monto: s.monto || 0,
                    activo: true,
                }))
            );

            if (insertError) throw insertError;

            setSuccess(`${validSoats.length} SOATs importados correctamente`);
            setTimeout(() => {
                router.push("/dashboard/soat");
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Error al importar");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [{
            "Código Equipo": "EQ-001",
            "Número Póliza": "POL-12345",
            "Aseguradora": "Rímac",
            "Fecha Inicio": "2024-01-01",
            "Fecha Vencimiento": "2025-01-01",
            "Monto": 250,
        }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SOAT");
        XLSX.writeFile(wb, "plantilla_soat.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/soat"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Importar SOAT</h1>
                    <p className="text-muted-foreground mt-1">Importar registros de SOAT desde Excel</p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />Plantilla
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Archivo</CardTitle>
                    <CardDescription>Columnas: Código Equipo, Número Póliza, Aseguradora, Fecha Inicio, Fecha Vencimiento, Monto</CardDescription>
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
                        <CardTitle>Vista Previa ({preview.length} registros)</CardTitle>
                        <CardDescription>{preview.filter((s) => s.valid).length} válidos, {preview.filter((s) => !s.valid).length} con errores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Equipo</th>
                                        <th className="p-2 text-left">Póliza</th>
                                        <th className="p-2 text-left">Aseguradora</th>
                                        <th className="p-2 text-left">Inicio</th>
                                        <th className="p-2 text-left">Vencimiento</th>
                                        <th className="p-2 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i} className={row.valid ? "" : "bg-destructive/10"}>
                                            <td className="p-2">
                                                {row.valid ? <Check className="h-4 w-4 text-green-600" /> :
                                                    <span className="flex items-center gap-1 text-destructive text-xs"><X className="h-4 w-4" />{row.error}</span>}
                                            </td>
                                            <td className="p-2 font-medium">{row.equipo_codigo}</td>
                                            <td className="p-2">{row.numero_poliza}</td>
                                            <td className="p-2">{row.aseguradora}</td>
                                            <td className="p-2">{row.fecha_inicio}</td>
                                            <td className="p-2">{row.fecha_vencimiento}</td>
                                            <td className="p-2 text-right font-mono">S/ {row.monto?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {error && <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                        {success && <div className="mt-4 text-sm text-green-700 bg-green-100 p-3 rounded-md flex items-center gap-2"><Check className="h-4 w-4" />{success}</div>}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" asChild><Link href="/dashboard/soat">Cancelar</Link></Button>
                            <Button onClick={handleImport} disabled={loading || preview.filter((s) => s.valid).length === 0}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importando...</> :
                                    <><Upload className="mr-2 h-4 w-4" />Importar {preview.filter((s) => s.valid).length}</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
