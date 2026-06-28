export type Permission = {
    id: number;
    name: string;
};

export type RoleWithPermissions = {
    id: number | string;
    name: string;
    permissions: Permission[];
    created_at?: string;
    updated_at?: string;
};

export type GroupedPermissions = Record<string, Permission[]>;

export const roleModuleLabels: Record<string, string> = {
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

export const roleModulePermissions: Record<string, string[]> = {
    cashOrdersModule: [
        'can view cash orders',
        'can view cash order details',
        'can void cash order',
        'can view cash orders sales',
    ],
    bulkPaymentsModule: ['can access bulk payments'],
    expenseRecordsModule: [
        'can view expense records',
        'can view expense record details',
        'can edit expense record',
        'can add expense record',
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
        'can view sales analytics',
    ],
    itemsModulePermission: [
        'can view items',
        'can view item details',
        'can add item',
        'can edit item',
        'can archive item',
    ],
    referencesModule: ['can manage locations', 'can manage suppliers'],
    customersModule: ['can view customers', 'can view customer details'],
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
    posPermission: ['can access cash pos', 'can access credit pos'],
};

export function groupRolePermissionsByModule(
    permissions: Permission[],
): GroupedPermissions {
    return Object.entries(roleModulePermissions).reduce<GroupedPermissions>(
        (grouped, [moduleKey, permissionNames]) => {
            const modulePermissions = permissions.filter((permission) =>
                permissionNames.includes(permission.name),
            );

            if (modulePermissions.length > 0) {
                grouped[moduleKey] = modulePermissions;
            }

            return grouped;
        },
        {},
    );
}

export function formatRoleDate(value: string): string {
    return new Date(value).toLocaleDateString();
}
