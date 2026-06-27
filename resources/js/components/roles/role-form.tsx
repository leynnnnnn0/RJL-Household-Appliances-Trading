import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GroupedPermissions, Permission, roleModuleLabels } from '@/lib/roles';
import { Save, Shield } from 'lucide-react';
import { FormEvent } from 'react';

export type RoleFormData = {
    name: string;
    permissions: number[];
};

interface RoleFormProps {
    data: RoleFormData;
    errors: Partial<Record<keyof RoleFormData, string>>;
    permissions: GroupedPermissions;
    processing: boolean;
    submitLabel: string;
    processingLabel: string;
    onSubmit: (event: FormEvent) => void;
    onCancel: () => void;
    setData: (key: keyof RoleFormData, value: string | number[]) => void;
}

export default function RoleForm({
    data,
    errors,
    permissions,
    processing,
    submitLabel,
    processingLabel,
    onSubmit,
    onCancel,
    setData,
}: RoleFormProps) {
    const togglePermission = (permissionId: number) => {
        setData(
            'permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId],
        );
    };

    const toggleModule = (modulePermissions: Permission[]) => {
        const moduleIds = modulePermissions.map((permission) => permission.id);
        const allSelected = moduleIds.every((id) =>
            data.permissions.includes(id),
        );

        setData(
            'permissions',
            allSelected
                ? data.permissions.filter((id) => !moduleIds.includes(id))
                : [...new Set([...data.permissions, ...moduleIds])],
        );
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Role Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-semibold">
                            Role Name <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="Enter role name (e.g., Manager, Cashier)"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <Shield className="h-5 w-5" />
                    Module Permissions
                </h2>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {Object.entries(permissions).map(
                        ([moduleKey, modulePermissions]) => {
                            const allSelected = modulePermissions.every(
                                (permission) =>
                                    data.permissions.includes(permission.id),
                            );

                            return (
                                <Card key={moduleKey}>
                                    <CardHeader className="border-b pb-3">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id={`module-${moduleKey}`}
                                                checked={allSelected}
                                                onCheckedChange={() =>
                                                    toggleModule(
                                                        modulePermissions,
                                                    )
                                                }
                                                className="mt-0.5 h-5 w-5"
                                            />
                                            <Label
                                                htmlFor={`module-${moduleKey}`}
                                                className="cursor-pointer text-sm font-bold tracking-wide uppercase"
                                            >
                                                {roleModuleLabels[moduleKey] ||
                                                    moduleKey}
                                            </Label>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-4">
                                        <div className="space-y-2.5">
                                            {modulePermissions.map(
                                                (permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-start gap-2.5"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={data.permissions.includes(
                                                                permission.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                togglePermission(
                                                                    permission.id,
                                                                )
                                                            }
                                                            className="mt-0.5"
                                                        />
                                                        <Label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="cursor-pointer text-sm leading-relaxed font-medium break-words"
                                                        >
                                                            {permission.name}
                                                        </Label>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        },
                    )}
                </div>

                {errors.permissions && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.permissions}
                    </p>
                )}
            </section>

            <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    <Save className="mr-2 h-4 w-4" />
                    {processing ? processingLabel : submitLabel}
                </Button>
            </div>
        </form>
    );
}
