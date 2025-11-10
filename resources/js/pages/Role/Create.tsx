import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormEvent } from "react";
import { toast } from "sonner";

interface Permission {
    id: number;
    name: string;
}

interface Props {
    permissions: Record<string, Permission[]>;
}

const MODULE_LABELS: Record<string, string> = {
    cashOrdersModule: 'Cash Orders Module',
    bulkPaymentsModule: 'Bulk Payments Module',
    expenseRecordsModule: 'Expense Records Module',
    creditOrdersModule: 'Credit Orders Module',
    itemsModulePermission: 'Items Module',
    referencesModule: 'References Module',
    customersModule: 'Customers Module',
    employeesModule: 'Employees Module',
    usersModule: 'Users Module',
    posPermission: 'POS Module',
};

export default function Create({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        permissions: [] as number[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('roles.store'),{
            onSuccess: () => {
                toast.success("Role Created Successfully.");
            }
        });
    };

    const handlePermissionToggle = (permissionId: number) => {
        setData(
            "permissions",
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const handleModuleToggle = (modulePermissions: Permission[]) => {
        const moduleIds = modulePermissions.map((p) => p.id);
        const allSelected = moduleIds.every((id) => data.permissions.includes(id));

        if (allSelected) {
            setData(
                "permissions",
                data.permissions.filter((id) => !moduleIds.includes(id))
            );
        } else {
            setData("permissions", [...new Set([...data.permissions, ...moduleIds])]);
        }
    };

    return (
        <AppLayout>
            <Head title="Create Role" />
            <ModuleHeading title="Create Role" description="Create a new role with permissions">
                <Link href={route('roles.index')}>
                    <Button variant="outline" className="border-black hover:bg-gray-100">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Roles
                    </Button>
                </Link>
            </ModuleHeading>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Role Name Card */}
                    <Card>
                        <CardHeader >
                            <CardTitle>Role Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="name" className="text-black font-semibold">
                                    Role Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="mt-1 border-black focus:ring-black"
                                    placeholder="Enter role name (e.g., Manager, Cashier)"
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Module Permissions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(permissions).map(([moduleKey, modulePermissions]) => {
                                const allSelected = modulePermissions.every((p) =>
                                    data.permissions.includes(p.id)
                                );

                                return (
                                    <Card key={moduleKey}>
                                        <CardHeader className="border-b border-gray-300 pb-3">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`module-${moduleKey}`}
                                                    checked={allSelected}
                                                    onCheckedChange={() => handleModuleToggle(modulePermissions)}
                                                    className="border-black data-[state=checked]:bg-black w-5 h-5"
                                                />
                                                <Label
                                                    htmlFor={`module-${moduleKey}`}
                                                    className="text-sm font-bold uppercase tracking-wide cursor-pointer"
                                                >
                                                    {MODULE_LABELS[moduleKey] || moduleKey}
                                                </Label>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-4">
                                            <div className="space-y-2.5">
                                                {modulePermissions.map((permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-start gap-2.5"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={data.permissions.includes(permission.id)}
                                                            onCheckedChange={() =>
                                                                handlePermissionToggle(permission.id)
                                                            }
                                                            className="border-gray-400 data-[state=checked]:bg-black mt-0.5"
                                                        />
                                                        <Label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-sm leading-relaxed cursor-pointer font-medium"
                                                        >
                                                            {permission.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        {errors.permissions && (
                            <p className="text-red-600 text-sm mt-2">{errors.permissions}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Link href={route('roles.index')}>
                            <Button type="button" variant="outline" className="border-black hover:bg-gray-100">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? "Creating..." : "Create Role"}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}