"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus, Trash2, Download, Search, X } from "lucide-react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface Equipo {
    id: string;
    codigo: string;
    tipo: string;
    marca: string | null;
    modelo: string | null;
    serie: string | null;
    placa: string | null;
    horometro_actual: number;
    tarifa_hora_default: number;
}

interface Proyecto {
    id: string;
    nombre: string;
    codigo: string;
}

interface Empresa {
    id: string;
    razon_social: string;
    ruc: string;
}

interface EquipoTab {
    id: string;
    equipo_id: string;
    codigo: string;
    tipo: string;
    serie: string;
    modelo: string;
    placa: string;
    horometro_inicial: number;
    horometro_final: number;
    total_horas: number;
    tarifa_hora: number;
    subtotal: number;
    movilizacion: number;
    desmovilizacion: number;
    total: number;
    observaciones: string;
}

const createEmptyTab = (): EquipoTab => ({
    id: crypto.randomUUID(),
    equipo_id: "",
    codigo: "",
    tipo: "",
    serie: "",
    modelo: "",
    placa: "",
    horometro_inicial: 0,
    horometro_final: 0,
    total_horas: 0,
    tarifa_hora: 0,
    subtotal: 0,
    movilizacion: 0,
    desmovilizacion: 0,
    total: 0,
    observaciones: "",
});

