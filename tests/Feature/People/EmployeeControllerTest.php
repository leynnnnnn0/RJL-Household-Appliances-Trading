<?php

use App\Models\Employee;
use App\Models\InvestigationDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsEmployeeManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    Permission::findOrCreate('can view employees');
    $user->givePermissionTo('can view employees');

    return $user;
}

it('renders the employee index with search filters', function () {
    $this->actingAs(actingAsEmployeeManager());
    Employee::factory()->create(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->get(route('employees.index', ['search' => 'Maria']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Employee/Index')
            ->where('filters.search', 'Maria')
            ->has('employees.data', 1)
        );
});

it('stores an employee and validates required fields', function () {
    $this->actingAs(actingAsEmployeeManager());

    $this->from(route('employees.index'))
        ->post(route('employees.store'), [])
        ->assertSessionHasErrors(['first_name', 'last_name']);

    $this->from(route('employees.index'))
        ->post(route('employees.store'), [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'remarks' => 'Investigator',
        ])
        ->assertRedirect(route('employees.index'));

    $this->assertDatabaseHas('employees', [
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
    ]);
});

it('updates an employee', function () {
    $this->actingAs(actingAsEmployeeManager());
    $employee = Employee::factory()->create();

    $this->from(route('employees.index'))
        ->put(route('employees.update', $employee), [
            'first_name' => 'Juan Updated',
            'last_name' => 'Dela Cruz',
            'remarks' => 'Senior investigator',
        ])
        ->assertRedirect(route('employees.index'));

    $this->assertDatabaseHas('employees', [
        'id' => $employee->id,
        'first_name' => 'Juan Updated',
    ]);
});

it('deletes an employee when unused', function () {
    $this->actingAs(actingAsEmployeeManager());
    $employee = Employee::factory()->create();

    $this->from(route('employees.index'))
        ->delete(route('employees.destroy', $employee))
        ->assertRedirect(route('employees.index'));

    $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
});

it('does not delete an employee assigned to an investigation', function () {
    $this->actingAs(actingAsEmployeeManager());
    $employee = Employee::factory()->create();
    InvestigationDetail::factory()->create(['employee_id' => $employee->id]);

    $this->from(route('employees.index'))
        ->delete(route('employees.destroy', $employee))
        ->assertRedirect(route('employees.index'))
        ->assertSessionHasErrors(['error']);

    $this->assertDatabaseHas('employees', ['id' => $employee->id]);
});
