<?php

use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsItemManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can view items');

    $user = User::factory()->create();
    $user->givePermissionTo('can view items');

    test()->actingAs($user);

    return $user;
}

function validItemPayload(array $overrides = []): array
{
    $supplier = Supplier::factory()->create();
    $location = Location::factory()->create();

    return array_merge([
        'item_type' => 'appliances',
        'supplier' => $supplier->slug,
        'location_id' => $location->id,
        'dr_no' => 'DR-1001',
        'description' => 'Split Type Air Conditioner',
        'model' => 'AC-1000',
        'serial' => 'SN-ITEM-1001',
        'quantity' => 1,
        'srp' => 25000,
        'unit_cost' => 18000,
        'date_of_purchase' => '2026-06-01',
        'date_out' => null,
        'size' => '1.5HP',
        'remarks' => 'Test item',
    ], $overrides);
}

function createItemRecord(array $overrides = []): Item
{
    return Item::factory()->create(array_merge([
        'item_type' => 'appliances',
        'model' => 'MODEL-'.fake()->unique()->numerify('####'),
        'serial' => fake()->unique()->bothify('SN-TEST-####'),
    ], $overrides));
}

function uploadedItemsSpreadsheet(Location $location, array $overrides = []): UploadedFile
{
    $row = array_merge([
        'item_type' => 'appliances',
        'supplier_name' => 'Imported Supplier',
        'location_name' => $location->name,
        'dr_no' => 'DR-IMPORT',
        'description' => 'Imported Refrigerator',
        'model' => 'REF-9000',
        'serial' => 'IMPORT-SN-001',
        'quantity' => 1,
        'srp' => 32000,
        'unit_cost' => 24000,
        'date_of_purchase' => '2026-06-15',
        'date_out' => null,
        'size' => 'Medium',
        'remarks' => 'Imported row',
    ], $overrides);

    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->fromArray([
        [
            'Item Type',
            'Supplier',
            'Location',
            'DR No',
            'Description',
            'Model',
            'Serial',
            'Quantity',
            'SRP',
            'Unit Cost',
            'Date of Purchase',
            'Date Out',
            'Size',
            'Remarks',
        ],
        [
            $row['item_type'],
            $row['supplier_name'],
            $row['location_name'],
            $row['dr_no'],
            $row['description'],
            $row['model'],
            $row['serial'],
            $row['quantity'],
            $row['srp'],
            $row['unit_cost'],
            $row['date_of_purchase'],
            $row['date_out'],
            $row['size'],
            $row['remarks'],
        ],
    ]);

    $path = tempnam(sys_get_temp_dir(), 'items-import-').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile(
        $path,
        'items.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true,
    );
}

it('renders item index, create, show, edit, and import pages', function () {
    actingAsItemManager();
    $supplier = Supplier::factory()->create();
    $location = Location::factory()->create();
    $item = createItemRecord([
        'supplier' => $supplier->slug,
        'location_id' => $location->id,
        'description' => 'Searchable Washing Machine',
    ]);

    $this->get(route('items.index', [
        'search' => 'Washing',
        'availability' => 'available',
        'supplier' => $supplier->slug,
        'item_type' => 'appliances',
        'location' => $location->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Item/Index')
            ->has('items.data', 1)
            ->where('items.data.0.id', $item->id)
            ->has('suppliers')
            ->has('locations')
        );

    $this->get(route('items.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Item/Create')
            ->has('suppliers')
            ->has('locations')
        );

    $this->get(route('items.show', $item))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Item/Show')
            ->where('item.id', $item->id)
            ->has('purchaseHistory')
            ->has('transferHistory')
        );

    $this->get(route('items.edit', $item))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Item/Edit')
            ->where('item.id', $item->id)
            ->has('suppliers')
            ->has('locations')
        );

    $this->withSession(['imported_items' => [['description' => 'Preview item']]])
        ->get('/items/create-from-import')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Item/Import')
            ->has('items', 1)
        );
});

it('stores an item and validates required fields including model', function () {
    actingAsItemManager();

    $this->from(route('items.create'))
        ->post(route('items.store'), [])
        ->assertSessionHasErrors([
            'item_type',
            'supplier',
            'location_id',
            'description',
            'model',
            'serial',
            'quantity',
            'srp',
            'unit_cost',
            'date_of_purchase',
        ]);

    $this->post(route('items.store'), validItemPayload())
        ->assertRedirect(route('items.index'));

    $this->assertDatabaseHas('items', [
        'description' => 'Split Type Air Conditioner',
        'model' => 'AC-1000',
        'serial' => 'SN-ITEM-1001',
    ]);
});

it('updates an item and validates unique serials and required model', function () {
    actingAsItemManager();
    $item = createItemRecord(['serial' => 'SN-ORIGINAL']);
    $duplicate = createItemRecord(['serial' => 'SN-DUPLICATE']);

    $this->from(route('items.edit', $item))
        ->put(route('items.update', $item), validItemPayload([
            'model' => '',
            'serial' => 'SN-UNIQUE',
        ]))
        ->assertSessionHasErrors('model');

    $this->from(route('items.edit', $item))
        ->put(route('items.update', $item), validItemPayload([
            'model' => 'MODEL-UPDATED',
            'serial' => $duplicate->serial,
        ]))
        ->assertSessionHasErrors('serial');

    $this->put(route('items.update', $item), validItemPayload([
        'description' => 'Updated TV',
        'model' => 'TV-UPDATED',
        'serial' => 'SN-UPDATED',
    ]))->assertRedirect(route('items.index'));

    $this->assertDatabaseHas('items', [
        'id' => $item->id,
        'description' => 'Updated TV',
        'model' => 'TV-UPDATED',
        'serial' => 'SN-UPDATED',
    ]);
});

