<?php

namespace App\Services\References;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use RuntimeException;

class SupplierService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return Supplier::query()
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Supplier
    {
        $data['slug'] = $this->uniqueSlug($data['name']);

        return Supplier::create($data);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        if (! $supplier->items()->withTrashed()->exists()) {
            $data['slug'] = $this->uniqueSlug($data['name'], $supplier);
        }

        $supplier->update($data);

        return $supplier->refresh();
    }

    public function delete(Supplier $supplier): void
    {
        if ($supplier->items()->withTrashed()->exists()) {
            throw new RuntimeException('Cannot delete supplier. It has associated inventory items.');
        }

        $supplier->delete();
    }

    private function uniqueSlug(string $name, ?Supplier $ignore = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $count = 1;

        while (
            Supplier::query()
                ->when($ignore, fn (Builder $query) => $query->whereKeyNot($ignore->id))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        return $slug;
    }
}
