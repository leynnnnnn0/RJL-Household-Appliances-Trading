import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import RoleForm, { RoleFormData } from '@/components/roles/role-form';
import AppLayout from '@/layouts/app-layout';
import { GroupedPermissions, RoleWithPermissions } from '@/lib/roles';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { toast } from 'sonner';

interface Props {
    role: RoleWithPermissions;
    permissions: GroupedPermissions;
}

export default function Edit({ role, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm<RoleFormData>({
        name: role.name,
        permissions: role.permissions.map((permission) => permission.id),
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        put(`/roles/${role.id}`, {
            onSuccess: () => {
                toast.success('Role Updated Successfully.');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Role" />
            <ModuleHeading
                title="Edit Role"
                description={`Update role: ${role.name}`}
            >
                <BackButton backUrl="/roles" label="Back to Roles" />
            </ModuleHeading>

            <RoleForm
                data={data}
                errors={errors}
                permissions={permissions}
                processing={processing}
                submitLabel="Update Role"
                processingLabel="Updating..."
                onSubmit={handleSubmit}
                onCancel={() => router.visit('/roles')}
                setData={setData}
            />
        </AppLayout>
    );
}
