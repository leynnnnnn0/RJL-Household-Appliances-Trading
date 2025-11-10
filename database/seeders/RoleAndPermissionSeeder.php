<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'super_admin',
            'admin',
            'collector',
            'investigator',
            'cashier',
            'inventory_manager',
        ];

        foreach ($roles as $role) {
            Role::create(['name' => $role]);
        }

        // Sales
        $cashOrdersModule = [
            'can view cash orders',
            'can view cash order details',
            'can void cash order',
            'can view cash orders sales'
        ];

        $bulkPaymentsModule = [
            'can access bulk payments'
        ];

        $expenseRecordsModule = [
            'can view expense records',
            'can view expense record details',
            'can edit expense record',
            'can delete expense record',
            'can review expense record',
        ];

        $creditOrdersModule = [
            'can view installment orders',
            'can view installment order details',
            'can record installment order payment',
            'can add rebate',
            'can accelerate',
            'can default',
            'can void',
        ];
        // Platform

        $itemsModulePermission = [
            'can view items',
            'can view item details',
            'can add item',
            'can edit item',
            'can archive item',
        ];

        // References

        $referencesModule = [
            'can manage locations',
            'can manage suppliers'
        ];

        // People

        $customersModule = [
            'can view customers',
            'can view customer details'
        ];

        $employeesModule = [
            'can view employees',
            'can view employee details',
            'can add employee',
            'can edit employee',
            'can archive employee'
        ];

        $usersModule = [
            'can view users',
            'can view user details',
            'can add user',
            'can edit user',
            'can archive user'
        ];

        $posPermisssion = [
            'can access cash pos',
            'can access credit pos',
        ];

    }
}