export default function NuevaValorizacionPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [tabs, setTabs] = useState<EquipoTab[]>([createEmptyTab()]);
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [form, setForm] = useState({
        numero_valorizacion: "",
        proyecto_id: "",
        empresa_id: "",
        periodo_inicio: "",
        periodo_fin: "",
        observaciones: "",
    });

    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchData = async () => {
            const [equiposRes, proyectosRes, empresasRes] = await Promise.all([
                supabase.from("equipos").select("*").eq("activo", true).order("codigo"),
                supabase.from("proyectos").select("*").eq("activo", true).order("nombre"),
                supabase.from("empresas").select("*").eq("activo", true),
            ]);

            if (equiposRes.data) setEquipos(equiposRes.data);
            if (proyectosRes.data) setProyectos(proyectosRes.data);
            if (empresasRes.data) setEmpresas(empresasRes.data);
        };

        fetchData();
    }, [supabase]);

    const calcularTab = useCallback((tab: EquipoTab): EquipoTab => {
        const total_horas = Math.max(0, tab.horometro_final - tab.horometro_inicial);
        const subtotal = total_horas * tab.tarifa_hora;
        const total = subtotal + (tab.movilizacion || 0) + (tab.desmovilizacion || 0);
        return { ...tab, total_horas, subtotal, total };
    }, []);

    const handleCodigoChange = (codigo: string) => {
        const equipo = equipos.find((e) => e.codigo.toLowerCase() === codigo.toLowerCase());

        setTabs((prev) => {
            const newTabs = [...prev];
            if (equipo) {
                newTabs[activeTab] = calcularTab({
                    ...newTabs[activeTab],
                    codigo: equipo.codigo,
                    equipo_id: equipo.id,
                    tipo: equipo.tipo,
                    serie: equipo.serie || "",
                    modelo: equipo.modelo || "",
                    placa: equipo.placa || "",
                    horometro_inicial: equipo.horometro_actual,
                    tarifa_hora: equipo.tarifa_hora_default,
                });
            } else {
                newTabs[activeTab] = { ...newTabs[activeTab], codigo };
            }
            return newTabs;
        });
        setShowSearch(false);
    };

    const handleSelectEquipo = (equipo: Equipo) => {
        setTabs((prev) => {
            const newTabs = [...prev];
            newTabs[activeTab] = calcularTab({
                ...newTabs[activeTab],
                codigo: equipo.codigo,
                equipo_id: equipo.id,
                tipo: equipo.tipo,
                serie: equipo.serie || "",
                modelo: equipo.modelo || "",
                placa: equipo.placa || "",
                horometro_inicial: equipo.horometro_actual,
                tarifa_hora: equipo.tarifa_hora_default,
            });
            return newTabs;
        });
        setShowSearch(false);
        setSearchTerm("");
    };

    const handleTabChange = (field: keyof EquipoTab, value: string | number) => {
        setTabs((prev) => {
            const newTabs = [...prev];
            const numericFields = ["horometro_inicial", "horometro_final", "tarifa_hora", "movilizacion", "desmovilizacion"];
            newTabs[activeTab] = calcularTab({
                ...newTabs[activeTab],
                [field]: numericFields.includes(field) ? parseFloat(value as string) || 0 : value,
            });
            return newTabs;
        });
    };

    const addTab = () => {
        setTabs((prev) => [...prev, createEmptyTab()]);
        setActiveTab(tabs.length);
    };

    const removeTab = (index: number) => {
        if (tabs.length > 1) {
            setTabs((prev) => prev.filter((_, i) => i !== index));
            if (activeTab >= index && activeTab > 0) {
                setActiveTab(activeTab - 1);
            }
        }
    };

    const resumen = {
        total_equipos: tabs.filter(t => t.equipo_id).length,
        total_horas: tabs.reduce((sum, t) => sum + t.total_horas, 0),
        subtotal_equipos: tabs.reduce((sum, t) => sum + t.subtotal, 0),
        total_movilizacion: tabs.reduce((sum, t) => sum + (t.movilizacion || 0), 0),
        total_desmovilizacion: tabs.reduce((sum, t) => sum + (t.desmovilizacion || 0), 0),
        monto_total: tabs.reduce((sum, t) => sum + t.total, 0),
    };

    const filteredEquipos = equipos.filter((e) =>
        e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.placa?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: valorizacion, error: valError } = await supabase
                .from("valorizaciones")
                .insert({
                    numero_valorizacion: form.numero_valorizacion,
                    proyecto_id: form.proyecto_id || null,
                    empresa_id: form.empresa_id || null,
                    periodo_inicio: form.periodo_inicio,
                    periodo_fin: form.periodo_fin,
                    observaciones: form.observaciones || null,
                    estado: "borrador",
                })
                .select()
                .single();

            if (valError) throw valError;

            const validTabs = tabs.filter((t) => t.equipo_id && t.horometro_final > 0);
            if (validTabs.length > 0) {
                const { error: detalleError } = await supabase
                    .from("valorizacion_equipos")
                    .insert(
                        validTabs.map((t) => ({
                            valorizacion_id: valorizacion.id,
                            equipo_id: t.equipo_id,
                            horometro_inicial: t.horometro_inicial,
                            horometro_final: t.horometro_final,
                            tarifa_hora: t.tarifa_hora,
                            movilizacion: t.movilizacion,
                            desmovilizacion: t.desmovilizacion,
                            observaciones: t.observaciones || null,
                        }))
                    );

                if (detalleError) throw detalleError;
            }

            router.push("/dashboard/valorizaciones");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al crear la valorización");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const empresa = empresas.find((e) => e.id === form.empresa_id);
        const proyecto = proyectos.find((p) => p.id === form.proyecto_id);

        const data = tabs.filter(t => t.equipo_id).map((t) => ({
            "Código": t.codigo,
            "Tipo": t.tipo,
            "Serie": t.serie,
            "Modelo": t.modelo,
            "Placa": t.placa,
            "HM Inicial": t.horometro_inicial,
            "HM Final": t.horometro_final,
            "Horas": t.total_horas,
            "Tarifa/Hr": t.tarifa_hora,
            "Subtotal": t.subtotal,
            "Movilización": t.movilizacion,
            "Desmovilización": t.desmovilizacion,
            "TOTAL": t.total,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Equipos");
        XLSX.writeFile(wb, `VAL_${form.numero_valorizacion || "NUEVA"}.xlsx`);
    };

    const currentTab = tabs[activeTab];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/valorizaciones">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">Nueva Valorización</h1>
                    <p className="text-muted-foreground mt-1">
                        Sistema de pestañas por equipo con autocompletado
                    </p>
                </div>
                <Button variant="outline" onClick={exportToExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos generales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos Generales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label>N° Valorización *</Label>
                                <Input
                                    value={form.numero_valorizacion}
                                    onChange={(e) => setForm({ ...form, numero_valorizacion: e.target.value })}
                                    placeholder="VAL-2024-001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Empresa</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.empresa_id}
                                    onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
                                >
                                    <option value="">Seleccionar</option>
                                    {empresas.map((e) => (
                                        <option key={e.id} value={e.id}>{e.razon_social}</option>
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
                                    <option value="">Seleccionar</option>
                                    {proyectos.map((p) => (
                                        <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Periodo Inicio *</Label>
                                <Input
                                    type="date"
                                    value={form.periodo_inicio}
                                    onChange={(e) => setForm({ ...form, periodo_inicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Periodo Fin *</Label>
                                <Input
                                    type="date"
                                    value={form.periodo_fin}
                                    onChange={(e) => setForm({ ...form, periodo_fin: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pestañas de equipos */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle>Equipos de la Valorización</CardTitle>
                            <Button type="button" size="sm" onClick={addTab}>
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar Equipo
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Tabs */}
                        <div className="flex items-center gap-1 border-b mb-4 overflow-x-auto pb-1">
                            {tabs.map((tab, index) => (
                                <div
                                    key={tab.id}
                                    className={cn(
                                        "flex items-center gap-1 px-3 py-2 cursor-pointer rounded-t-lg text-sm font-medium transition-colors",
                                        activeTab === index
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                    onClick={() => setActiveTab(index)}
                                >
                                    <span className="truncate max-w-[100px]">
                                        {tab.codigo || `Equipo ${index + 1}`}
                                    </span>
                                    {tabs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTab(index);
                                            }}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Contenido del tab activo */}
                        <div className="space-y-4">
                            {/* Buscador de equipo */}
                            <div className="relative">
                                <Label>Buscar Equipo por Código</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10"
                                        placeholder="Escribe código, tipo o placa..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowSearch(true);
                                        }}
                                        onFocus={() => setShowSearch(true)}
                                    />
                                </div>
                                {showSearch && searchTerm && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredEquipos.length === 0 ? (
                                            <div className="p-3 text-muted-foreground text-sm">No se encontraron equipos</div>
                                        ) : (
                                            filteredEquipos.slice(0, 10).map((equipo) => (
                                                <div
                                                    key={equipo.id}
                                                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                                    onClick={() => handleSelectEquipo(equipo)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{equipo.codigo}</span>
                                                        <span className="text-sm text-muted-foreground">{equipo.tipo}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {equipo.marca} {equipo.modelo} | {equipo.placa || "Sin placa"} | HM: {formatNumber(equipo.horometro_actual)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Datos del equipo seleccionado */}
                            {currentTab.equipo_id && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Código</p>
                                        <p className="font-semibold text-lg">{currentTab.codigo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tipo</p>
                                        <p className="font-medium">{currentTab.tipo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Serie</p>
                                        <p className="font-medium">{currentTab.serie || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Modelo</p>
                                        <p className="font-medium">{currentTab.modelo || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Placa</p>
                                        <p className="font-medium">{currentTab.placa || "-"}</p>
                                    </div>
                                </div>
                            )}

                            {/* Campos de horas y valores */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>HM Inicial</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={currentTab.horometro_inicial || ""}
                                        onChange={(e) => handleTabChange("horometro_inicial", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>HM Final</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={currentTab.horometro_final || ""}
                                        onChange={(e) => handleTabChange("horometro_final", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Horas Trabajadas</Label>
                                    <div className="h-10 px-3 py-2 bg-muted rounded-md font-mono text-lg font-bold">
                                        {formatNumber(currentTab.total_horas)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tarifa/Hora (S/)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={currentTab.tarifa_hora || ""}
                                        onChange={(e) => handleTabChange("tarifa_hora", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtotal</Label>
                                    <div className="h-10 px-3 py-2 bg-muted rounded-md font-mono font-semibold">
                                        {formatCurrency(currentTab.subtotal)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Movilización (S/)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={currentTab.movilizacion || ""}
                                        onChange={(e) => handleTabChange("movilizacion", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Desmovilización (S/)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={currentTab.desmovilizacion || ""}
                                        onChange={(e) => handleTabChange("desmovilizacion", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Equipo</Label>
                                    <div className="h-10 px-3 py-2 bg-primary/10 rounded-md font-mono text-lg font-bold text-primary">
                                        {formatCurrency(currentTab.total)}
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div className="space-y-2">
                                <Label>Observaciones del Equipo</Label>
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={currentTab.observaciones}
                                    onChange={(e) => handleTabChange("observaciones", e.target.value)}
                                    placeholder="Observaciones específicas para este equipo"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumen General */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de la Valorización</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Equipos</p>
                                <p className="text-2xl font-bold">{resumen.total_equipos}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Total Horas</p>
                                <p className="text-2xl font-bold font-mono">{formatNumber(resumen.total_horas)}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Subtotal</p>
                                <p className="text-xl font-bold font-mono">{formatCurrency(resumen.subtotal_equipos)}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Movilización</p>
                                <p className="text-xl font-bold font-mono">{formatCurrency(resumen.total_movilizacion)}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Desmovilización</p>
                                <p className="text-xl font-bold font-mono">{formatCurrency(resumen.total_desmovilizacion)}</p>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-lg text-center border-2 border-primary">
                                <p className="text-sm text-primary font-medium">MONTO TOTAL</p>
                                <p className="text-2xl font-bold text-primary font-mono">{formatCurrency(resumen.monto_total)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/valorizaciones">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Valorización"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
