export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            empresas: {
                Row: {
                    id: string
                    ruc: string
                    razon_social: string
                    direccion: string | null
                    telefono: string | null
                    email: string | null
                    activo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    ruc: string
                    razon_social: string
                    direccion?: string | null
                    telefono?: string | null
                    email?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    ruc?: string
                    razon_social?: string
                    direccion?: string | null
                    telefono?: string | null
                    email?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            usuarios: {
                Row: {
                    id: string
                    auth_id: string | null
                    email: string
                    nombre_completo: string
                    rol: 'admin' | 'supervisor' | 'operador' | 'visualizador'
                    empresa_id: string | null
                    telefono: string | null
                    activo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    auth_id?: string | null
                    email: string
                    nombre_completo: string
                    rol: 'admin' | 'supervisor' | 'operador' | 'visualizador'
                    empresa_id?: string | null
                    telefono?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    auth_id?: string | null
                    email?: string
                    nombre_completo?: string
                    rol?: 'admin' | 'supervisor' | 'operador' | 'visualizador'
                    empresa_id?: string | null
                    telefono?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            equipos: {
                Row: {
                    id: string
                    codigo: string
                    tipo: string
                    marca: string | null
                    modelo: string | null
                    serie: string | null
                    placa: string | null
                    anio: number | null
                    horometro_actual: number
                    kilometraje_actual: number
                    tarifa_hora_default: number
                    empresa_id: string | null
                    activo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    codigo: string
                    tipo: string
                    marca?: string | null
                    modelo?: string | null
                    serie?: string | null
                    placa?: string | null
                    anio?: number | null
                    horometro_actual?: number
                    kilometraje_actual?: number
                    tarifa_hora_default?: number
                    empresa_id?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    codigo?: string
                    tipo?: string
                    marca?: string | null
                    modelo?: string | null
                    serie?: string | null
                    placa?: string | null
                    anio?: number | null
                    horometro_actual?: number
                    kilometraje_actual?: number
                    tarifa_hora_default?: number
                    empresa_id?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            proyectos: {
                Row: {
                    id: string
                    nombre: string
                    codigo: string
                    empresa_id: string | null
                    cliente: string | null
                    fecha_inicio: string | null
                    fecha_fin: string | null
                    ubicacion: string | null
                    activo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    codigo: string
                    empresa_id?: string | null
                    cliente?: string | null
                    fecha_inicio?: string | null
                    fecha_fin?: string | null
                    ubicacion?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    codigo?: string
                    empresa_id?: string | null
                    cliente?: string | null
                    fecha_inicio?: string | null
                    fecha_fin?: string | null
                    ubicacion?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            valorizaciones: {
                Row: {
                    id: string
                    numero_valorizacion: string
                    proyecto_id: string | null
                    empresa_id: string | null
                    periodo_inicio: string
                    periodo_fin: string
                    monto_total: number
                    estado: 'borrador' | 'enviada' | 'aprobada' | 'pagada' | 'anulada'
                    observaciones: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    numero_valorizacion: string
                    proyecto_id?: string | null
                    empresa_id?: string | null
                    periodo_inicio: string
                    periodo_fin: string
                    monto_total?: number
                    estado?: 'borrador' | 'enviada' | 'aprobada' | 'pagada' | 'anulada'
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    numero_valorizacion?: string
                    proyecto_id?: string | null
                    empresa_id?: string | null
                    periodo_inicio?: string
                    periodo_fin?: string
                    monto_total?: number
                    estado?: 'borrador' | 'enviada' | 'aprobada' | 'pagada' | 'anulada'
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            valorizacion_equipos: {
                Row: {
                    id: string
                    valorizacion_id: string | null
                    equipo_id: string | null
                    horometro_inicial: number
                    horometro_final: number
                    total_horas: number
                    tarifa_hora: number
                    subtotal: number
                    movilizacion: number
                    desmovilizacion: number
                    total: number
                    observaciones: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    valorizacion_id?: string | null
                    equipo_id?: string | null
                    horometro_inicial: number
                    horometro_final: number
                    tarifa_hora: number
                    movilizacion?: number
                    desmovilizacion?: number
                    observaciones?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    valorizacion_id?: string | null
                    equipo_id?: string | null
                    horometro_inicial?: number
                    horometro_final?: number
                    tarifa_hora?: number
                    movilizacion?: number
                    desmovilizacion?: number
                    observaciones?: string | null
                    created_at?: string
                }
            }
            control_horas: {
                Row: {
                    id: string
                    equipo_id: string | null
                    proyecto_id: string | null
                    fecha: string
                    turno: 'mañana' | 'tarde' | 'noche' | null
                    horometro_inicio: number
                    horometro_fin: number
                    horas_trabajadas: number
                    operador: string | null
                    actividad: string | null
                    observaciones: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    equipo_id?: string | null
                    proyecto_id?: string | null
                    fecha: string
                    turno?: 'mañana' | 'tarde' | 'noche' | null
                    horometro_inicio: number
                    horometro_fin: number
                    operador?: string | null
                    actividad?: string | null
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    equipo_id?: string | null
                    proyecto_id?: string | null
                    fecha?: string
                    turno?: 'mañana' | 'tarde' | 'noche' | null
                    horometro_inicio?: number
                    horometro_fin?: number
                    operador?: string | null
                    actividad?: string | null
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            mantenimientos: {
                Row: {
                    id: string
                    equipo_id: string | null
                    tipo: 'preventivo' | 'correctivo' | 'emergencia'
                    descripcion: string
                    fecha_programada: string | null
                    fecha_ejecutada: string | null
                    horometro_mantenimiento: number | null
                    costo: number
                    proveedor: string | null
                    proximo_mantenimiento_horas: number | null
                    proximo_mantenimiento_fecha: string | null
                    estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
                    observaciones: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    equipo_id?: string | null
                    tipo: 'preventivo' | 'correctivo' | 'emergencia'
                    descripcion: string
                    fecha_programada?: string | null
                    fecha_ejecutada?: string | null
                    horometro_mantenimiento?: number | null
                    costo?: number
                    proveedor?: string | null
                    proximo_mantenimiento_horas?: number | null
                    proximo_mantenimiento_fecha?: string | null
                    estado?: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    equipo_id?: string | null
                    tipo?: 'preventivo' | 'correctivo' | 'emergencia'
                    descripcion?: string
                    fecha_programada?: string | null
                    fecha_ejecutada?: string | null
                    horometro_mantenimiento?: number | null
                    costo?: number
                    proveedor?: string | null
                    proximo_mantenimiento_horas?: number | null
                    proximo_mantenimiento_fecha?: string | null
                    estado?: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            soat: {
                Row: {
                    id: string
                    equipo_id: string | null
                    numero_poliza: string
                    aseguradora: string
                    fecha_inicio: string
                    fecha_vencimiento: string
                    monto: number | null
                    archivo_url: string | null
                    activo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    equipo_id?: string | null
                    numero_poliza: string
                    aseguradora: string
                    fecha_inicio: string
                    fecha_vencimiento: string
                    monto?: number | null
                    archivo_url?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    equipo_id?: string | null
                    numero_poliza?: string
                    aseguradora?: string
                    fecha_inicio?: string
                    fecha_vencimiento?: string
                    monto?: number | null
                    archivo_url?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            revisiones_tecnicas: {
                Row: {
                    id: string
                    equipo_id: string | null
                    numero_certificado: string | null
                    fecha_revision: string
                    fecha_vencimiento: string
                    resultado: 'aprobado' | 'observado' | 'rechazado' | null
                    taller: string | null
                    costo: number | null
                    archivo_url: string | null
                    observaciones: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    equipo_id?: string | null
                    numero_certificado?: string | null
                    fecha_revision: string
                    fecha_vencimiento: string
                    resultado?: 'aprobado' | 'observado' | 'rechazado' | null
                    taller?: string | null
                    costo?: number | null
                    archivo_url?: string | null
                    observaciones?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    equipo_id?: string | null
                    numero_certificado?: string | null
                    fecha_revision?: string
                    fecha_vencimiento?: string
                    resultado?: 'aprobado' | 'observado' | 'rechazado' | null
                    taller?: string | null
                    costo?: number | null
                    archivo_url?: string | null
                    observaciones?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            alertas: {
                Row: {
                    id: string
                    tipo: 'mantenimiento' | 'soat' | 'revision_tecnica' | 'horometro'
                    equipo_id: string | null
                    referencia_id: string | null
                    titulo: string
                    mensaje: string
                    fecha_alerta: string
                    dias_anticipacion: number
                    prioridad: 'baja' | 'normal' | 'alta' | 'urgente'
                    enviado: boolean
                    fecha_envio: string | null
                    destinatarios: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tipo: 'mantenimiento' | 'soat' | 'revision_tecnica' | 'horometro'
                    equipo_id?: string | null
                    referencia_id?: string | null
                    titulo: string
                    mensaje: string
                    fecha_alerta: string
                    dias_anticipacion?: number
                    prioridad?: 'baja' | 'normal' | 'alta' | 'urgente'
                    enviado?: boolean
                    fecha_envio?: string | null
                    destinatarios?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tipo?: 'mantenimiento' | 'soat' | 'revision_tecnica' | 'horometro'
                    equipo_id?: string | null
                    referencia_id?: string | null
                    titulo?: string
                    mensaje?: string
                    fecha_alerta?: string
                    dias_anticipacion?: number
                    prioridad?: 'baja' | 'normal' | 'alta' | 'urgente'
                    enviado?: boolean
                    fecha_envio?: string | null
                    destinatarios?: string[] | null
                    created_at?: string
                }
            }
            pagos_valorizaciones: {
                Row: {
                    id: string
                    valorizacion_id: string | null
                    fecha_pago: string | null
                    monto: number
                    metodo_pago: 'transferencia' | 'cheque' | 'efectivo' | 'deposito' | null
                    referencia: string | null
                    banco: string | null
                    observaciones: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    valorizacion_id?: string | null
                    fecha_pago?: string | null
                    monto: number
                    metodo_pago?: 'transferencia' | 'cheque' | 'efectivo' | 'deposito' | null
                    referencia?: string | null
                    banco?: string | null
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    valorizacion_id?: string | null
                    fecha_pago?: string | null
                    monto?: number
                    metodo_pago?: 'transferencia' | 'cheque' | 'efectivo' | 'deposito' | null
                    referencia?: string | null
                    banco?: string | null
                    observaciones?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            archivos_respaldo: {
                Row: {
                    id: string
                    tipo_documento: string
                    referencia_id: string
                    nombre_archivo: string
                    google_drive_id: string | null
                    google_drive_url: string | null
                    fecha_respaldo: string
                    tamano_bytes: number | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    tipo_documento: string
                    referencia_id: string
                    nombre_archivo: string
                    google_drive_id?: string | null
                    google_drive_url?: string | null
                    fecha_respaldo?: string
                    tamano_bytes?: number | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    tipo_documento?: string
                    referencia_id?: string
                    nombre_archivo?: string
                    google_drive_id?: string | null
                    google_drive_url?: string | null
                    fecha_respaldo?: string
                    tamano_bytes?: number | null
                    created_by?: string | null
                }
            }
        }
        Views: {
            vista_alertas_urgentes: {
                Row: {
                    id: string
                    tipo: string
                    equipo_id: string | null
                    titulo: string
                    mensaje: string
                    fecha_alerta: string
                    equipo_codigo: string | null
                    equipo_tipo: string | null
                    empresa: string | null
                }
            }
            vista_valorizaciones_resumen: {
                Row: {
                    id: string
                    numero_valorizacion: string
                    proyecto_nombre: string | null
                    proyecto_codigo: string | null
                    empresa_nombre: string | null
                    monto_total: number
                    estado: string
                    total_equipos: number
                    total_horas: number
                }
            }
        }
        Functions: {
            get_user_empresa_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
    }
}
