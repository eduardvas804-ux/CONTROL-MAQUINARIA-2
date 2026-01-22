"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Equipo {
    id: string;
    codigo: string;
    tipo: string;
    horometro_actual: number;
}

interface Proyecto {
    id: string;
    nombre: string;
    codigo: string;
}

export default function NuevoControlHorasPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
    const [form, setForm] = useState({
        equipo_id: "",
        proyecto_id: "",
        fecha: new Date().toISOString().split("T")[0],
        turno: "mañana",
        horometro_inicio: "",
        horometro_fin: "",
        operador: "",
        actividad: "",
        observaciones: "",
    });

    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchData = async () => {
            const [equiposRes, proyectosRes] = await Promise.all([
                supabase.from("equipos").select("id, codigo, tipo, horometro_actual").eq("activo", true).order("codigo"),
                supabase.from("proyectos").select("id, nombre, codigo").eq("activo", true).order("nombre"),
            ]);

            if (equiposRes.data) setEquipos(equiposRes.data);
            if (proyectosRes.data) setProyectos(proyectosRes.data);
        };

        fetchData();
    }, [supabase]);

    const handleEquipoChange = (equipoId: string) => {
        const equipo = equipos.find((e) => e.id === equipoId);
        setSelectedEquipo(equipo || null);
        setForm({
            ...form,
            equipo_id: equipoId,
            horometro_inicio: equipo ? equipo.horometro_actual.toString() : "",
        });
    };

    const horasCalculadas = () => {
        const inicio = parseFloat(form.horometro_inicio) || 0;
        const fin = parseFloat(form.horometro_fin) || 0;
        return Math.max(0, fin - inicio);
    };

    const validarHorometro = () => {
        if (!selectedEquipo) return null;
        const inicio = parseFloat(form.horometro_inicio) || 0;
        const fin = parseFloat(form.horometro_fin) || 0;

        if (inicio < selectedEquipo.horometro_actual) {
            return `El horómetro inicial no puede ser menor al actual del equipo (${formatNumber(selectedEquipo.horometro_actual)})`;
        }
        if (fin <= inicio) {
            return "El horómetro final debe ser mayor al inicial";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errorValidacion = validarHorometro();
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("control_horas").insert({
                equipo_id: form.equipo_id,
                proyecto_id: form.proyecto_id || null,
                fecha: form.fecha,
                turno: form.turno,
                horometro_inicio: parseFloat(form.horometro_inicio),
                horometro_fin: parseFloat(form.horometro_fin),
                operador: form.operador || null,
                actividad: form.actividad || null,
                observaciones: form.observaciones || null,
            });

            if (insertError) throw insertError;

            router.push("/dashboard/control-horas");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al registrar control de horas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/control-horas">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Nuevo Control de Horas</h1>
                    <p className="text-muted-foreground mt-1">
                        Registrar horas trabajadas de un equipo
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Datos del Registro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Equipo *</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.equipo_id}
                                        onChange={(e) => handleEquipoChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccionar equipo</option>
                                        {equipos.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.codigo} - {e.tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Proyecto</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.proyecto_id}
                                        onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar proyecto</option>
                                        {proyectos.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.codigo} - {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Fecha *</Label>
                                    <Input
                                        type="date"
                                        value={form.fecha}
                                        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Turno</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.turno}
                                        onChange={(e) => setForm({ ...form, turno: e.target.value })}
                                    >
                                        <option value="mañana">Mañana</option>
                                        <option value="tarde">Tarde</option>
                                        <option value="noche">Noche</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Horómetro Inicio *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={form.horometro_inicio}
                                        onChange={(e) => setForm({ ...form, horometro_inicio: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Horómetro Fin *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={form.horometro_fin}
                                        onChange={(e) => setForm({ ...form, horometro_fin: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Operador</Label>
                                    <Input
                                        value={form.operador}
                                        onChange={(e) => setForm({ ...form, operador: e.target.value })}
                                        placeholder="Nombre del operador"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Actividad</Label>
                                    <Input
                                        value={form.actividad}
                                        onChange={(e) => setForm({ ...form, actividad: e.target.value })}
                                        placeholder="Descripción de actividad"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/dashboard/control-horas">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Guardar Registro"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Panel de información del equipo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Info del Equipo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedEquipo ? (
                            <>
                                <div>
                                    <p className="text-sm text-muted-foreground">Código</p>
                                    <p className="text-lg font-semibold">{selectedEquipo.codigo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tipo</p>
                                    <p className="font-medium">{selectedEquipo.tipo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Horómetro Actual</p>
                                    <p className="text-2xl font-bold text-primary font-mono">
                                        {formatNumber(selectedEquipo.horometro_actual)}
                                    </p>
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">Horas a Registrar</p>
                                    <p className="text-3xl font-bold text-primary font-mono">
                                        {formatNumber(horasCalculadas())}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                Seleccione un equipo para ver su información
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
