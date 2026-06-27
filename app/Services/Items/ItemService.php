<?php

namespace App\Services\Items;

use App\Imports\ItemsImport;
use App\Models\Item;
use App\Models\Location;
use App\Models\Supplier;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ItemService
{
    public function paginate(array $filters, int $perPage = 8): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function exportItems(array $filters): Collection
    {
        return $this->filteredQuery($filters, searchDescriptionOnly: true)->get();
    }

    public function create(array $data): Item
    {
        return Item::create($data);
    }

    public function update(Item $item, array $data): Item
    {
        $item->update($data);

        return $item->refresh();
    }

    public function delete(Item $item): void
    {
        $item->delete();
    }

    public function move(Item $item, array $data): Item
    {
        return DB::transaction(function () use ($item, $data) {
            $fromLocationId = $item->location_id;

            $item->update(['location_id' => $data['location_id']]);

            $item->transfer_data()->create([
                'from_location_id' => $fromLocationId,
                'to_location_id' => $data['location_id'],
                'remarks' => $data['remarks'],
            ]);

            return $item->refresh();
        });
    }

    public function importPreview(UploadedFile $file): array
    {
        $rows = Excel::toCollection(new ItemsImport, $file)->first();
        $locations = Location::all()->keyBy('name');
        $validItemTypes = ['appliances', 'gadgets', 'furniture'];

        return $rows->skip(1)
            ->filter(fn ($row) => ! empty($row[0]) || ! empty($row[5]))
            ->map(function ($row, int $index) use ($locations, $validItemTypes) {
                $itemType = strtolower(trim($row[0] ?? ''));

                if (! in_array($itemType, $validItemTypes)) {
                    $itemType = null;
                }

                $locationName = $row[2] ?? null;

                return [
                    'row_number' => $index + 2,
                    'item_type' => $itemType,
                    'supplier_name' => trim($row[1] ?? ''),
                    'location_id' => $locationName && isset($locations[$locationName])
                        ? $locations[$locationName]->id
                        : null,
                    'location_display' => $locationName,
                    'dr_no' => $row[3] ?? null,
                    'description' => $row[4] ?? null,
                    'model' => $row[5] ?? null,
                    'serial' => $row[6] ?? null,
                    'quantity' => $row[7] ?? null,
                    'srp' => $row[8] ?? null,
                    'unit_cost' => $row[9] ?? null,
                    'date_of_purchase' => $this->convertExcelDate($row[10] ?? null),
                    'date_out' => $this->convertExcelDate($row[11] ?? null),
                    'size' => $row[12] ?? null,
                    'remarks' => $row[13] ?? null,
                ];
            })
            ->values()
            ->toArray();
    }

    public function saveImportedItems(array $items): int
    {
        if (empty($items)) {
            throw new Exception('No items to save.');
        }

        return DB::transaction(function () use ($items) {
            $savedCount = 0;

            foreach ($items as $item) {
                $this->validateImportedItem($item);

                Item::create([
                    'item_type' => $item['item_type'],
                    'supplier' => $this->getOrCreateSupplier($item['supplier_name']),
                    'location_id' => $item['location_id'],
                    'dr_no' => $item['dr_no'],
                    'description' => $item['description'],
                    'model' => $item['model'],
                    'serial' => $item['serial'],
                    'quantity' => $item['quantity'],
                    'srp' => $item['srp'],
                    'unit_cost' => $item['unit_cost'],
                    'date_of_purchase' => $item['date_of_purchase'],
                    'date_out' => $item['date_out'],
                    'remarks' => $item['remarks'],
                ]);

                $savedCount++;
            }

            return $savedCount;
        });
    }

    public function purchaseHistory(Item $item): Collection
    {
        $installmentOrders = $item->installment_orders->map(fn ($order) => [
            'order_number' => $order->order_number,
            'customer' => $order->customer->full_name,
            'transaction_date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
            'transaction_by' => $order->user->full_name,
            'created_at' => Carbon::parse($order->created_at)->format('F d, Y'),
        ]);

        $orders = $item->orders->map(fn ($order) => [
            'order_number' => $order->order_number,
            'customer' => $order->customer->full_name,
            'transaction_date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
            'transaction_by' => $order->employee->full_name,
            'created_at' => Carbon::parse($order->created_at)->format('F d, Y'),
        ]);

        return collect()
            ->concat($installmentOrders)
            ->concat($orders);
    }

    public function transferHistory(Item $item): Collection
    {
        return $item->transfer_data->map(fn ($transfer) => [
            'from_location' => $transfer->from_location->name,
            'to_location' => $transfer->to_location->name,
            'remarks' => $transfer->remarks,
            'transferred_at' => Carbon::parse($transfer->created_at)->format('F d, Y h:i A'),
        ]);
    }

    private function filteredQuery(array $filters, bool $searchDescriptionOnly = false): Builder
    {
        return Item::query()
            ->with(['supplier', 'location'])
            ->when($filters['search'] ?? null, function (Builder $query, string $search) use ($searchDescriptionOnly) {
                if ($searchDescriptionOnly) {
                    $query->where('description', 'like', "%{$search}%");

                    return;
                }

                $query->where(function (Builder $query) use ($search) {
                    $query->where('description', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('serial', 'like', "%{$search}%");
                });
            })
            ->when(($filters['availability'] ?? null) === 'available', fn (Builder $query) => $query->whereNull('date_out'))
            ->when(($filters['availability'] ?? null) === 'unavailable', fn (Builder $query) => $query->whereNotNull('date_out'))
            ->when($this->filledFilter($filters, 'supplier'), fn (Builder $query) => $query->where('supplier', $filters['supplier']))
            ->when($this->filledFilter($filters, 'item_type'), fn (Builder $query) => $query->where('item_type', $filters['item_type']))
            ->when($this->filledFilter($filters, 'location'), fn (Builder $query) => $query->where('location_id', $filters['location']));
    }

    private function filledFilter(array $filters, string $key): bool
    {
        return isset($filters[$key]) && $filters[$key] !== '' && $filters[$key] !== 'all';
    }

    private function validateImportedItem(array $item): void
    {
        if (empty($item['item_type'])) {
            throw new Exception("Row {$item['row_number']}: Item Type is required.");
        }

        if (empty($item['supplier_name']) || empty($item['location_id'])) {
            throw new Exception("Row {$item['row_number']}: Supplier and Location are required.");
        }

        if (empty($item['description'])) {
            throw new Exception("Row {$item['row_number']}: Description is required.");
        }

        if (empty($item['model'])) {
            throw new Exception("Row {$item['row_number']}: Model is required.");
        }
    }

    private function getOrCreateSupplier(string $supplierName): string
    {
        if (empty($supplierName)) {
            throw new Exception('Supplier name cannot be empty.');
        }

        $slug = Str::slug($supplierName);
        $supplier = Supplier::whereRaw('LOWER(name) = ?', [strtolower($supplierName)])->first();

        if (! $supplier) {
            $originalSlug = $slug;
            $counter = 1;

            while (Supplier::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }

            $supplier = Supplier::create([
                'name' => $supplierName,
                'slug' => $slug,
                'remarks' => 'Auto-created from import',
            ]);
        }

        return $supplier->slug;
    }

    private function convertExcelDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        if (is_string($value)) {
            try {
                return Carbon::parse($value)->format('Y-m-d');
            } catch (Exception) {
                return null;
            }
        }

        if (is_numeric($value)) {
            try {
                return Carbon::createFromTimestamp(($value - 25569) * 86400)->format('Y-m-d');
            } catch (Exception) {
                return null;
            }
        }

        return null;
    }
}
