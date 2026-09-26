import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { slugify } from '@/lib/formatters/text';
import { api } from '@/lib/api/api';
import { handleApiError } from '@/lib/api/handle-api-error';
import { roleFormSchema, type RoleFormData } from '../schemas/role-form-schema';

interface Props {
    open: boolean;
    initialData?: RoleFormData & { id: number };
    triggerComponent?: React.ReactNode;
    onOpenChange: (open: boolean) => void;
}

export const RoleFormDialog = ({ onOpenChange, open, triggerComponent, initialData }: Props) => {
    const isEdit = !!initialData?.id;

    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: initialData ?? { name: '', label: '', permissions: [] },
    });

    const handleSubmit = async (data: RoleFormData) => {
        try {
            if (isEdit) {
                await api.roles.update(initialData!.id, data);
            } else {
                await api.roles.create(data);
            }
            onOpenChange(false);
            router.reload();
        } catch (error) {
            handleApiError(error, form);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                onOpenChange(open);
                if (!open) form.reset();
            }}
        >
            {triggerComponent ? <DialogTrigger asChild>{triggerComponent}</DialogTrigger> : null}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar rol' : 'Crear rol'}</DialogTitle>
                    <DialogDescription>{isEdit ? 'Edita el rol' : 'Crea un rol'} para la plataforma.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Etiqueta</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                form.setValue('name', slugify(e.target.value));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre (slug)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button className="self-end" type="submit" disabled={form.formState.isSubmitting}>
                            <SaveIcon className="size-4" strokeWidth={1.75} />
                            {form.formState.isSubmitting ? 'Guardando…' : 'Guardar'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
