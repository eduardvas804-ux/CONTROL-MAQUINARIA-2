"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Truck,
    FolderKanban,
    FileSpreadsheet,
    Clock,
    Wrench,
    Shield,
    ClipboardCheck,
    BarChart3,
    Menu,
    X,
    ChevronLeft,
    LogOut,
    Bell,
    Filter,
} from "lucide-react";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/equipos", label: "Equipos", icon: Truck },
    { href: "/dashboard/proyectos", label: "Proyectos", icon: FolderKanban },
    { href: "/dashboard/valorizaciones", label: "Valorizaciones", icon: FileSpreadsheet },
    { href: "/dashboard/control-horas", label: "Control de Horas", icon: Clock },
    { href: "/dashboard/mantenimientos", label: "Mantenimientos", icon: Wrench },
    { href: "/dashboard/filtros", label: "Filtros", icon: Filter },
    { href: "/dashboard/soat", label: "SOAT", icon: Shield },
    { href: "/dashboard/revisiones", label: "Revisiones Técnicas", icon: ClipboardCheck },
    { href: "/dashboard/alertas", label: "Alertas", icon: Bell },
    { href: "/dashboard/importar-control", label: "Importación Masiva", icon: FileSpreadsheet },
    { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
];

interface SidebarProps {
    children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300 ease-in-out",
                    collapsed ? "w-16" : "w-64",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {!collapsed && (
                        <span className="font-bold text-lg text-primary truncate">
                            Maquinaria
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronLeft
                            className={cn(
                                "h-5 w-5 transition-transform",
                                collapsed && "rotate-180"
                            )}
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3",
                                        collapsed && "justify-center px-2",
                                        isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                                    )}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout button */}
                <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
                    <form action="/auth/signout" method="post">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
                                collapsed && "justify-center px-2"
                            )}
                            type="submit"
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span>Cerrar Sesión</span>}
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    collapsed ? "lg:ml-16" : "lg:ml-64"
                )}
            >
                {/* Top bar */}
                <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1" />
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
