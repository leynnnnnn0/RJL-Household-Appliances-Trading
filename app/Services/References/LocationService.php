<?php

namespace App\Services\References;

use App\Models\Location;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class LocationService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return Location::query()
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Location
    {
        return Location::create($data);
    }

    public function update(Location $location, array $data): Location
    {
        $location->update($data);

        return $location->refresh();
    }

    public function delete(Location $location): void
    {
        if ($location->items()->withTrashed()->exists()) {
            throw new RuntimeException('Cannot delete location. It has associated inventory items.');
        }

        $location->delete();
    }
}
