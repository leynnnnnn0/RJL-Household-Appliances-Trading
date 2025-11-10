<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'collector',
            'investigator',
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role]);
        }

        // --- Group permissions by module ---
        $modules = [
            'cashOrdersModule' => [
                'can view cash orders',
                'can view cash order details',
                'can void cash order',
                'can view cash orders sales',
            ],
            'bulkPaymentsModule' => [
                'can access bulk payments',
            ],
            'expenseRecordsModule' => [
                'can view expense records',
                'can view expense record details',
                'can edit expense record',
                'can add expense record',
                'can delete expense record',
                'can review expense record',
            ],
            'creditOrdersModule' => [
                'can view installment orders',
                'can view installment order details',
                'can record installment order payment',
                'can add rebate',
                'can accelerate',
                'can default',
                'can void',
                'can view installment orders sales',
            ],
            'itemsModulePermission' => [
                'can view items',
                'can view item details',
                'can add item',
                'can edit item',
                'can archive item',
            ],
            'referencesModule' => [
                'can manage locations',
                'can manage suppliers',
            ],
            'customersModule' => [
                'can view customers',
                'can view customer details',
            ],
            'employeesModule' => [
                'can view employees',
                'can view employee details',
                'can add employee',
                'can edit employee',
                'can archive employee',
            ],
            'usersModule' => [
                'can view users',
                'can view user details',
                'can add user',
                'can edit user',
                'can archive user',
            ],
            'posPermission' => [
                'can access cash pos',
                'can access credit pos',
            ],
        ];

        foreach ($modules as $module => $permissions) {
            foreach ($permissions as $permission) {
                Permission::updateOrCreate(['name' => $permission]);
            }
        }
    }
}
