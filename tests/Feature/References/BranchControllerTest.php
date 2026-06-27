<?php

use App\Models\Branch;
use App\Models\ExpenseRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsBranchManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    Permission::findOrCreate('can manage locations');
    $user->givePermissionTo('can manage locations');

    return $user;
}

it('renders the branch index with search filters', function () {
    $this->actingAs(actingAsBranchManager());
    Branch::factory()->create(['name' => 'Main Branch']);

    $this->get(route('branches.index', ['search' => 'Main']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Branch/Index')
            ->where('filters.search', 'Main')
            ->has('branches.data', 1)
        );
});

it('stores a branch and validates required fields', function () {
    $this->actingAs(actingAsBranchManager());

    $this->from(route('branches.index'))
        ->post(route('branches.store'), [])
        ->assertSessionHasErrors(['name']);

    $this->from(route('branches.index'))
        ->post(route('branches.store'), [
            'name' => 'Downtown Branch',
            'address' => '123 Main Street',
            'remarks' => 'Flagship',
        ])
        ->assertRedirect(route('branches.index'));

    $this->assertDatabaseHas('branches', [
        'name' => 'Downtown Branch',
        'address' => '123 Main Street',
        'remarks' => 'Flagship',
    ]);
});

it('updates a branch and validates unique names', function () {
    $this->actingAs(actingAsBranchManager());
    $branch = Branch::factory()->create(['name' => 'Original Branch']);
    Branch::factory()->create(['name' => 'Duplicate Branch']);

    $this->from(route('branches.index'))
        ->put(route('branches.update', $branch), [
            'name' => 'Duplicate Branch',
            'address' => '123 Main Street',
            'remarks' => 'Flagship',
        ])
        ->assertSessionHasErrors(['name']);

    $this->from(route('branches.index'))
        ->put(route('branches.update', $branch), [
            'name' => 'Updated Branch',
            'address' => '456 Market Street',
            'remarks' => 'Updated remarks',
        ])
        ->assertRedirect(route('branches.index'));

    $this->assertDatabaseHas('branches', [
        'id' => $branch->id,
        'name' => 'Updated Branch',
        'address' => '456 Market Street',
    ]);
});

it('deletes a branch when it is unused', function () {
    $this->actingAs(actingAsBranchManager());
    $branch = Branch::factory()->create();

    $this->from(route('branches.index'))
        ->delete(route('branches.destroy', $branch))
        ->assertRedirect(route('branches.index'));

    $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
});

it('does not delete a branch used by expenses', function () {
    $this->actingAs(actingAsBranchManager());
    $branch = Branch::factory()->create();
    ExpenseRecord::factory()->create(['branch_id' => $branch->id]);

    $this->from(route('branches.index'))
        ->delete(route('branches.destroy', $branch))
        ->assertRedirect(route('branches.index'))
        ->assertSessionHasErrors(['error']);

    $this->assertDatabaseHas('branches', ['id' => $branch->id]);
});
