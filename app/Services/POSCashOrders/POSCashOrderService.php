<?php

namespace App\Services\POSCashOrders;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class POSCashOrderService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->baseIndexQuery($filters)
            ->latest()
            ->paginate(8)
            ->withQueryString();
    }

    public function findByOrderNumber(string $orderNumber): Order
    {
        return Order::with('order_items.item', 'employee', 'location', 'customer', 'branch')
            ->where('order_number', $orderNumber)
            ->firstOrFail();
    }

    public function void(int $orderId, array $data): Order
    {
        return DB::transaction(function () use ($orderId, $data) {
            $order = Order::with('order_items.item')->findOrFail($orderId);

            $order->update([
                'reason_for_cancellation' => $data['reason_for_cancellation'],
                'user_id' => Auth::id(),
                'void_date' => now(),
                'is_void' => true,
            ]);

            foreach ($order->order_items as $orderItem) {
                $orderItem->item?->update(['date_out' => null]);
            }

            return $order;
        });
    }

    public function getForPdf(array $filters): Collection
    {
        return $this->basePdfQuery($filters)
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function pdfData(Collection $orders, array $filters): array
    {
        return [
            'orders' => $orders,
            'dateFrom' => $filters['date_from'] ?? now()->startOfDay(),
            'dateTo' => $filters['date_to'] ?? now()->endOfDay(),
            'status' => $filters['status'] ?? 'all',
            'generatedAt' => now()->format('F d, Y h:i A'),
            'totalOrders' => $orders->count(),
            'totalActive' => $orders->where('is_void', false)->count(),
            'totalVoided' => $orders->where('is_void', true)->count(),
            'totalAmount' => $orders->where('is_void', false)->sum('total_price'),
            'voidedAmount' => $orders->where('is_void', true)->sum('total_price'),
        ];
    }

    private function baseIndexQuery(array $filters): Builder
    {
        return $this->applyCommonFilters(
            Order::with('order_items.item', 'employee', 'location', 'branch'),
            $filters,
            'branch_id'
        );
    }

    private function basePdfQuery(array $filters): Builder
    {
        return $this->applyCommonFilters(
            Order::with([
                'order_items.item.supplier',
                'order_items.item.location',
                'location',
                'employee',
            ]),
            $filters,
            'location_id'
        );
    }

    private function applyCommonFilters(Builder $query, array $filters, string $locationColumn): Builder
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function (Builder $query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhere('employee_id', $search);
            });
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('transaction_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('transaction_date', '<=', $filters['date_to']);
        }

        if (! empty($filters['location_id']) && $filters['location_id'] !== 'all') {
            $query->where($locationColumn, $filters['location_id']);
        }

        if (! empty($filters['employee_id']) && $filters['employee_id'] !== 'all') {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->when($filters['status'] === '0', fn (Builder $query) => $query->where('is_void', false))
                ->when($filters['status'] === '1', fn (Builder $query) => $query->where('is_void', true));
        }

        return $query;
    }
}
