'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Interfaces para los datos
interface ExcelData {
    equipos: any[];
    soat: any[];
    revisiones: any[];
    mantenimientos: any[];
    filtros: any[];
}

export default function ImportarControlPage() {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<ExcelData>({
        equipos: [],
        soat: [],
        revisiones: [],
        mantenimientos: [],
        filtros: []
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('equipos');
    const [stats, setStats] = useState<any>({});
    const [logs, setLogs] = useState<string[]>([]);
    const supabase = createClientComponentClient();
    const router = useRouter();

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setLoading(true);
        setLogs([]);
        addLog('Leyendo archivo Excel...');

        try {
            const buffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(buffer);

            const newData: ExcelData = {
                equipos: [],
                soat: [],
                revisiones: [],
                mantenimientos: [],
                filtros: []
            };

            // 1. Equipos (BD MAQUINARIA)
            if (workbook.Sheets['BD MAQUINARIA']) {
                const raw = XLSX.utils.sheet_to_json(workbook.Sheets['BD MAQUINARIA'], { range: 2 });
                newData.equipos = raw.filter((row: any) => row['CÓDIGO']);
                addLog(`Leídos ${newData.equipos.length} equipos`);
            }

            // 2. SOAT (CONTROL SOAT)
            if (workbook.Sheets['CONTROL SOAT']) {
                const raw = XLSX.utils.sheet_to_json(workbook.Sheets['CONTROL SOAT'], { range: 2 });
                newData.soat = raw.filter((row: any) => row['CÓDIGO']);
                addLog(`Leídos ${newData.soat.length} registros SOAT`);
            }

            // 3. Revisiones (REVISIONES TECNICAS)
            if (workbook.Sheets['REVISIONES TECNICAS']) {
                const raw = XLSX.utils.sheet_to_json(workbook.Sheets['REVISIONES TECNICAS'], { range: 2 });
                newData.revisiones = raw.filter((row: any) => row['CÓDIGO']);
                addLog(`Leídos ${newData.revisiones.length} registros Revisión Técnica`);
            }

            // 4. Mantenimientos (CONTROL MANTENIMIENTOS)
            if (workbook.Sheets['CONTROL MANTENIMIENTOS']) {
                const raw = XLSX.utils.sheet_to_json(workbook.Sheets['CONTROL MANTENIMIENTOS'], { range: 2 });
                newData.mantenimientos = raw.filter((row: any) => row['CODIGO']);
                addLog(`Leídos ${newData.mantenimientos.length} registros Mantenimiento`);
            }

            // 5. Filtros (_FILTROS_BD)
            if (workbook.Sheets['_FILTROS_BD']) {
                // Esta hoja tiene estructura compleja (maestro-detalle), la leemos raw por ahora
                const raw = XLSX.utils.sheet_to_json(workbook.Sheets['_FILTROS_BD'], { header: 1 });
                newData.filtros = raw;
                addLog(`Leídas ${raw.length} filas de filtros`);
            } else if (workbook.Sheets['FILTROS MAQUINARIA']) {
                // Fallback
                const raw = XLSX.utils.sheet_to_json(workbook.Sheets['FILTROS MAQUINARIA'], { range: 5 });
                newData.filtros = raw;
                addLog(`Leídas ${raw.length} filas de filtros (Hoja FILTROS MAQUINARIA)`);
            }

            setData(newData);
            setStats({
                equipos: newData.equipos.length,
                soat: newData.soat.length,
                revisiones: newData.revisiones.length,
                mantenimientos: newData.mantenimientos.length,
                filtros: newData.filtros.length
            });

        } catch (error) {
            console.error('Error leyendo Excel:', error);
            addLog('Error crítico al leer el archivo');
            toast.error('Error al leer el archivo Excel');
        } finally {
            setLoading(false);
        }
    };

    const excelDateToJS = (serial: any) => {
        if (!serial) return null;
        // Si ya es string con formato fechadd/mm/yyyy
        if (typeof serial === 'string' && serial.includes('/')) {
            const [d, m, y] = serial.split('/');
            return new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
        }
        if (typeof serial === 'number') {
            const utc_days = Math.floor(serial - 25569);
            const date = new Date(utc_days * 86400 * 1000);
            return date.toISOString();
        }
        return null;
    };

    const getEmpresaId = (empresas: any[], nombre: string) => {
        if (!nombre) return empresas[0]?.id; // Fallback
        const normalized = nombre.toLowerCase();
        if (normalized.includes('jlmx')) return empresas.find(e => e.razon_social.toLowerCase().includes('jlmx'))?.id;
        if (normalized.includes('jomex')) return empresas.find(e => e.razon_social.toLowerCase().includes('jomex'))?.id;
        if (normalized.includes('cusma') || normalized.includes('jorge')) return empresas.find(e => e.razon_social.toLowerCase().includes('jorge'))?.id;
        return empresas[0]?.id;
    };

    const importEquipos = async () => {
        setUploading(true);
        addLog('Iniciando importación de equipos...');
        let count = 0;

        const { data: empresas } = await supabase.from('empresas').select('id, razon_social, asignacion_equipos');
        if (!empresas) {
            addLog('Error: No se pudieron cargar las empresas');
            setUploading(false);
            return;
        }

        for (const row of data.equipos) {
            const codigo = row['CÓDIGO'];
            if (!codigo) continue;

            try {
                const payload = {
                    codigo: codigo,
                    tipo: row['TIPO'] || 'DESCONOCIDO',
                    marca: row['MARCA'] || 'CATERPILLAR',
                    modelo: row['MODELO'],
                    serie: row['SERIE'],
                    anio_fabricacion: row['AÑO'] ? String(row['AÑO']) : null,
                    empresa_id: getEmpresaId(empresas, row['EMPRESA']),
                    estado: row['ESTADO'] === 'OPERATIVO' ? 'OPERATIVO' : 'EN_MANTENIMIENTO',
                    horometro_actual: Number(row['HORAS ACTUALES']) || 0,
                    ubicacion: row['TRAMO'],
                    activo: true
                };

                const { error } = await supabase.from('equipos').upsert(payload, { onConflict: 'codigo' });
                if (error) {
                    addLog(`Error en ${codigo}: ${error.message}`);
                } else {
                    count++;
                }
            } catch (e: any) {
                addLog(`Excepción en ${codigo}: ${e.message}`);
            }
        }
        addLog(`Finalizado: ${count} equipos importados/actualizados.`);
        toast.success(`${count} equipos procesados`);
        setUploading(false);
    };

    const importSoat = async () => {
        setUploading(true);
        addLog('Importando SOAT...');
        let count = 0;

        // Cargar mapa de equipos (codigo -> id)
        const { data: equipos } = await supabase.from('equipos').select('id, codigo, empresa_id');
        const equipoMap = new Map(equipos?.map(e => [e.codigo, e]));

        for (const row of data.soat) {
            const codigo = row['CÓDIGO'];
            const equipo = equipoMap.get(codigo);

            if (!equipo) {
                addLog(`Salatando SOAT: Equipo ${codigo} no encontrado en BD`);
                continue;
            }

            try {
                const fechaVenc = excelDateToJS(row['FECHA VENCIMIENTO']);
                if (!fechaVenc) {
                    addLog(`SOAT ${codigo}: Fecha inválida`);
                    continue;
                }

                const payload = {
                    equipo_id: equipo.id,
                    empresa_id: equipo.empresa_id, // Heredar del equipo
                    numero_poliza: row['PLACA/SERIE'] || 'S/N',
                    aseguradora: 'NO ESPECIFICADO', // Dato no disponible en Excel
                    fecha_vencimiento: fechaVenc,
                    fecha_inicio: new Date().toISOString(), // Temporal, no está en Excel
                    monto: 0,
                    activo: row['DÍAS RESTANTES'] > 0
                };

                // Insertar nuevo registro (no upsert porque puede haber históricos)
                // Pero para evitar duplicados masivos, verificamos si existe uno activo
                const { data: existing } = await supabase.from('soat')
                    .select('id')
                    .eq('equipo_id', equipo.id)
                    .eq('fecha_vencimiento', fechaVenc)
                    .maybeSingle();

                if (!existing) {
                    const { error } = await supabase.from('soat').insert(payload);
                    if (error) throw error;

                    // Crear alerta si vence pronto (menos de 30 días)
                    if (row['DÍAS RESTANTES'] < 30) {
                        await supabase.from('alertas').insert({
                            tipo: 'SOAT',
                            nivel: row['DÍAS RESTANTES'] < 7 ? 'CRITICO' : 'ALERTA',
                            mensaje: `SOAT de ${codigo} vence el ${new Date(fechaVenc).toLocaleDateString()}`,
                            equipo_id: equipo.id,
                            fecha_vencimiento: fechaVenc,
                            leido: false
                        });
                    }

                    count++;
                }
            } catch (e: any) {
                addLog(`Error SOAT ${codigo}: ${e.message}`);
            }
        }
        addLog(`Finalizado: ${count} registros SOAT importados.`);
        toast.success(`${count} registros SOAT procesados`);
        setUploading(false);
    };

    const importRevisiones = async () => {
        setUploading(true);
        addLog('Importando Revisiones Técnicas...');
        let count = 0;

        const { data: equipos } = await supabase.from('equipos').select('id, codigo, empresa_id');
        const equipoMap = new Map(equipos?.map(e => [e.codigo, e]));

        for (const row of data.revisiones) {
            const codigo = row['CÓDIGO'];
            const equipo = equipoMap.get(codigo);

            if (!equipo) {
                addLog(`Salatando R.T.: Equipo ${codigo} no encontrado`);
                continue;
            }

            try {
                const fechaVenc = excelDateToJS(row['FECHA VENCIMIENTO']);
                if (!fechaVenc) continue;

                const payload = {
                    equipo_id: equipo.id,
                    empresa_id: equipo.empresa_id,
                    numero_certificado: 'S/N', // No disponible claramente
                    taller: 'NO ESPECIFICADO',
                    fecha_vencimiento: fechaVenc,
                    fecha_revision: new Date().toISOString(), // Temporal
                    resultado: 'APROBADO',
                    costo: 0,
                    observaciones: 'Importado desde Excel'
                };

                const { data: existing } = await supabase.from('revisiones_tecnicas')
                    .select('id')
                    .eq('equipo_id', equipo.id)
                    .eq('fecha_vencimiento', fechaVenc)
                    .maybeSingle();

                if (!existing) {
                    const { error } = await supabase.from('revisiones_tecnicas').insert(payload);
                    if (error) throw error;
                    count++;
                }
            } catch (e: any) {
                addLog(`Error R.T. ${codigo}: ${e.message}`);
            }
        }
        addLog(`Finalizado: ${count} revisiones importadas.`);
        toast.success(`${count} revisiones procesadas`);
        setUploading(false);
    };

    const importMantenimientos = async () => {
        setUploading(true);
        addLog('Importando Historial de Mantenimientos...');
        let count = 0;

        const { data: equipos } = await supabase.from('equipos').select('id, codigo, empresa_id');
        const equipoMap = new Map(equipos?.map(e => [e.codigo, e]));

        for (const row of data.mantenimientos) {
            const codigo = row['CODIGO'];
            const equipo = equipoMap.get(codigo);

            if (!equipo) continue;

            try {
                // Este sheet parece tener el control ACTUAL del mantenimiento, no un historial completo
                // Por lo tanto, actualizaremos el estado del equipo y crearemos el último registro
                const ultimoMant = Number(row['MANTENIMIENTO']);
                const proxMant = Number(row['MANTENIMIENTO PROX']);

                if (!isNaN(ultimoMant)) {
                    // Actualizar equipo
                    await supabase.from('equipos').update({
                        horometro_actual: Number(row['HORA ACTUAL']) || 0
                    }).eq('id', equipo.id);

                    // Crear registro de mantenimiento referencial
                    const payload = {
                        equipo_id: equipo.id,
                        tipo: 'MANTENIMIENTO PREVENTIVO',
                        descripcion: 'Importación Inicial - Último Mantenimiento Registrado',
                        horometro_mantenimiento: ultimoMant,
                        proximo_mantenimiento_horas: proxMant,
                        estado: 'COMPLETADO',
                        fecha_ejecutada: new Date().toISOString(), // Fecha actual como referencia
                        proveedor: 'INTERNO',
                        costo: 0,
                        observaciones: `Importado. Operador: ${row['OPERADOR'] || '-'}. Ubicación: ${row['TRAMO'] || '-'}`
                    };

                    // Verificar si ya existe para no duplicar en reintentos
                    const { data: existing } = await supabase.from('mantenimientos')
                        .select('id')
                        .eq('equipo_id', equipo.id)
                        .eq('horometro_mantenimiento', ultimoMant)
                        .maybeSingle();

                    if (!existing) {
                        const { error } = await supabase.from('mantenimientos').insert(payload);
                        if (!error) count++;
                        else addLog(`Error Mante insert ${codigo}: ${error.message}`);
                    }
                }
            } catch (e: any) {
                addLog(`Error Mante ${codigo}: ${e.message}`);
            }
        }
        addLog(`Finalizado: ${count} mantenimientos registrados.`);
        toast.success(`${count} mantenimientos procesados`);
        setUploading(false);
    };

    const renderer = () => {
        switch (activeTab) {
            case 'equipos': return importEquipos;
            case 'soat': return importSoat;
            case 'revisiones': return importRevisiones;
            case 'mantenimientos': return importMantenimientos;
            default: return () => alert('Implementación en progreso');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Importación Masiva</h2>
                    <p className="text-muted-foreground mr-2">Importar datos desde Control de Maquinaria Excel</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccionar Archivo</CardTitle>
                            <CardDescription>Cargue el archivo CONTROL DE MAQUINARIA.xlsx</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="excel-file">Archivo Excel (.xlsx)</Label>
                                    <Input id="excel-file" type="file" accept=".xlsx" onChange={handleFileChange} />
                                </div>
                                {stats.equipos > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                            <span className="text-2xl font-bold">{stats.equipos}</span>
                                            <span className="text-xs text-muted-foreground">Equipos</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                            <span className="text-2xl font-bold">{stats.soat}</span>
                                            <span className="text-xs text-muted-foreground">SOAT</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                            <span className="text-2xl font-bold">{stats.revisiones}</span>
                                            <span className="text-xs text-muted-foreground">Revisiones</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                            <span className="text-2xl font-bold">{stats.mantenimientos}</span>
                                            <span className="text-xs text-muted-foreground">Mantenimientos</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {file && (
                        <div className="flex flex-col space-y-4">
                            <div className="flex space-x-2 border-b pb-2 overflow-x-auto">
                                {['equipos', 'soat', 'revisiones', 'mantenimientos'].map((tab) => (
                                    <Button
                                        key={tab}
                                        variant={activeTab === tab ? 'default' : 'ghost'}
                                        onClick={() => setActiveTab(tab)}
                                        className="capitalize whitespace-nowrap"
                                    >
                                        {tab}
                                    </Button>
                                ))}
                            </div>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="capitalize">Vista Previa: {activeTab}</CardTitle>
                                        <CardDescription>Revise los datos antes de importar</CardDescription>
                                    </div>
                                    <Button
                                        onClick={renderer()}
                                        disabled={uploading || (data as any)[activeTab].length === 0}
                                    >
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Importar {activeTab}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border p-0 overflow-auto max-h-[400px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {data && (data as any)[activeTab].length > 0 ? (
                                                        Object.keys((data as any)[activeTab][0]).slice(0, 8).map((header) => (
                                                            <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                                                        ))
                                                    ) : (
                                                        <TableHead>No hay datos cargados</TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(data as any)[activeTab].slice(0, 20).map((row: any, i: number) => (
                                                    <TableRow key={i}>
                                                        {Object.values(row).slice(0, 8).map((cell: any, j: number) => (
                                                            <TableCell key={j} className="whitespace-nowrap">
                                                                {typeof cell === 'number' && cell > 40000 && cell < 50000
                                                                    ? (() => { const d = excelDateToJS(cell); return d ? new Date(d).toLocaleDateString() : cell; })()
                                                                    : String(cell).substring(0, 50)}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Log de Importación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded-lg h-[500px] overflow-y-auto">
                                {logs.length === 0 ? (
                                    <span className="text-gray-500">Esperando acciones...</span>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} className="mb-1 border-b border-gray-800 pb-1">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
