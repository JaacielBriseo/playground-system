import { router } from '@inertiajs/react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useApiDelete } from '@/hooks/use-api-delete';
import { api } from '@/lib/api/api';

import { User } from '../interfaces';
import { useTranslation } from '@/lib/i18n';

interface Props {
    user: Pick<User, 'id' | 'name' | 'email'>;
    onClose: () => void;
}

export const DeleteUserDialog = ({ onClose, user }: Props) => {
    const { t } = useTranslation();
    const { deleteAsync, isDeleting } = useApiDelete();

    const handleConfirm = async () => {
        const result = await deleteAsync(api.users.delete(user.id));
        if (result !== undefined) {
            toast.success('Usuario eliminado correctamente');
            onClose();
            router.reload();
        }
    };

    return (
        <AlertDialog
            defaultOpen
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete this user?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('This action cannot be undone. All of this user data will be lost.')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <Button asChild variant="destructive">
                        <AlertDialogAction disabled={isDeleting} onClick={handleConfirm}>
                            Confirmar
                        </AlertDialogAction>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

