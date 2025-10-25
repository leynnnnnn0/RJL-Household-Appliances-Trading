<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'SAVERS', 'slug' => 'savers'],
            ['name' => 'OUTLET', 'slug' => 'outlet'],
            ['name' => 'RFE', 'slug' => 'rfe'],
            ['name' => 'PULL OUT', 'slug' => 'pull-out'],
            ['name' => 'CAMEL', 'slug' => 'camel'],
            ['name' => 'STELLAR BRANDS', 'slug' => 'stellar-brands'],
            ['name' => 'JP CON', 'slug' => 'jp-con'],
            ['name' => 'XANDERON', 'slug' => 'xanderon'],
            ['name' => 'WAREHOUSE', 'slug' => 'warehouse'],
            ['name' => 'GADGET', 'slug' => 'gadget'],
            ['name' => 'PLATINUM', 'slug' => 'platinum'],
            ['name' => 'TARLAC MAC', 'slug' => 'tarlac-mac'],
            ['name' => 'ASTRON', 'slug' => 'astron'],
            ['name' => 'ASAHI', 'slug' => 'asahi'],
            ['name' => 'TOUGH MAMA', 'slug' => 'tough-mama'],
            ['name' => 'EUREKA', 'slug' => 'eureka'],
            ['name' => 'AMERICAN MASTER', 'slug' => 'american-master'],
            ['name' => 'RJL', 'slug' => 'rjl'],
            ['name' => 'FURNLITE', 'slug' => 'furnlite'],
            ['name' => 'KONZERT', 'slug' => 'konzert'],
            ['name' => 'B.R & PLUVIAL', 'slug' => 'br-pluvial'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => $category['slug'],
            ]);
        }

    }
}
