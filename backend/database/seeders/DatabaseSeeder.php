<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Ini data master (wajib ada di prod/local)
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            UserSeeder::class,
            FacilitySeeder::class,
        ]);

        // Ini data dummy (cuma jalan di local dev)
        if (app()->environment('local')) {
            // $this->call([
            //     SustainabilityDataSeeder::class,
            // ]);
        }
    }
}