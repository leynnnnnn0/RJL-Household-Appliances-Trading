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
        
    }
}
