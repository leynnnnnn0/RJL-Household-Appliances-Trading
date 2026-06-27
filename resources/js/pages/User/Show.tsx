import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Role } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Archive, Edit } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'collector', label: 'Collector' },
    { value: 'investigator', label: 'Investigator' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
];

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
    phone_number: string;
    created_at?: string;
    updated_at?: string;
}

interface ShowProps {
    backUrl?: string | null;
    user: User;
}

export default function Show({ backUrl, user }: ShowProps) {
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const getRoleLabel = (roleValue: string) => {
        return roles.find((r) => r.value === roleValue)?.label || roleValue;
    };

    const handleArchive = () => {
        setIsArchiving(true);
        router.delete(`/users/${user.id}`, {
            onSuccess: () => {
                toast.success('User Deleted Successfully.');
            },
            onFinish: () => {
                setIsArchiving(false);
                setShowArchiveDialog(false);
            },
        });
    };

    const handleEdit = () => {
        router.visit(`/users/${user.id}/edit`);
    };

    return (
        <AppLayout>
            <Head title={`${user.first_name} ${user.last_name}`} />
            <ModuleHeading
                title="User Details"
                description="View user information and manage account."
            >
                <BackButton backUrl={backUrl} />
            </ModuleHeading>

            <div>
                <Card>
                    <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div className="min-w-0">
                            <CardTitle className="text-xl break-words sm:text-2xl">
                                {user.first_name} {user.last_name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                User account information
                            </CardDescription>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                className="min-h-11 w-full sm:w-auto"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowArchiveDialog(true)}
                                className="min-h-11 w-full sm:w-auto"
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    First Name
                                </p>
                                <p className="text-base">{user.first_name}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Last Name
                                </p>
                                <p className="text-base">{user.last_name}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Email Address
                                </p>
                                <p className="text-base break-all">
                                    {user.email}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Phone Number
                                </p>
                                <p className="text-base">
                                    {user.phone_number || 'Not provided'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Roles
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant="secondary"
                                            >
                                                {getRoleLabel(role.name)}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-base">
                                            No roles assigned
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(user.created_at || user.updated_at) && (
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {user.created_at && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Created At
                                            </p>
                                            <p className="text-sm">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {user.updated_at && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Last Updated
                                            </p>
                                            <p className="text-sm">
                                                {new Date(
                                                    user.updated_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-4" />
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={showArchiveDialog}
                onOpenChange={setShowArchiveDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive {user.first_name}{' '}
                            {user.last_name}? This action will remove the user
                            from active listings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <AlertDialogCancel className="min-h-11 w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchive}
                            disabled={isArchiving}
                            className="min-h-11 w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
                        >
                            {isArchiving ? 'Archiving...' : 'Archive'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
