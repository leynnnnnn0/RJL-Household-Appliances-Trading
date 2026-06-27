<?php

use App\Models\Item;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsSupplierManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    Permission::findOrCreate('can manage suppliers');
    $user->givePermissionTo('can manage suppliers');

    return $user;
}

it('renders the supplier index with search filters', function () {
    $this->actingAs(actingAsSupplierManager());
    Supplier::factory()->create(['name' => 'ACME Supplier', 'slug' => 'acme-supplier']);

    $this->get(route('suppliers.index', ['search' => 'ACME']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Supplier/Index')
            ->where('filters.search', 'ACME')
            ->has('suppliers.data', 1)
        );
});

it('stores a supplier and validates required fields', function () {
    $this->actingAs(actingAsSupplierManager());

    $this->from(route('suppliers.index'))
        ->post(route('suppliers.store'), [])
        ->assertSessionHasErrors(['name']);

    $this->from(route('suppliers.index'))
        ->post(route('suppliers.store'), [
            'name' => 'ACME Appliances',
            'remarks' => 'Preferred',
        ])
        ->assertRedirect(route('suppliers.index'));

    $this->assertDatabaseHas('suppliers', [
        'name' => 'ACME Appliances',
        'slug' => 'acme-appliances',
    ]);
});

it('updates a supplier and validates unique names', function () {
    $this->actingAs(actingAsSupplierManager());
    $supplier = Supplier::factory()->create(['name' => 'Original Supplier', 'slug' => 'original-supplier']);
    Supplier::factory()->create(['name' => 'Duplicate Supplier', 'slug' => 'duplicate-supplier']);

    $this->from(route('suppliers.index'))
        ->put(route('suppliers.update', $supplier), [
            'name' => 'Duplicate Supplier',
            'remarks' => 'Preferred',
        ])
        ->assertSessionHasErrors(['name']);

    $this->from(route('suppliers.index'))
        ->put(route('suppliers.update', $supplier), [
            'name' => 'Updated Supplier',
            'remarks' => 'Updated remarks',
        ])
        ->assertRedirect(route('suppliers.index'));

    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'name' => 'Updated Supplier',
        'slug' => 'updated-supplier',
    ]);
});

it('deletes a supplier when it is unused', function () {
    $this->actingAs(actingAsSupplierManager());
    $supplier = Supplier::factory()->create();

    $this->from(route('suppliers.index'))
        ->delete(route('suppliers.destroy', $supplier))
        ->assertRedirect(route('suppliers.index'));

    $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
});

it('does not delete a supplier used by inventory items', function () {
    $this->actingAs(actingAsSupplierManager());
    $supplier = Supplier::factory()->create();
    $location = Location::factory()->create();

    Item::factory()->create([
        'location_id' => $location->id,
        'supplier' => $supplier->slug,
    ]);

    $this->from(route('suppliers.index'))
        ->delete(route('suppliers.destroy', $supplier))
        ->assertRedirect(route('suppliers.index'))
        ->assertSessionHasErrors(['error']);

    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'deleted_at' => null,
    ]);
});
