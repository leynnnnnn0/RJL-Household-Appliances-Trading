import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import RoleForm, { RoleFormData } from '@/components/roles/role-form';
import AppLayout from '@/layouts/app-layout';
import { GroupedPermissions } from '@/lib/roles';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { toast } from 'sonner';

interface Props {
    permissions: GroupedPermissions;
}

export default function Create({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm<RoleFormData>({
        name: '',
        permissions: [],
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        post('/roles', {
            onSuccess: () => {
                toast.success('Role Created Successfully.');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Role" />
            <ModuleHeading
                title="Create Role"
                description="Create a new role with permissions"
            >
                <BackButton backUrl="/roles" label="Back to Roles" />
            </ModuleHeading>

            <RoleForm
                data={data}
                errors={errors}
                permissions={permissions}
                processing={processing}
                submitLabel="Create Role"
                processingLabel="Creating..."
                onSubmit={handleSubmit}
                onCancel={() => router.visit('/roles')}
                setData={setData}
            />
        </AppLayout>
    );
}
