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
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PHPhoneInput } from '@/components/ui/ph-phone-input';
import AppLayout from '@/layouts/app-layout';
import { Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Create({
    backUrl,
    roles,
}: {
    backUrl?: string | null;
    roles: Role[];
}) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        roles: [] as string[],
        phone_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    const confirmCreate = () => {
        post('/users', {
            onSuccess: () => {
                setShowConfirmDialog(false);
                toast.success('User Created Successfully.');
            },
        });
    };

    const toggleRole = (roleValue: string) => {
        const currentRoles = [...data.roles];
        const index = currentRoles.indexOf(roleValue);

        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleValue);
        }

        setData('roles', currentRoles);
    };

    return (
        <AppLayout>
            <Head title="Create New User" />
            <ModuleHeading
                title="Create New User"
                description="Input all the information need."
            >
                <BackButton backUrl={backUrl} />
            </ModuleHeading>

            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl">
                            User Information
                        </CardTitle>
                        <CardDescription>
                            Fill in the details to create a new user account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        First Name
                                    </Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                'first_name',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            errors.first_name
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-500">
                                            {errors.first_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData('last_name', e.target.value)
                                        }
                                        className={
                                            errors.last_name
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-500">
                                            {errors.last_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className={
                                        errors.email ? 'border-red-500' : ''
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number">
                                    Phone Number
                                </Label>
                                <PHPhoneInput
                                    id="phone_number"
                                    value={data.phone_number}
                                    onChange={(value) =>
                                        setData('phone_number', value)
                                    }
                                    className={
                                        errors.phone_number
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                {errors.phone_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.phone_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Roles</Label>
                                <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex min-h-11 items-center gap-2"
                                        >
                                            <Checkbox
                                                id={role.name}
                                                checked={data.roles.includes(
                                                    role.name,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleRole(role.name)
                                                }
                                            />
                                            <Label
                                                htmlFor={role.name}
                                                className="cursor-pointer text-sm font-normal"
                                            >
                                                {role.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-red-500">
                                        {errors.roles}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <BackButton backUrl={backUrl} label="Cancel" />
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-h-11 w-full sm:w-auto"
                                >
                                    {processing ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Creation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to create this new user? This
                            will add a new user account to the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <AlertDialogCancel className="min-h-11 w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCreate}
                            disabled={processing}
                            className="min-h-11 w-full sm:w-auto"
                        >
                            {processing ? 'Creating...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
