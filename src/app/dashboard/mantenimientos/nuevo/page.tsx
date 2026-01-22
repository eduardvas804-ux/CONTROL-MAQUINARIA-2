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
    horometro_actual: number;
}

export default function NuevoMantenimientoPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [form, setForm] = useState({
        equipo_id: "",
        tipo: "preventivo",
        descripcion: "",
        fecha_programada: "",
        horometro_mantenimiento: "",
        costo: "",
        proveedor: "",
        proximo_mantenimiento_horas: "",
        proximo_mantenimiento_fecha: "",
        observaciones: "",
    });

    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchEquipos = async () => {
            const { data } = await supabase
                .from("equipos")
                .select("id, codigo, tipo, horometro_actual")
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
            const { error: insertError } = await supabase.from("mantenimientos").insert({
                equipo_id: form.equipo_id,
                tipo: form.tipo,
                descripcion: form.descripcion,
                fecha_programada: form.fecha_programada || null,
                horometro_mantenimiento: form.horometro_mantenimiento ? parseFloat(form.horometro_mantenimiento) : null,
                costo: form.costo ? parseFloat(form.costo) : 0,
                proveedor: form.proveedor || null,
                proximo_mantenimiento_horas: form.proximo_mantenimiento_horas ? parseFloat(form.proximo_mantenimiento_horas) : null,
                proximo_mantenimiento_fecha: form.proximo_mantenimiento_fecha || null,
                observaciones: form.observaciones || null,
                estado: "pendiente",
            });

            if (insertError) throw insertError;

            router.push("/dashboard/mantenimientos");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al crear el mantenimiento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/mantenimientos">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Nuevo Mantenimiento</h1>
                    <p className="text-muted-foreground mt-1">Programar mantenimiento de equipo</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Datos del Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Equipo *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.equipo_id}
                                    onChange={(e) => setForm({ ...form, equipo_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar equipo</option>
                                    {equipos.map((e) => (
                                        <option key={e.id} value={e.id}>{e.codigo} - {e.tipo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.tipo}
                                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                    required
                                >
                                    <option value="preventivo">Preventivo</option>
                                    <option value="correctivo">Correctivo</option>
                                    <option value="emergencia">Emergencia</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Descripción *</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    placeholder="Descripción del mantenimiento a realizar"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Programada</Label>
                                <Input
                                    type="date"
                                    value={form.fecha_programada}
                                    onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Horómetro al Mantenimiento</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.horometro_mantenimiento}
                                    onChange={(e) => setForm({ ...form, horometro_mantenimiento: e.target.value })}
                                    placeholder="0.00"
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
                            <div className="space-y-2">
                                <Label>Proveedor</Label>
                                <Input
                                    value={form.proveedor}
                                    onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                                    placeholder="Nombre del proveedor/taller"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Próximo Mant. (Horas)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.proximo_mantenimiento_horas}
                                    onChange={(e) => setForm({ ...form, proximo_mantenimiento_horas: e.target.value })}
                                    placeholder="Ej: 250"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Próximo Mant. (Fecha)</Label>
                                <Input
                                    type="date"
                                    value={form.proximo_mantenimiento_fecha}
                                    onChange={(e) => setForm({ ...form, proximo_mantenimiento_fecha: e.target.value })}
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
                                <Link href="/dashboard/mantenimientos">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Mantenimiento"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
