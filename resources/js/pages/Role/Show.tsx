import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    formatRoleDate,
    groupRolePermissionsByModule,
    roleModuleLabels,
    RoleWithPermissions,
} from '@/lib/roles';
import { Head, router } from '@inertiajs/react';
import { Pencil, Shield } from 'lucide-react';

interface Props {
    role: RoleWithPermissions & {
        created_at: string;
        updated_at: string;
    };
}

export default function Show({ role }: Props) {
    const groupedPermissions = groupRolePermissionsByModule(role.permissions);

    return (
        <AppLayout>
            <Head title={`Role: ${role.name}`} />
            <ModuleHeading
                title="Role Details"
                description={`View details for role: ${role.name}`}
            >
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <BackButton backUrl="/roles" label="Back to Roles" />
                    <Button
                        onClick={() => router.visit(`/roles/${role.id}/edit`)}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Role
                    </Button>
                </div>
            </ModuleHeading>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Role Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <Detail label="Role Name" value={role.name} />
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                                    Total Permissions
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="border-black px-3 py-1 text-lg text-black"
                                >
                                    {role.permissions.length}
                                </Badge>
                            </div>
                            <Detail
                                label="Created At"
                                value={formatRoleDate(role.created_at)}
                            />
                            <Detail
                                label="Last Updated"
                                value={formatRoleDate(role.updated_at)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                        <Shield className="h-5 w-5" />
                        Assigned Permissions by Module
                    </h2>

                    {role.permissions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-3 text-center text-gray-500">
                                    <Shield className="h-12 w-12 text-gray-300" />
                                    <p>No permissions assigned to this role</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {Object.entries(groupedPermissions).map(
                                ([moduleKey, modulePermissions]) => (
                                    <Card key={moduleKey} className="shadow-sm">
                                        <CardHeader className="border-b pb-3">
                                            <CardTitle className="flex items-center justify-between gap-3 text-sm font-bold tracking-wide uppercase">
                                                <span>
                                                    {roleModuleLabels[
                                                        moduleKey
                                                    ] || moduleKey}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {modulePermissions.length}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-4">
                                            <div className="space-y-2">
                                                {modulePermissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
                                                        >
                                                            <div className="h-2 w-2 shrink-0 rounded-full bg-black" />
                                                            <span className="text-sm font-medium break-words">
                                                                {
                                                                    permission.name
                                                                }
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
                {label}
            </h3>
            <p className="text-base font-medium break-words text-gray-700">
                {value}
            </p>
        </div>
    );
}
