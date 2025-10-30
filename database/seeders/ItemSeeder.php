<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Item;
use Illuminate\Support\Facades\DB;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            'savers', 'outlet', 'rfe', 'pull-out', 'camel', 'stellar-brands',
            'jp-con', 'xanderon', 'warehouse', 'gadget', 'platinum', 'tarlac-mac',
            'astron', 'asahi', 'tough-mama', 'eureka', 'american-master', 'rjl',
            'furnlite', 'konzert', 'br-pluvial'
        ];

        $itemTypes = [
            'appliances', 'furniture', 'gadgets'
        ];

        $descriptions = [
            'Refrigerator', 'Air Conditioner', 'Washing Machine', 'Microwave Oven',
            'Electric Fan', 'Television', 'Office Chair', 'Desk', 'Filing Cabinet',
            'Printer', 'Computer Monitor', 'Keyboard', 'Mouse', 'Speaker System',
            'Coffee Maker', 'Water Dispenser', 'Vacuum Cleaner', 'Blender',
            'Rice Cooker', 'Electric Kettle', 'Toaster', 'Standing Fan',
            'Wall Mount Bracket', 'Extension Cord', 'Power Strip', 'LED Bulbs',
            'Tool Kit', 'Ladder', 'Storage Rack', 'Display Cabinet'
        ];

        $models = [
            'Model A-100', 'Model B-200', 'Model C-300', 'Model D-400',
            'Pro Series 1', 'Pro Series 2', 'Elite X', 'Elite Y',
            'Standard Plus', 'Premium Edition', 'Deluxe Version', 'Basic Model',
            'Advanced Series', 'Professional Grade', 'Commercial Type'
        ];

        $sizes = [
            'Small', 'Medium', 'Large', 'Extra Large', 'Compact',
            '10"', '15"', '20"', '24"', '32"', '42"', '50"',
            'Standard', 'Industrial', 'Portable'
        ];

        $remarks = [
            'Brand New', 'Good Condition', 'Excellent Quality', 'For Display',
            'Ready for Deployment', 'In Stock', 'Available', 'Reserved',
            'Checked and Tested', 'Warranty Included', null
        ];

        // Assuming location IDs 1 and 2 exist (Warehouse 1 and Warehouse 2)
        $locationIds = [1, 2];

        $items = [];
        
        for ($i = 1; $i <= 100; $i++) {
            $datePurchase = now()->subDays(rand(1, 365))->format('Y-m-d');
            $dateOut = rand(0, 1) ? now()->subDays(rand(1, 180))->format('Y-m-d') : null;
            $quantity = rand(1, 50);
            $unitCost = rand(500, 50000);
            $srp = $unitCost * 1.3; // 30% markup

            $items[] = [
                'supplier' => $suppliers[array_rand($suppliers)],
                'location_id' => $locationIds[array_rand($locationIds)],
                'item_type' => $itemTypes[array_rand($itemTypes)],
                'dr_no' => 'DR-' . date('Y') . '-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'description' => $descriptions[array_rand($descriptions)],
                'model' => $models[array_rand($models)],
                'serial' => 'SN-' . strtoupper(substr(md5($i), 0, 12)),
                'quantity' => 1,
                'srp' => $srp,
                'unit_cost' => $unitCost,
                'date_of_purchase' => $datePurchase,
                'date_out' => null,
                'size' => $sizes[array_rand($sizes)],
                'remarks' => $remarks[array_rand($remarks)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all items at once for better performance
        DB::table('items')->insert($items);
    }
}