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
            'customer',
        ];

        foreach($roles as $role){
            Role::create(['name' => $role]);
        }

        $itemsModulePermission = [
            'can view items',
            'can view item details',
            'can add item',
            'can edit item',
            'can archive item',
        ];

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

        $referencesModule = [
            'can manage locations',
            'can manage suppliers'
        ]



        
    }
}
