<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'name' => 'Gedung Laboratorium Bersama',
                'description' => 'Fasilitas riset terpadu untuk pengujian produk tenant KST Ngijo, dilengkapi dengan instrumen analisis modern.',
                'location' => 'Zona Riset, Sektor Barat',
                'image_url' => 'https://placehold.co/600x400/png?text=Gedung+Lab',
                'is_active' => true,
            ],
            [
                'name' => 'Gedung Inkubator Bisnis (Tenant Area)',
                'description' => 'Ruang kerja co-working space dan kantor privat khusus untuk startup dan tenant binaan Universitas Brawijaya.',
                'location' => 'Zona Bisnis, Sektor Utama',
                'image_url' => 'https://placehold.co/600x400/png?text=Inkubator+Bisnis',
                'is_active' => true,
            ],
            [
                'name' => 'Pilot Plant Pengolahan Limbah',
                'description' => 'Fasilitas pengolahan hasil samping produksi untuk mendukung prinsip sustainability di kawasan KST Ngijo.',
                'location' => 'Zona Utilitas, Sektor Selatan',
                'image_url' => 'https://placehold.co/600x400/png?text=Pilot+Plant',
                'is_active' => true,
            ]
        ];

        foreach ($data as $item) {
            Facility::create($item);
        }
    }
}