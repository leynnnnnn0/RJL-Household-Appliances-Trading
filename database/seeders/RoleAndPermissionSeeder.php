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

        foreach (config('role_permissions') as $module) {
            foreach ($module['permissions'] as $permission) {
                Permission::updateOrCreate(['name' => $permission]);
            }
        }
    }
}
