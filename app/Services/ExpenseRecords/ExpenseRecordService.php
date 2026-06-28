<?php

namespace App\Services\ExpenseRecords;

use App\Models\ExpenseRecord;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ExpenseRecordService
{
    public function paginateForUser(User $user, array $filters, int $perPage = 8): LengthAwarePaginator
    {
        return ExpenseRecord::query()
            ->with('user')
            ->when(! $user->getRoleNames()->contains('super admin'), function (Builder $query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('reference_number', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%")
                        ->orWhereHas('user', function (Builder $query) use ($search) {
                            $query->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['user_id'] ?? null, fn (Builder $query, string $userId) => $query->where('user_id', $userId))
            ->when($filters['date'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', $date))
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, ?UploadedFile $receipt = null): ExpenseRecord
    {
        if ($receipt) {
            $data['receipt_path'] = $this->storeReceipt($receipt);
        }

        $data['status'] = 'approved';

        return ExpenseRecord::create($data);
    }

    public function update(ExpenseRecord $expenseRecord, array $data, ?UploadedFile $receipt = null): ExpenseRecord
    {
        if ($receipt) {
            $this->deleteReceipt($expenseRecord);
            $data['receipt_path'] = $this->storeReceipt($receipt);
        } else {
            unset($data['receipt_path']);
        }

        $expenseRecord->update($data);

        return $expenseRecord->refresh();
    }

    public function delete(ExpenseRecord $expenseRecord): void
    {
        $this->deleteReceipt($expenseRecord);
        $expenseRecord->delete();
    }

    public function updateStatus(ExpenseRecord $expenseRecord, string $status, ?int $reviewerId): ExpenseRecord
    {
        $expenseRecord->update([
            'status' => $status,
            'approved_by' => $status !== 'pending' ? $reviewerId : null,
            'approved_at' => $status !== 'pending' ? now() : null,
        ]);

        return $expenseRecord->refresh();
    }

    private function storeReceipt(UploadedFile $receipt): string
    {
        $imageName = time().'_'.uniqid().'.'.$receipt->getClientOriginalExtension();

        return $receipt->storeAs('receipts', $imageName, 'public');
    }

    private function deleteReceipt(ExpenseRecord $expenseRecord): void
    {
        if ($expenseRecord->receipt_path) {
            Storage::disk('public')->delete($expenseRecord->receipt_path);
        }
    }
}
