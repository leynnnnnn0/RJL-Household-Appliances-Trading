<?php

namespace App\Services\References;

use App\Models\Branch;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class BranchService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return Branch::query()
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

    public function create(array $data): Branch
    {
        return Branch::create($data);
    }

    public function update(Branch $branch, array $data): Branch
    {
        $branch->update($data);

        return $branch->refresh();
    }

    public function delete(Branch $branch): void
    {
     
        if ($this->isInUse($branch)) {
            throw new RuntimeException('Cannot delete branch. It is used by sales, payments, or expenses.');
        }
        $branch->delete();
    }

    private function isInUse(Branch $branch): bool
    {
        return $branch->orders()->exists()
            || $branch->installment_orders()->exists()
            || $branch->installment_order_payment_histories()->exists()
            || $branch->expense_records()->exists();
    }
}
