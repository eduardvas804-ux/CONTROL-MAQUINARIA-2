import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Sistema de Gestión de Maquinaria",
    description: "Sistema integral de gestión de equipos, valorizaciones y mantenimientos",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                {children}
                <Toaster richColors closeButton />
            </body>
        </html>
    );
}
