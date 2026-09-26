import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { MailPlus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/formatters/dates';
import { t, useTranslation } from '@/lib/i18n';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api/api';
import { handleApiError } from '@/lib/api/handle-api-error';

import type { Team, TeamInvitation, TeamMember } from '@/features/team/interfaces';
import type { SharedData } from '@/types';

const inviteSchema = z.object({ email: z.string().email(t('Email is not valid')) });
type InviteFormData = z.infer<typeof inviteSchema>;

interface Props extends Partial<SharedData> {
    team: Team;
    members: TeamMember[];
    invitations: TeamInvitation[];
}

export default function AdminTeamPage({ team, members, invitations, ...props }: Props) {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [loadingAction, setLoadingAction] = useState<{ type: 'remove' | 'cancel' | 'resend'; id: number } | null>(null);

    const inviteForm = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: '' },
    });

    const submitInvite = async (data: InviteFormData) => {
        try {
            await api.team.invite(data);
            toast.success(t('Invitation sent to :email', { email: data.email }));
            inviteForm.reset();
            router.reload();
        } catch (error) {
            handleApiError(error, inviteForm);
        }
    };

    const removeMember = async (userId: number, memberName: string) => {
        if (!confirm(t('Remove :name from the team?', { name: memberName }))) return;
        try {
            setLoadingAction({ type: 'remove', id: userId });
            await api.team.removeMember(userId);
            toast.success(t(':name was removed from the team.', { name: memberName }));
            router.reload();
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoadingAction(null);
        }
    };

    const cancelInvitation = async (id: number) => {
        if (!confirm(t('Cancel this invitation?'))) return;
        try {
            setLoadingAction({ type: 'cancel', id });
            await api.team.cancelInvitation(id);
            toast.success(t('Invitation cancelled.'));
            router.reload();
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoadingAction(null);
        }
    };

    const resendInvitation = async (id: number, email: string) => {
        try {
            setLoadingAction({ type: 'resend', id });
            await api.team.resendInvitation(id);
            toast.success(t('Invitation resent to :email', { email }));
            router.reload();
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: t('Dashboard'), href: route('admin.index') },
                { title: t('Team'), href: route('admin.team.index') },
            ]}
        >
            <Head title={t('Team')} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <h1 className="text-2xl leading-none font-bold">{t('Team')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t('Manage members and invitations for :team.', { team: team.name })}</p>
                </section>

                <div className={`grid gap-6 ${team.is_personal ? '' : 'lg:grid-cols-3'}`}>
                    {/* Invite form — hidden for personal teams */}
                    {!team.is_personal && (
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MailPlus className="h-4 w-4" />
                                    {t('Invite member')}
                                </CardTitle>
                                <CardDescription>{t('Send an invitation by email.')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...inviteForm}>
                                    <form onSubmit={inviteForm.handleSubmit(submitInvite)} className="flex flex-col gap-4">
                                        <FormField
                                            control={inviteForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label htmlFor="invite-email">{t('Email address')}</Label>
                                                    <FormControl>
                                                        <Input
                                                            id="invite-email"
                                                            type="email"
                                                            placeholder="colleague@company.com"
                                                            className="mt-1"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={inviteForm.formState.isSubmitting}>
                                            {inviteForm.formState.isSubmitting ? t('Sending…') : t('Send invitation')}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    <div className={`flex flex-col gap-6 ${team.is_personal ? '' : 'lg:col-span-2'}`}>
                        {/* Members table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Active members')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-secondary hover:bg-secondary">
                                            <TableHead>{t('Name')}</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>{t('Role')}</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-medium">{m.name}</TableCell>
                                                <TableCell>{m.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={m.role === 'owner' ? 'default' : 'secondary'}>
                                                        {m.role === 'owner' ? t('Owner') : t('Member')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {m.user_id !== user?.id && m.role !== 'owner' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={loadingAction?.id === m.user_id}
                                                            onClick={() => removeMember(m.user_id, m.name)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Pending invitations — hidden for personal teams */}
                        {!team.is_personal && invitations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('Pending invitations')}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-secondary hover:bg-secondary">
                                                <TableHead>Email</TableHead>
                                                <TableHead>{t('Invited by')}</TableHead>
                                                <TableHead>{t('Expires')}</TableHead>
                                                <TableHead />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invitations.map((inv) => (
                                                <TableRow key={inv.id}>
                                                    <TableCell>{inv.email}</TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {inv.invited_by ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {formatDateTime(inv.expires_at)}
                                                    </TableCell>
                                                    <TableCell className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={loadingAction?.id === inv.id}
                                                            onClick={() => resendInvitation(inv.id, inv.email)}
                                                            title={t('Resend')}
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={loadingAction?.id === inv.id}
                                                            onClick={() => cancelInvitation(inv.id)}
                                                            className="text-destructive hover:text-destructive"
                                                            title={t('Cancel')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

