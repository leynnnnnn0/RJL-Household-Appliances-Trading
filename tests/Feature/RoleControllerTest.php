<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsRoleManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can manage roles');

    $user = User::factory()->create();
    $user->givePermissionTo('can manage roles');

    test()->actingAs($user);

    return $user;
}

function seedRoleModulePermissions(): array
{
    return collect(config('role_permissions'))
        ->flatMap(fn (array $module) => $module['permissions'])
        ->unique()
        ->map(fn (string $permission) => Permission::findOrCreate($permission))
        ->values()
        ->all();
}

function validRolePayload(array $overrides = []): array
{
    $permissions = seedRoleModulePermissions();

    return array_merge([
        'name' => 'manager',
        'permissions' => [
            $permissions[0]->id,
            $permissions[1]->id,
        ],
    ], $overrides);
}

it('renders role index, create, show, and edit pages', function () {
    actingAsRoleManager();
    $permissions = seedRoleModulePermissions();
    $role = Role::create(['name' => 'searchable role']);
    $role->syncPermissions([$permissions[0]->id]);
    Role::create(['name' => 'super admin']);

    $this->get(route('roles.index', ['search' => 'searchable']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Role/Index')
            ->where('filters.search', 'searchable')
            ->has('roles.data', 1)
            ->where('roles.data.0.name', 'searchable role')
            ->where('roles.data.0.permissions_count', 1)
        );

    $this->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Role/Create')
            ->has('permissions.cashOrdersModule')
            ->has('permissions.expenseRecordsModule')
        );

    $this->get(route('roles.show', $role))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Role/Show')
            ->where('role.id', $role->id)
            ->has('role.permissions', 1)
        );

    $this->get(route('roles.edit', $role))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Role/Edit')
            ->where('role.id', $role->id)
            ->has('role.permissions', 1)
            ->has('permissions.cashOrdersModule')
        );
});

it('stores a role and validates required fields', function () {
    actingAsRoleManager();

    $this->from(route('roles.create'))
        ->post(route('roles.store'), [])
        ->assertSessionHasErrors('name');

    $this->post(route('roles.store'), validRolePayload())
        ->assertRedirect(route('roles.index'));

    $role = Role::where('name', 'manager')->firstOrFail();

    expect($role->permissions)->toHaveCount(2);
});

it('updates a role and validates unique names and permissions', function () {
    actingAsRoleManager();
    $permissions = seedRoleModulePermissions();
    $role = Role::create(['name' => 'cashier']);
    $duplicate = Role::create(['name' => 'collector']);

    $this->from(route('roles.edit', $role))
        ->put(route('roles.update', $role), validRolePayload([
            'name' => $duplicate->name,
        ]))
        ->assertSessionHasErrors('name');

    $this->from(route('roles.edit', $role))
        ->put(route('roles.update', $role), validRolePayload([
            'name' => 'updated cashier',
            'permissions' => [999999],
        ]))
        ->assertSessionHasErrors('permissions.0');

    $this->put(route('roles.update', $role), validRolePayload([
        'name' => 'updated cashier',
        'permissions' => [$permissions[2]->id],
    ]))->assertRedirect(route('roles.index'));

    $role->refresh();

    expect($role->name)->toBe('updated cashier')
        ->and($role->permissions)->toHaveCount(1)
        ->and($role->permissions->first()->id)->toBe($permissions[2]->id);
});

it('deletes a role', function () {
    actingAsRoleManager();
    $role = Role::create(['name' => 'temporary role']);

    $this->delete(route('roles.destroy', $role))
        ->assertRedirect(route('roles.index'));

    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});
