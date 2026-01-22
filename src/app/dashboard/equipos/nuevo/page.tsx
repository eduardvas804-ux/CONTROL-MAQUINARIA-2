"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const equipoSchema = z.object({
    codigo: z.string().min(1, "El código es requerido"),
    tipo: z.string().min(1, "El tipo es requerido"),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    serie: z.string().optional(),
    placa: z.string().optional(),
    anio: z.number().min(1900).max(2100).optional().nullable(),
    horometro_actual: z.number().min(0).default(0),
    tarifa_hora_default: z.number().min(0).default(0),
    empresa_id: z.string().uuid().optional().nullable(),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

export default function NuevoEquipoPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EquipoFormData>({
        resolver: zodResolver(equipoSchema) as any,
        defaultValues: {
            horometro_actual: 0,
            tarifa_hora_default: 0,
        },
    });

    const onSubmit = async (data: EquipoFormData) => {
        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from("equipos")
                .insert({
                    ...data,
                    anio: data.anio || null,
                    empresa_id: data.empresa_id || null,
                });

            if (insertError) {
                throw insertError;
            }

            router.push("/dashboard/equipos");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al crear el equipo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/equipos">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Nuevo Equipo</h1>
                    <p className="text-muted-foreground mt-1">
                        Registrar un nuevo equipo en el sistema
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Datos del Equipo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código *</Label>
                                <Input
                                    id="codigo"
                                    {...register("codigo")}
                                    placeholder="EQ-001"
                                    disabled={loading}
                                />
                                {errors.codigo && (
                                    <p className="text-sm text-destructive">{errors.codigo.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo *</Label>
                                <Input
                                    id="tipo"
                                    {...register("tipo")}
                                    placeholder="Excavadora, Cargador, etc."
                                    disabled={loading}
                                />
                                {errors.tipo && (
                                    <p className="text-sm text-destructive">{errors.tipo.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="marca">Marca</Label>
                                <Input
                                    id="marca"
                                    {...register("marca")}
                                    placeholder="Caterpillar, Komatsu, etc."
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="modelo">Modelo</Label>
                                <Input
                                    id="modelo"
                                    {...register("modelo")}
                                    placeholder="320D, PC200, etc."
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="serie">Serie</Label>
                                <Input
                                    id="serie"
                                    {...register("serie")}
                                    placeholder="Número de serie"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="placa">Placa</Label>
                                <Input
                                    id="placa"
                                    {...register("placa")}
                                    placeholder="ABC-123"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="anio">Año</Label>
                                <Input
                                    id="anio"
                                    type="number"
                                    {...register("anio", { valueAsNumber: true })}
                                    placeholder="2020"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="horometro_actual">Horómetro Actual</Label>
                                <Input
                                    id="horometro_actual"
                                    type="number"
                                    step="0.01"
                                    {...register("horometro_actual", { valueAsNumber: true })}
                                    placeholder="0.00"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="tarifa_hora_default">Tarifa por Hora (S/)</Label>
                                <Input
                                    id="tarifa_hora_default"
                                    type="number"
                                    step="0.01"
                                    {...register("tarifa_hora_default", { valueAsNumber: true })}
                                    placeholder="0.00"
                                    disabled={loading}
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
                                <Link href="/dashboard/equipos">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Equipo"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
