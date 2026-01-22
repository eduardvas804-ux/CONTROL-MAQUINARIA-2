import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download } from "lucide-react";
import { ValorizacionesTable } from "@/components/tables/ValorizacionesTable";

export default async function ValorizacionesPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: valorizaciones, error } = await supabase
        .from("valorizaciones")
        .select(`
      *,
      proyectos (
        nombre,
        codigo
      ),
      empresas (
        razon_social
      )
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching valorizaciones:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Valorizaciones</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de valorizaciones de equipos por proyecto
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/dashboard/valorizaciones/nueva">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Valorización
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lista de Valorizaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <ValorizacionesTable valorizaciones={valorizaciones || []} />
                </CardContent>
            </Card>
        </div>
    );
}
