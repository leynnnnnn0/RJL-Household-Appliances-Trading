<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    private function getGroupedPermissions()
    {
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

        $groupedPermissions = [];
        
        foreach ($modules as $moduleKey => $permissionNames) {
            $groupedPermissions[$moduleKey] = Permission::whereIn('name', $permissionNames)->get();
        }

        return $groupedPermissions;
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $roles = Role::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->whereNot('name', 'super admin')
            ->withCount('permissions')
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('Role/Index', [
            'roles' => $roles,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Role/Create', [
            'permissions' => $this->getGroupedPermissions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    public function show(Role $role)
    {
        $role->load('permissions');

        return Inertia::render('Role/Show', [
            'role' => $role,
        ]);
    }

    public function edit(Role $role)
    {
        $role->load('permissions');

        return Inertia::render('Role/Edit', [
            'role' => $role,
            'permissions' => $this->getGroupedPermissions(),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update(['name' => $validated['name']]);
        
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}