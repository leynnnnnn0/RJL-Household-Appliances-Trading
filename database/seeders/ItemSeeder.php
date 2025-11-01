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

        $itemsByType = [
            'appliances' => [
                ['desc' => 'Refrigerator', 'models' => ['RFG-500L', 'RFG-300L', 'RFG-200L'], 'sizes' => ['Large', 'Medium', 'Small'], 'cost' => [15000, 25000]],
                ['desc' => 'Air Conditioner', 'models' => ['AC-1HP', 'AC-1.5HP', 'AC-2HP'], 'sizes' => ['1HP', '1.5HP', '2HP'], 'cost' => [12000, 20000]],
                ['desc' => 'Washing Machine', 'models' => ['WM-7KG', 'WM-9KG', 'WM-11KG'], 'sizes' => ['7KG', '9KG', '11KG'], 'cost' => [8000, 15000]],
                ['desc' => 'Electric Fan', 'models' => ['EF-16"', 'EF-18"', 'EF-20"'], 'sizes' => ['16"', '18"', '20"'], 'cost' => [800, 2000]],
                ['desc' => 'Television', 'models' => ['TV-32"', 'TV-43"', 'TV-55"'], 'sizes' => ['32"', '43"', '55"'], 'cost' => [8000, 25000]],
                ['desc' => 'Microwave Oven', 'models' => ['MO-20L', 'MO-25L', 'MO-30L'], 'sizes' => ['20L', '25L', '30L'], 'cost' => [3000, 6000]],
                ['desc' => 'Rice Cooker', 'models' => ['RC-1L', 'RC-1.8L', 'RC-2.8L'], 'sizes' => ['1L', '1.8L', '2.8L'], 'cost' => [1500, 4000]],
                ['desc' => 'Water Dispenser', 'models' => ['WD-Hot&Cold', 'WD-Cold', 'WD-Premium'], 'sizes' => ['Standard', 'Compact'], 'cost' => [3000, 8000]],
            ],
            'furniture' => [
                ['desc' => 'Office Chair', 'models' => ['OC-Executive', 'OC-Standard', 'OC-Ergonomic'], 'sizes' => ['Standard', 'Large'], 'cost' => [2000, 8000]],
                ['desc' => 'Desk', 'models' => ['DSK-Office', 'DSK-Computer', 'DSK-Executive'], 'sizes' => ['120cm', '140cm', '160cm'], 'cost' => [3000, 12000]],
                ['desc' => 'Filing Cabinet', 'models' => ['FC-2D', 'FC-3D', 'FC-4D'], 'sizes' => ['2 Drawer', '3 Drawer', '4 Drawer'], 'cost' => [2500, 6000]],
                ['desc' => 'Sofa Set', 'models' => ['SF-2Seater', 'SF-3Seater', 'SF-LShape'], 'sizes' => ['2-Seater', '3-Seater', 'L-Shape'], 'cost' => [8000, 25000]],
                ['desc' => 'Dining Set', 'models' => ['DS-4Seater', 'DS-6Seater', 'DS-8Seater'], 'sizes' => ['4-Seater', '6-Seater', '8-Seater'], 'cost' => [10000, 30000]],
                ['desc' => 'Cabinet', 'models' => ['CB-Kitchen', 'CB-Display', 'CB-Storage'], 'sizes' => ['Small', 'Medium', 'Large'], 'cost' => [4000, 15000]],
                ['desc' => 'Bed Frame', 'models' => ['BF-Single', 'BF-Double', 'BF-Queen'], 'sizes' => ['Single', 'Double', 'Queen'], 'cost' => [5000, 18000]],
            ],
            'gadgets' => [
                ['desc' => 'Laptop', 'models' => ['LP-i3', 'LP-i5', 'LP-i7'], 'sizes' => ['14"', '15.6"'], 'cost' => [18000, 45000]],
                ['desc' => 'Smartphone', 'models' => ['SP-Budget', 'SP-Mid', 'SP-Premium'], 'sizes' => ['6.1"', '6.5"', '6.7"'], 'cost' => [5000, 35000]],
                ['desc' => 'Tablet', 'models' => ['TB-8"', 'TB-10"', 'TB-12"'], 'sizes' => ['8"', '10"', '12"'], 'cost' => [6000, 25000]],
                ['desc' => 'Printer', 'models' => ['PR-Inkjet', 'PR-Laser', 'PR-AIO'], 'sizes' => ['Compact', 'Standard'], 'cost' => [3000, 12000]],
                ['desc' => 'Monitor', 'models' => ['MN-22"', 'MN-24"', 'MN-27"'], 'sizes' => ['22"', '24"', '27"'], 'cost' => [4000, 15000]],
                ['desc' => 'Speaker System', 'models' => ['SPK-2.1', 'SPK-5.1', 'SPK-Soundbar'], 'sizes' => ['2.1CH', '5.1CH'], 'cost' => [2000, 10000]],
            ],
        ];

        $remarks = [
            'Brand New', 'Good Condition', 'Excellent Quality', 'For Display',
            'Ready for Deployment', 'In Stock', 'Available', 'Reserved',
            'Checked and Tested', 'Warranty Included', null
        ];

        $locationIds = [1, 2];
        $items = [];
        $counter = 1;

        // Generate 600 items to ensure enough for 500 orders
        foreach ($itemTypes as $itemType) {
            $typeItems = $itemsByType[$itemType];
            $itemsPerType = ceil(600 / count($itemTypes));
            
            for ($i = 0; $i < $itemsPerType; $i++) {
                $itemData = $typeItems[array_rand($typeItems)];
                $datePurchase = now()->subDays(rand(1, 400))->format('Y-m-d');
                $unitCost = rand($itemData['cost'][0], $itemData['cost'][1]);
                $srp = round($unitCost * (rand(125, 140) / 100));

                $items[] = [
                    'supplier' => $suppliers[array_rand($suppliers)],
                    'location_id' => $locationIds[array_rand($locationIds)],
                    'item_type' => $itemType,
                    'dr_no' => 'DR-' . date('Y') . '-' . str_pad($counter, 5, '0', STR_PAD_LEFT),
                    'description' => $itemData['desc'],
                    'model' => $itemData['models'][array_rand($itemData['models'])],
                    'serial' => 'SN-' . strtoupper(substr(md5($counter . time()), 0, 12)),
                    'quantity' => 1,
                    'srp' => $srp,
                    'unit_cost' => $unitCost,
                    'date_of_purchase' => $datePurchase,
                    'date_out' => null,
                    'size' => $itemData['sizes'][array_rand($itemData['sizes'])],
                    'remarks' => $remarks[array_rand($remarks)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                $counter++;
            }
        }

        DB::table('items')->insert($items);
    }
}