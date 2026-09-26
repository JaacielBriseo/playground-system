import { router } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center">
                <div className="mb-8">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Error 403</p>
                    <h1 className="mb-3 text-3xl font-bold tracking-tight">Acceso denegado</h1>
                    <p className="text-muted-foreground">
                        No tienes permisos para acceder a este recurso. Contacta a tu administrador si crees que esto es un error.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Regresar
                    </Button>
                    <Button onClick={() => router.visit(route('home'))}>
                        Ir al inicio
                    </Button>
                </div>
            </div>
        </div>
    );
}
