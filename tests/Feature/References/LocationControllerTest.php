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

function actingAsLocationManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    Permission::findOrCreate('can manage locations');
    $user->givePermissionTo('can manage locations');

    return $user;
}

it('renders the location index with search filters', function () {
    $this->actingAs(actingAsLocationManager());
    Location::factory()->create(['name' => 'Stock Room']);

    $this->get(route('locations.index', ['search' => 'Stock']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Location/Index')
            ->where('filters.search', 'Stock')
            ->has('locations.data', 1)
        );
});

it('stores a location and validates required fields', function () {
    $this->actingAs(actingAsLocationManager());

    $this->from(route('locations.index'))
        ->post(route('locations.store'), [])
        ->assertSessionHasErrors(['name']);

    $this->from(route('locations.index'))
        ->post(route('locations.store'), [
            'name' => 'Front Storage',
            'address' => 'Storage Address',
            'remarks' => 'Near showroom',
        ])
        ->assertRedirect(route('locations.index'));

    $this->assertDatabaseHas('locations', [
        'name' => 'Front Storage',
        'address' => 'Storage Address',
    ]);
});

it('updates a location and validates unique names', function () {
    $this->actingAs(actingAsLocationManager());
    $location = Location::factory()->create(['name' => 'Original Location']);
    Location::factory()->create(['name' => 'Duplicate Location']);

    $this->from(route('locations.index'))
        ->put(route('locations.update', $location), [
            'name' => 'Duplicate Location',
            'address' => 'Storage Address',
            'remarks' => 'Near showroom',
        ])
        ->assertSessionHasErrors(['name']);

    $this->from(route('locations.index'))
        ->put(route('locations.update', $location), [
            'name' => 'Updated Location',
            'address' => 'Updated Address',
            'remarks' => 'Updated remarks',
        ])
        ->assertRedirect(route('locations.index'));

    $this->assertDatabaseHas('locations', [
        'id' => $location->id,
        'name' => 'Updated Location',
    ]);
});

it('deletes a location when it is unused', function () {
    $this->actingAs(actingAsLocationManager());
    $location = Location::factory()->create();

    $this->from(route('locations.index'))
        ->delete(route('locations.destroy', $location))
        ->assertRedirect(route('locations.index'));

    $this->assertDatabaseMissing('locations', ['id' => $location->id]);
});

it('does not delete a location used by inventory items', function () {
    $this->actingAs(actingAsLocationManager());
    $location = Location::factory()->create();
    $supplier = Supplier::factory()->create();

    Item::factory()->create([
        'location_id' => $location->id,
        'supplier' => $supplier->slug,
    ]);

    $this->from(route('locations.index'))
        ->delete(route('locations.destroy', $location))
        ->assertRedirect(route('locations.index'))
        ->assertSessionHasErrors(['error']);

    $this->assertDatabaseHas('locations', ['id' => $location->id]);
});
