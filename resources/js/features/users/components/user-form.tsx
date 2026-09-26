import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { api } from '@/lib/api/api';
import { handleApiError } from '@/lib/api/handle-api-error';
import type { Role } from '@/features/users/interfaces';
import { createUserFormSchema, type UserFormData, userFormSchema } from '@/features/users/schemas/user-form-schema';
import { useTranslation } from '@/lib/i18n';

interface UserFormProps {
    defaultValues?: Partial<UserFormData> & { id?: number };
    roles: Role[];
}

export function UserForm({ defaultValues, roles }: UserFormProps) {
    const { t } = useTranslation();
    const isEdit = !!defaultValues?.id;

    const form = useForm<UserFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(isEdit ? userFormSchema : createUserFormSchema) as any,
        defaultValues: defaultValues ?? {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            roles: [],
        },
    });

    const onSubmit = async (data: UserFormData) => {
        try {
            if (isEdit) {
                const submitData: { name: string; email: string; roles: string[]; password?: string; password_confirmation?: string } = {
                    name: data.name,
                    email: data.email,
                    roles: data.roles,
                };
                if (data.password) {
                    submitData.password = data.password;
                    submitData.password_confirmation = data.password_confirmation;
                }
                await api.users.update(defaultValues!.id!, submitData);
                toast.success('Usuario actualizado exitosamente');
            } else {
                await api.users.create({
                    name: data.name,
                    email: data.email,
                    password: data.password || '',
                    password_confirmation: data.password_confirmation || '',
                    roles: data.roles,
                });
                toast.success('Usuario creado exitosamente');
            }
            router.visit(route('super-admin.users.index'));
        } catch (error) {
            handleApiError(error, form);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre del usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isEdit ? t('Password (leave blank to keep current)') : t('Password')}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('Confirm password')}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="roles"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel>Roles</FormLabel>
                                <FormDescription>{t('Select the roles this user will have')}</FormDescription>
                            </div>
                            {roles.map((role) => (
                                <FormField
                                    key={role.id}
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem key={role.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(role.name)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), role.name])
                                                            : field.onChange(field.value?.filter((value: string) => value !== role.name));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{role.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

