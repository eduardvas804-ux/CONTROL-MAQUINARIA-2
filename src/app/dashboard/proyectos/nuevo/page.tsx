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

interface Empresa {
    id: string;
    razon_social: string;
}

export default function NuevoProyectoPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [form, setForm] = useState({
        codigo: "",
        nombre: "",
        cliente: "",
        empresa_id: "",
        ubicacion: "",
        fecha_inicio: "",
        fecha_fin: "",
    });

    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchEmpresas = async () => {
            const { data } = await supabase
                .from("empresas")
                .select("id, razon_social")
                .eq("activo", true);
            if (data) setEmpresas(data);
        };
        fetchEmpresas();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("proyectos").insert({
                codigo: form.codigo,
                nombre: form.nombre,
                cliente: form.cliente || null,
                empresa_id: form.empresa_id || null,
                ubicacion: form.ubicacion || null,
                fecha_inicio: form.fecha_inicio || null,
                fecha_fin: form.fecha_fin || null,
            });

            if (insertError) throw insertError;

            router.push("/dashboard/proyectos");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al crear el proyecto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/proyectos">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Nuevo Proyecto</h1>
                    <p className="text-muted-foreground mt-1">Registrar un nuevo proyecto</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Datos del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código *</Label>
                                <Input
                                    value={form.codigo}
                                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                    placeholder="PROY-001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Nombre del proyecto"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Input
                                    value={form.cliente}
                                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Empresa</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.empresa_id}
                                    onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
                                >
                                    <option value="">Seleccionar empresa</option>
                                    {empresas.map((e) => (
                                        <option key={e.id} value={e.id}>{e.razon_social}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Inicio</Label>
                                <Input
                                    type="date"
                                    value={form.fecha_inicio}
                                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Fin</Label>
                                <Input
                                    type="date"
                                    value={form.fecha_fin}
                                    onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Ubicación</Label>
                                <Input
                                    value={form.ubicacion}
                                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                                    placeholder="Dirección o coordenadas"
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
                                <Link href="/dashboard/proyectos">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Proyecto"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
