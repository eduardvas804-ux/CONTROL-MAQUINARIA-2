// Base de datos de filtros por modelo de equipo CATERPILLAR
export const FILTROS_POR_MODELO: Record<string, Record<string, { codigo: string; descripcion: string }>> = {
    "320D": {
        aceiteMotor: { codigo: "1R-0739", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0750", descripcion: "Filtro de Combustible" },
        combustibleSecundario: { codigo: "326-1644", descripcion: "Filtro Combustible Secundario" },
        aire: { codigo: "142-1339", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "142-1340", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "5I-8670", descripcion: "Filtro Hidráulico" },
        piloto: { codigo: "093-7521", descripcion: "Filtro Piloto Hidráulico" }
    },
    "320D2L": {
        aceiteMotor: { codigo: "1R-0739", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "360-8960", descripcion: "Filtro de Combustible" },
        aire: { codigo: "142-1339", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "142-1340", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "5I-8670", descripcion: "Filtro Hidráulico" },
        piloto: { codigo: "093-7521", descripcion: "Filtro Piloto Hidráulico" }
    },
    "320D3": {
        aceiteMotor: { codigo: "462-1171", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "502-2643", descripcion: "Filtro de Combustible" },
        aire: { codigo: "346-6687", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "346-6688", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "337-5270", descripcion: "Filtro Hidráulico" }
    },
    "329DL": {
        aceiteMotor: { codigo: "1R-0739", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0750", descripcion: "Filtro de Combustible" },
        aire: { codigo: "142-1339", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "142-1340", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "5I-8670", descripcion: "Filtro Hidráulico" }
    },
    "336D2L": {
        aceiteMotor: { codigo: "1R-1808", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "360-8960", descripcion: "Filtro de Combustible" },
        aire: { codigo: "346-6687", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "346-6688", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "337-5270", descripcion: "Filtro Hidráulico" }
    },
    "140K": {
        aceiteMotor: { codigo: "1R-0739", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0750", descripcion: "Filtro de Combustible" },
        transmision: { codigo: "1R-0719", descripcion: "Filtro de Transmisión" },
        aire: { codigo: "6I-2501", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "6I-2502", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "1R-0777", descripcion: "Filtro Hidráulico" }
    },
    "140M": {
        aceiteMotor: { codigo: "1R-0739", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0750", descripcion: "Filtro de Combustible" },
        transmision: { codigo: "1R-0719", descripcion: "Filtro de Transmisión" },
        aire: { codigo: "6I-2501", descripcion: "Filtro de Aire Primario" },
        hidraulico: { codigo: "1R-0777", descripcion: "Filtro Hidráulico" }
    },
    "950H": {
        aceiteMotor: { codigo: "1R-0716", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0750", descripcion: "Filtro de Combustible" },
        transmision: { codigo: "9T-0973", descripcion: "Filtro de Transmisión" },
        aire: { codigo: "6I-2501", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "6I-2502", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "1G-8878", descripcion: "Filtro Hidráulico" }
    },
    "CS-533E": {
        aceiteMotor: { codigo: "1R-0714", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0749", descripcion: "Filtro de Combustible" },
        aire: { codigo: "6I-0273", descripcion: "Filtro de Aire" },
        hidraulico: { codigo: "1R-0777", descripcion: "Filtro Hidráulico" }
    },
    "420F": {
        aceiteMotor: { codigo: "7W-2326", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0749", descripcion: "Filtro de Combustible" },
        transmision: { codigo: "3T-0434", descripcion: "Filtro de Transmisión" },
        aire: { codigo: "6I-0273", descripcion: "Filtro de Aire Primario" },
        hidraulico: { codigo: "1G-8878", descripcion: "Filtro Hidráulico" }
    },
    "D6TXL": {
        aceiteMotor: { codigo: "1R-0739", descripcion: "Filtro de Aceite Motor" },
        combustible: { codigo: "1R-0750", descripcion: "Filtro de Combustible" },
        transmision: { codigo: "1R-0719", descripcion: "Filtro de Transmisión" },
        aire: { codigo: "6I-2501", descripcion: "Filtro de Aire Primario" },
        aireSecundario: { codigo: "6I-2502", descripcion: "Filtro de Aire Secundario" },
        hidraulico: { codigo: "1R-0777", descripcion: "Filtro Hidráulico" }
    }
};

export const TIPOS_FILTRO = {
    aceiteMotor: { icon: "🛢️", label: "Aceite Motor" },
    combustible: { icon: "⛽", label: "Combustible" },
    combustibleSecundario: { icon: "⛽", label: "Comb. Secundario" },
    aire: { icon: "💨", label: "Aire Primario" },
    aireSecundario: { icon: "💨", label: "Aire Secundario" },
    hidraulico: { icon: "🔧", label: "Hidráulico" },
    piloto: { icon: "🔧", label: "Piloto" },
    transmision: { icon: "⚙️", label: "Transmisión" }
};

export function getTipoFiltroLabel(tipo: string): string {
    return TIPOS_FILTRO[tipo as keyof typeof TIPOS_FILTRO]?.label || tipo;
}

export function getTipoFiltroIcon(tipo: string): string {
    return TIPOS_FILTRO[tipo as keyof typeof TIPOS_FILTRO]?.icon || "📦";
}
