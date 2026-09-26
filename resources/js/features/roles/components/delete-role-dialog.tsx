import { router } from '@inertiajs/react';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useApiDelete } from '@/hooks/use-api-delete';
import { api } from '@/lib/api/api';
import { useTranslation } from '@/lib/i18n';

interface Props {
    roleId: number;
    roleLabel: string;
    disabled?: boolean;
}

export const DeleteRoleDialog = ({ roleId, roleLabel, disabled }: Props) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { deleteAsync, isDeleting } = useApiDelete();

    const handleConfirm = async () => {
        const result = await deleteAsync(api.roles.delete(roleId));
        if (result !== undefined) {
            toast.success(`Rol "${roleLabel}" eliminado.`);
            setOpen(false);
            router.reload();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild className="cursor-pointer rounded-full disabled:pointer-events-auto disabled:!cursor-not-allowed">
                <Button variant="destructive" size="icon" disabled={disabled}>
                    <TrashIcon className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete role ":name"?', { name: roleLabel })}</AlertDialogTitle>
                    <AlertDialogDescription>{t('This action cannot be undone.')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <Button asChild variant="destructive">
                        <AlertDialogAction disabled={isDeleting} onClick={handleConfirm}>
                            {isDeleting ? 'Eliminando…' : 'Eliminar'}
                        </AlertDialogAction>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

