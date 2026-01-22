import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Upload } from "lucide-react";
import { EquiposTable } from "@/components/tables/EquiposTable";

export default async function EquiposPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: equipos, error } = await supabase
        .from("equipos")
        .select(`
      *,
      empresas (
        razon_social
      )
    `)
        .eq("activo", true)
        .order("codigo", { ascending: true });

    if (error) {
        console.error("Error fetching equipos:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Equipos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de maquinaria y equipos
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/equipos/importar">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Excel
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/equipos/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Equipo
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lista de Equipos</CardTitle>
                </CardHeader>
                <CardContent>
                    <EquiposTable equipos={equipos || []} />
                </CardContent>
            </Card>
        </div>
    );
}
