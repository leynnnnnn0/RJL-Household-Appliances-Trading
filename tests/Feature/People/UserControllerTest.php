<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsUserManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    Permission::findOrCreate('can view users');
    $user->givePermissionTo('can view users');

    return $user;
}

function validUserControllerPayload(array $overrides = []): array
{
    return array_merge([
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane.doe@example.com',
        'phone_number' => '09171234567',
        'roles' => ['staff'],
    ], $overrides);
}

it('renders user index, create, show, and edit pages', function () {
    $this->actingAs(actingAsUserManager());
    $role = Role::findOrCreate('staff');
    $user = User::factory()->create(['first_name' => 'Searchable']);
    $user->assignRole($role);

    $this->get(route('users.index', ['search' => 'Searchable']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Index')
            ->where('filters.search', 'Searchable')
            ->has('users.data', 1)
        );

    $this->get(route('users.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Create')
            ->has('roles')
            ->has('backUrl')
        );

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Show')
            ->where('user.id', $user->id)
            ->has('backUrl')
        );

    $this->get(route('users.edit', $user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Edit')
            ->where('user.id', $user->id)
            ->has('roles')
            ->has('backUrl')
        );
});

it('stores a user and validates required fields', function () {
    $this->actingAs(actingAsUserManager());
    Role::findOrCreate('staff');

    $this->from(route('users.create'))
        ->post(route('users.store'), [])
        ->assertSessionHasErrors(['first_name', 'last_name', 'email', 'phone_number', 'roles']);

    $this->post(route('users.store'), validUserControllerPayload())
        ->assertRedirect(route('users.index'));

    $createdUser = User::where('email', 'jane.doe@example.com')->firstOrFail();

    expect($createdUser->hasRole('staff'))->toBeTrue();
});

it('updates a user and validates unique fields', function () {
    $this->actingAs(actingAsUserManager());
    Role::findOrCreate('staff');
    $user = User::factory()->create();
    $duplicate = User::factory()->create([
        'email' => 'duplicate@example.com',
        'phone_number' => '09170000000',
    ]);

    $this->from(route('users.edit', $user))
        ->put(route('users.update', $user), validUserControllerPayload([
            'email' => $duplicate->email,
            'phone_number' => $duplicate->phone_number,
        ]))
        ->assertSessionHasErrors(['email', 'phone_number']);

    $this->put(route('users.update', $user), validUserControllerPayload([
        'first_name' => 'Updated',
        'email' => 'updated.user@example.com',
        'phone_number' => '09179999999',
    ]))
        ->assertRedirect(route('users.show', $user->id));

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'first_name' => 'Updated',
        'email' => 'updated.user@example.com',
    ]);
});

it('archives a user', function () {
    $this->actingAs(actingAsUserManager());
    $user = User::factory()->create();

    $this->delete(route('users.destroy', $user))
        ->assertRedirect(route('users.index'));

    $this->assertSoftDeleted('users', ['id' => $user->id]);
});