it('does not render edit for unavailable items', function () {
    actingAsItemManager();
    $item = createItemRecord(['date_out' => now()->toDateString()]);

    $this->get(route('items.edit', $item))->assertForbidden();
});

it('moves an item and records transfer history from the original location', function () {
    actingAsItemManager();
    $fromLocation = Location::factory()->create();
    $toLocation = Location::factory()->create();
    $item = createItemRecord(['location_id' => $fromLocation->id]);

    $this->from(route('items.show', $item))
        ->put(route('items.move', $item), [])
        ->assertSessionHasErrors(['location_id', 'remarks']);

    $this->put(route('items.move', $item), [
        'location_id' => $toLocation->id,
        'remarks' => 'Moved to display area',
    ])->assertRedirect();

    $this->assertDatabaseHas('items', [
        'id' => $item->id,
        'location_id' => $toLocation->id,
    ]);

    $this->assertDatabaseHas('transfer_data', [
        'item_id' => $item->id,
        'from_location_id' => $fromLocation->id,
        'to_location_id' => $toLocation->id,
        'remarks' => 'Moved to display area',
    ]);
});

it('does not transfer an item to the same location', function () {
    actingAsItemManager();
    $location = Location::factory()->create();
    $item = createItemRecord(['location_id' => $location->id]);

    $this->from(route('items.show', $item))
        ->put(route('items.move', $item), [
            'location_id' => $location->id,
            'remarks' => 'No actual move',
        ])
        ->assertSessionHasErrors('location_id');
});

it('soft deletes an item', function () {
    actingAsItemManager();
    $item = createItemRecord();

    $this->delete(route('items.destroy', $item))
        ->assertRedirect(route('items.index'));

    $this->assertSoftDeleted('items', ['id' => $item->id]);
});

it('does not archive an item linked to a transaction', function () {
    actingAsItemManager();
    $location = Location::factory()->create();
    $user = User::factory()->create();
    $item = createItemRecord(['location_id' => $location->id]);
    $order = Order::create([
        'customer_id' => null,
        'order_number' => 'ORD-LINKED-ITEM',
        'location_id' => $location->id,
        'employee_id' => $user->id,
        'total_price' => 1000,
        'transaction_date' => now(),
        'payment_method' => 'Cash',
        'receipt_number' => 'LINKED-ITEM-RECEIPT',
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'item_id' => $item->id,
        'serial' => $item->serial,
        'sale_amount' => 1000,
    ]);

    $this->from(route('items.show', $item))
        ->delete(route('items.destroy', $item))
        ->assertSessionHasErrors('item');

    $this->assertNotSoftDeleted('items', ['id' => $item->id]);
});

it('validates item import upload and stores parsed rows in session', function () {
    actingAsItemManager();
    $location = Location::factory()->create(['name' => 'Main Warehouse']);

    $this->from('/items/create-from-import')
        ->post(route('items.import.upload'), [])
        ->assertSessionHasErrors('file');

    $this->post(route('items.import.upload'), [
        'file' => uploadedItemsSpreadsheet($location),
    ])
        ->assertRedirect()
        ->assertSessionHas('imported_items');

    $importedItems = session('imported_items');

    expect($importedItems)->toHaveCount(1)
        ->and($importedItems[0]['description'])->toBe('Imported Refrigerator')
        ->and($importedItems[0]['model'])->toBe('REF-9000')
        ->and($importedItems[0]['location_id'])->toBe($location->id);
});

it('saves imported items and requires imported model values', function () {
    actingAsItemManager();
    $location = Location::factory()->create();

    $validImportedItem = [
        'row_number' => 2,
        'item_type' => 'appliances',
        'supplier_name' => 'New Import Supplier',
        'location_id' => $location->id,
        'dr_no' => 'DR-SAVE',
        'description' => 'Imported Television',
        'model' => 'TV-IMPORT',
        'serial' => 'IMPORT-SAVE-001',
        'quantity' => 1,
        'srp' => 45000,
        'unit_cost' => 35000,
        'date_of_purchase' => '2026-06-20',
        'date_out' => null,
        'size' => '55 inch',
        'remarks' => 'Saved from import',
    ];

    $this->post(route('items.import.save'))
        ->assertSessionHasErrors('error');

    $this->withSession(['imported_items' => [array_merge($validImportedItem, ['model' => null])]])
        ->post(route('items.import.save'))
        ->assertSessionHasErrors('error');

    $this->assertDatabaseMissing('items', ['serial' => 'IMPORT-SAVE-001']);

    $this->withSession(['imported_items' => [$validImportedItem]])
        ->post(route('items.import.save'))
        ->assertRedirect(route('items.index'))
        ->assertSessionMissing('imported_items');

    $this->assertDatabaseHas('suppliers', [
        'name' => 'New Import Supplier',
    ]);

    $this->assertDatabaseHas('items', [
        'description' => 'Imported Television',
        'model' => 'TV-IMPORT',
        'serial' => 'IMPORT-SAVE-001',
    ]);
});

it('cancels an item import session', function () {
    actingAsItemManager();

    $this->withSession(['imported_items' => [['description' => 'Discard me']]])
        ->post(route('items.import.cancel'))
        ->assertRedirect()
        ->assertSessionMissing('imported_items');
});
