<?php

namespace App\Services\POSCash;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class POSCashService
{
    public function todayTransactionsForCurrentUser(): Collection
    {
        return Order::with(['order_items.item', 'location', 'branch'])
            ->whereDate('transaction_date', today())
            ->where('employee_id', Auth::id())
            ->latest()
            ->get();
    }

    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $customer = $this->upsertCustomer($data);
            $order = Order::create([
                'customer_id' => $customer->id,
                'location_id' => 1,
                'branch_id' => $data['location_id'],
                'employee_id' => $data['employee_id'],
                'order_number' => $this->generateOrderNumber(),
                'total_price' => $data['total_price'],
                'payment_method' => $data['payment_method'],
                'reference_number' => $data['reference_number'] ?? null,
                'transaction_date' => now(),
                'receipt_number' => $data['receipt_number'],
            ]);

            foreach ($data['orders'] as $item) {
                $inventoryItem = Item::where('date_out', null)->findOrFail($item['id']);
                $inventoryItem->update([
                    'date_out' => Carbon::parse(Carbon::parse($order->transaction_date)->toDateString()),
                ]);

                $order->order_items()->create([
                    'order_number' => $order->order_number,
                    'serial' => $item['serial'],
                    'item_id' => $item['id'],
                    'sale_amount' => $item['sale_amount'],
                    'discount_amount' => $inventoryItem->srp - $item['sale_amount'],
                ]);
            }

            return $order;
        });
    }

    public function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = Order::whereDate('created_at', today())
            ->latest('id')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;

        return 'ORD-'.$date.'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function upsertCustomer(array $data): Customer
    {
        $customerData = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'address' => $data['address'],
            'phone_number' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'city' => $data['city'],
            'province' => $data['province'],
            'zipcode' => $data['zipcode'] ?? null,
            'country' => $data['country'],
        ];

        if (isset($data['existing_customer_id'])) {
            $customer = Customer::findOrFail($data['existing_customer_id']);
            $customer->update($customerData);

            return $customer;
        }

        return Customer::create($customerData);
    }
}
