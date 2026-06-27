<?php

namespace App\Services\Roles;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return Role::query()
            ->when($search, fn (Builder $query, string $search) => $query->where('name', 'like', "%{$search}%"))
            ->whereNot('name', 'super admin')
            ->withCount('permissions')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function groupedPermissions(): array
    {
        $modules = config('role_permissions');
        $permissionNames = collect($modules)
            ->flatMap(fn (array $module) => $module['permissions'])
            ->unique()
            ->values();

        $permissions = Permission::query()
            ->whereIn('name', $permissionNames)
            ->get()
            ->keyBy('name');

        return collect($modules)
            ->mapWithKeys(function (array $module, string $moduleKey) use ($permissions) {
                return [
                    $moduleKey => collect($module['permissions'])
                        ->map(fn (string $permissionName) => $permissions->get($permissionName))
                        ->filter()
                        ->values(),
                ];
            })
            ->all();
    }

    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create(['name' => $data['name']]);

            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions'] ?? []);
            }

            return $role->load('permissions');
        });
    }

    public function update(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {
            $role->update(['name' => $data['name']]);

            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions'] ?? []);
            }

            return $role->refresh()->load('permissions');
        });
    }

    public function delete(Role $role): void
    {
        $role->delete();
    }
}
