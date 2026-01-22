import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat("es-PE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

export function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(d);
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        borrador: "bg-gray-100 text-gray-800",
        enviada: "bg-blue-100 text-blue-800",
        aprobada: "bg-green-100 text-green-800",
        pagada: "bg-emerald-100 text-emerald-800",
        anulada: "bg-red-100 text-red-800",
        pendiente: "bg-yellow-100 text-yellow-800",
        en_proceso: "bg-blue-100 text-blue-800",
        completado: "bg-green-100 text-green-800",
        cancelado: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
}

export function getAlertColor(daysUntil: number): "destructive" | "warning" | "success" {
    if (daysUntil <= 7) return "destructive";
    if (daysUntil <= 15) return "warning";
    return "success";
}
