<?php

namespace App\Http\Controllers;

use App\Http\Requests\Roles\UpsertRoleRequest;
use App\Services\Roles\RoleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(private RoleService $roles) {}

    public function index(Request $request)
    {
        $search = $request->input('search');

        return Inertia::render('Role/Index', [
            'roles' => $this->roles->paginate($search),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Role/Create', [
            'permissions' => $this->roles->groupedPermissions(),
        ]);
    }

    public function store(UpsertRoleRequest $request)
    {
        $this->roles->create($request->validated());

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
            'permissions' => $this->roles->groupedPermissions(),
        ]);
    }

    public function update(UpsertRoleRequest $request, Role $role)
    {
        $this->roles->update($role, $request->validated());

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $this->roles->delete($role);

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
