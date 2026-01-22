"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileSpreadsheet, Check, X, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface RevisionImport {
    equipo_codigo: string;
    equipo_id?: string;
    numero_certificado: string;
    taller: string;
    fecha_revision: string;
    fecha_vencimiento: string;
    resultado: string;
    costo?: number;
    valid?: boolean;
    error?: string;
}

export default function ImportarRevisionesPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [preview, setPreview] = useState<RevisionImport[]>([]);
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

            const { data: equipos } = await supabase.from("equipos").select("id, codigo, placa").eq("activo", true);

            const items: RevisionImport[] = jsonData.map((row: any) => {
                const codigo = row["Código Equipo"] || row["codigo_equipo"] || row["Equipo"] || "";
                const equipo = equipos?.find((e) =>
                    e.codigo.toLowerCase() === codigo.toLowerCase() ||
                    e.placa?.toLowerCase() === codigo.toLowerCase()
                );

                const item: RevisionImport = {
                    equipo_codigo: codigo,
                    equipo_id: equipo?.id,
                    numero_certificado: row["Número Certificado"] || row["numero_certificado"] || row["Certificado"] || "",
                    taller: row["Taller"] || row["taller"] || row["Centro"] || "",
                    fecha_revision: row["Fecha Revisión"] || row["fecha_revision"] || "",
                    fecha_vencimiento: row["Fecha Vencimiento"] || row["fecha_vencimiento"] || row["Vencimiento"] || "",
                    resultado: (row["Resultado"] || row["resultado"] || "aprobado").toLowerCase(),
                    costo: parseFloat(row["Costo"] || row["costo"]) || 0,
                };

                if (!equipo) {
                    item.valid = false;
                    item.error = "Equipo no encontrado";
                } else if (!item.fecha_revision || !item.fecha_vencimiento) {
                    item.valid = false;
                    item.error = "Fechas requeridas";
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
        const valid = preview.filter((r) => r.valid);
        if (valid.length === 0) {
            setError("No hay registros válidos");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("revisiones_tecnicas").insert(
                valid.map((r) => ({
                    equipo_id: r.equipo_id,
                    numero_certificado: r.numero_certificado || null,
                    taller: r.taller || null,
                    fecha_revision: r.fecha_revision,
                    fecha_vencimiento: r.fecha_vencimiento,
                    resultado: r.resultado,
                    costo: r.costo || 0,
                }))
            );

            if (insertError) throw insertError;

            setSuccess(`${valid.length} revisiones importadas`);
            setTimeout(() => {
                router.push("/dashboard/revisiones");
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
            "Número Certificado": "CERT-12345",
            "Taller": "Centro Revisión ABC",
            "Fecha Revisión": "2024-01-15",
            "Fecha Vencimiento": "2025-01-15",
            "Resultado": "aprobado",
            "Costo": 180,
        }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Revisiones");
        XLSX.writeFile(wb, "plantilla_revisiones.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/revisiones"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Importar Revisiones Técnicas</h1>
                    <p className="text-muted-foreground mt-1">Importar desde Excel</p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />Plantilla
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Archivo</CardTitle>
                    <CardDescription>Columnas: Código Equipo, Número Certificado, Taller, Fecha Revisión, Fecha Vencimiento, Resultado, Costo</CardDescription>
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
                        <CardDescription>{preview.filter((r) => r.valid).length} válidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Equipo</th>
                                        <th className="p-2 text-left">Certificado</th>
                                        <th className="p-2 text-left">Revisión</th>
                                        <th className="p-2 text-left">Vencimiento</th>
                                        <th className="p-2 text-left">Resultado</th>
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
                                            <td className="p-2">{row.numero_certificado || "-"}</td>
                                            <td className="p-2">{row.fecha_revision}</td>
                                            <td className="p-2">{row.fecha_vencimiento}</td>
                                            <td className="p-2 capitalize">{row.resultado}</td>
                                            <td className="p-2 text-right font-mono">S/ {row.costo?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {error && <div className="mt-4 text-destructive bg-destructive/10 p-3 rounded-md text-sm">{error}</div>}
                        {success && <div className="mt-4 text-green-700 bg-green-100 p-3 rounded-md text-sm flex items-center gap-2"><Check className="h-4 w-4" />{success}</div>}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" asChild><Link href="/dashboard/revisiones">Cancelar</Link></Button>
                            <Button onClick={handleImport} disabled={loading || preview.filter((r) => r.valid).length === 0}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importando...</> :
                                    <><Upload className="mr-2 h-4 w-4" />Importar {preview.filter((r) => r.valid).length}</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
