import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Pencil, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

interface Props {
    role: Role;
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

const MODULE_PERMISSIONS: Record<string, string[]> = {
    cashOrdersModule: [
        'can view cash orders',
        'can view cash order details',
        'can void cash order',
        'can view cash orders sales',
    ],
    bulkPaymentsModule: [
        'can access bulk payments',
    ],
    expenseRecordsModule: [
        'can view expense records',
        'can view expense record details',
        'can edit expense record',
        'can delete expense record',
        'can review expense record',
    ],
    creditOrdersModule: [
        'can view installment orders',
        'can view installment order details',
        'can record installment order payment',
        'can add rebate',
        'can accelerate',
        'can default',
        'can void',
        'can view installment orders sales',
    ],
    itemsModulePermission: [
        'can view items',
        'can view item details',
        'can add item',
        'can edit item',
        'can archive item',
    ],
    referencesModule: [
        'can manage locations',
        'can manage suppliers',
    ],
    customersModule: [
        'can view customers',
        'can view customer details',
    ],
    employeesModule: [
        'can view employees',
        'can view employee details',
        'can add employee',
        'can edit employee',
        'can archive employee',
    ],
    usersModule: [
        'can view users',
        'can view user details',
        'can add user',
        'can edit user',
        'can archive user',
    ],
    posPermission: [
        'can access cash pos',
        'can access credit pos',
    ],
};

export default function Show({ role }: Props) {
    // Group role's permissions by module
    const groupedPermissions: Record<string, Permission[]> = {};
    
    Object.entries(MODULE_PERMISSIONS).forEach(([moduleKey, modulePermissionNames]) => {
        const modulePerms = role.permissions.filter(p => 
            modulePermissionNames.includes(p.name)
        );
        
        if (modulePerms.length > 0) {
            groupedPermissions[moduleKey] = modulePerms;
        }
    });

    return (
        <AppLayout>
            <Head title={`Role: ${role.name}`} />
            <ModuleHeading
                title="Role Details"
                description={`View details for role: ${role.name}`}
            >
                <div className="flex gap-2">
                    <Link href={route('roles.index')}>
                        <Button variant="outline" className="border-black hover:bg-gray-100">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Roles
                        </Button>
                    </Link>
                    <Link href={route('roles.edit', role.id)}>
                        <Button className="bg-black text-white hover:bg-gray-800">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Role
                        </Button>
                    </Link>
                </div>
            </ModuleHeading>

            <div className="space-y-6">
                {/* Role Information Card */}
                <Card>
                    <CardHeader >
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Role Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                    Role Name
                                </h3>
                                <p className="text-lg font-medium">{role.name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                    Total Permissions
                                </h3>
                                <Badge variant="outline" className="border-black text-black text-lg px-3 py-1">
                                    {role.permissions.length}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                    Created At
                                </h3>
                                <p className="text-base text-gray-700">
                                    {new Date(role.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                    Last Updated
                                </h3>
                                <p className="text-base text-gray-700">
                                    {new Date(role.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions by Module */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Assigned Permissions by Module
                    </h2>

                    {role.permissions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No permissions assigned to this role</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(groupedPermissions).map(([moduleKey, modulePermissions]) => (
                                <Card key={moduleKey} className="border-black shadow-sm">
                                    <CardHeader className="bg-gray-100 border-b border-black pb-3">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center justify-between">
                                            <span>{MODULE_LABELS[moduleKey] || moduleKey}</span>
                                            <Badge variant="outline" className="border-black text-xs">
                                                {modulePermissions.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 pb-4">
                                        <div className="space-y-2">
                                            {modulePermissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                                                >
                                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                                    <span className="text-sm font-medium">
                                                        {permission.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}