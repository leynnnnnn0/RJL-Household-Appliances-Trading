<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Item;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all items that haven't been ordered yet (date_out is null)
        $availableItems = Item::whereNull('date_out')->get();

        if ($availableItems->isEmpty()) {
            $this->command->info('No available items to create orders.');
            return;
        }

        // Create 20-30 orders
        $numberOfOrders = rand(20, 30);
        $itemsUsed = 0;

        for ($i = 0; $i < $numberOfOrders && $itemsUsed < $availableItems->count(); $i++) {
            // Random date in the last 180 days
            $orderDate = now()->subDays(rand(1, 180));
            
            // Generate order number based on the order date
            $dateFormat = $orderDate->format('Ymd');
            $sequence = $i + 1;
            $orderNumber = 'ORD-' . $dateFormat . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Random number of items per order (1-5 items)
            $itemsPerOrder = rand(1, min(5, $availableItems->count() - $itemsUsed));
            
            // Get items for this order
            $orderItems = $availableItems->slice($itemsUsed, $itemsPerOrder);
            
            // Calculate total price
            $totalPrice = $orderItems->sum('srp');

            DB::beginTransaction();
            
            try {
                // Create the order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'location_id' => rand(1, 2), // Random location (1 or 2)
                    'employee_id' => 1, // Fixed employee ID
                    'total_price' => $totalPrice,
                ]);

                // Create order items and update item date_out
                foreach ($orderItems as $item) {
                    $order->order_items()->create([
                        'serial' => $item->serial,
                        'item_id' => $item->id,
                        'sale_amount' => $item->srp,
                    ]);

                    // Update item date_out
                    $item->update([
                        'date_out' => $orderDate->toDateString()
                    ]);
                }

                DB::commit();
                $itemsUsed += $itemsPerOrder;
                
                $this->command->info("Created order {$orderNumber} with {$itemsPerOrder} items");
                
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error("Failed to create order: " . $e->getMessage());
            }
        }

        $this->command->info("Successfully created {$i} orders using {$itemsUsed} items.");
    }
}