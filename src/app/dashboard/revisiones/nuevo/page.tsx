"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Equipo {
    id: string;
    codigo: string;
    tipo: string;
    placa: string | null;
}

export default function NuevaRevisionPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [form, setForm] = useState({
        equipo_id: "",
        numero_certificado: "",
        taller: "",
        fecha_revision: "",
        fecha_vencimiento: "",
        resultado: "aprobado",
        costo: "",
        observaciones: "",
    });

    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchEquipos = async () => {
            const { data } = await supabase
                .from("equipos")
                .select("id, codigo, tipo, placa")
                .eq("activo", true)
                .order("codigo");
            if (data) setEquipos(data);
        };
        fetchEquipos();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("revisiones_tecnicas").insert({
                equipo_id: form.equipo_id,
                numero_certificado: form.numero_certificado || null,
                taller: form.taller || null,
                fecha_revision: form.fecha_revision,
                fecha_vencimiento: form.fecha_vencimiento,
                resultado: form.resultado,
                costo: form.costo ? parseFloat(form.costo) : null,
                observaciones: form.observaciones || null,
            });

            if (insertError) throw insertError;

            router.push("/dashboard/revisiones");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al registrar la revisión técnica");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/revisiones">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Nueva Revisión Técnica</h1>
                    <p className="text-muted-foreground mt-1">Registrar revisión técnica vehicular</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Datos de la Revisión</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Equipo/Vehículo *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.equipo_id}
                                    onChange={(e) => setForm({ ...form, equipo_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar equipo</option>
                                    {equipos.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.codigo} - {e.tipo} {e.placa ? `(${e.placa})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Resultado *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.resultado}
                                    onChange={(e) => setForm({ ...form, resultado: e.target.value })}
                                    required
                                >
                                    <option value="aprobado">Aprobado</option>
                                    <option value="observado">Observado</option>
                                    <option value="rechazado">Rechazado</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>N° Certificado</Label>
                                <Input
                                    value={form.numero_certificado}
                                    onChange={(e) => setForm({ ...form, numero_certificado: e.target.value })}
                                    placeholder="Número de certificado"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Taller / Centro</Label>
                                <Input
                                    value={form.taller}
                                    onChange={(e) => setForm({ ...form, taller: e.target.value })}
                                    placeholder="Nombre del centro de revisión"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Revisión *</Label>
                                <Input
                                    type="date"
                                    value={form.fecha_revision}
                                    onChange={(e) => setForm({ ...form, fecha_revision: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Vencimiento *</Label>
                                <Input
                                    type="date"
                                    value={form.fecha_vencimiento}
                                    onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Costo (S/)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.costo}
                                    onChange={(e) => setForm({ ...form, costo: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Observaciones</Label>
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.observaciones}
                                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                                    placeholder="Observaciones adicionales"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/dashboard/revisiones">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Revisión"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
