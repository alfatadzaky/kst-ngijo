<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SustainabilityDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sustainability_data')->delete();

        $today   = Carbon::today();
        $adminId = 1;

        // ==================================================
        // ENERGY — Hourly data buat timeline chart
        // Solar peak di siang, rendah pagi/malem (realistis)
        // ==================================================
        $sources = [
            ['location' => 'North Solar Grid A-12',   'type' => 'Photovoltaic Output',   'base' => 120, 'target' => 145],
            ['location' => 'South Solar Array B-7',    'type' => 'Photovoltaic Output',   'base' => 85,  'target' => 100],
            ['location' => 'Wind Turbine Cluster W-1', 'type' => 'Wind Power Output',     'base' => 62,  'target' => 70 ],
            ['location' => 'Biomass Plant Chamber 1',  'type' => 'Biomass Energy Output', 'base' => 38,  'target' => 42 ],
        ];

        // Hour -> solar multiplier
        $slots = [
            6  => 0.35,
            9  => 0.70,
            12 => 1.00,
            15 => 0.90,
            18 => 0.55,
            21 => 0.20,
        ];

        foreach ($slots as $hour => $mult) {
            foreach ($sources as $src) {
                $val = max(0, round($src['base'] * $mult + rand(-4, 4), 1));
                $ts  = $today->copy()->setHour($hour)->setMinute(rand(0, 59));
                DB::table('sustainability_data')->insert([
                    'record_date'         => $today->toDateString(),
                    'category'            => 'energy',
                    'metric_name'         => $src['location'],
                    'notes'               => $src['type'],
                    'value'               => $val,
                    'unit'                => 'MWh',
                    'target_value'        => $src['target'],
                    'status'              => 'approved',
                    'created_by_user_id'  => $adminId,
                    'approved_by_user_id' => $adminId,
                    'synced_at'           => $ts,
                    'created_at'          => $ts,
                    'updated_at'          => $ts,
                ]);
            }
        }

        // ==================================================
        // WATER — Recycled vs Fresh
        // ==================================================
        $waterStations = [
            ['location' => 'Western Water Rec. Station', 'type' => 'Recycled Water',    'value' => 124.5, 'target' => 150.0],
            ['location' => 'Eastern Treatment Plant',    'type' => 'Recycled Water',    'value' => 89.7,  'target' => 100.0],
            ['location' => 'Main Supply Channel C-1',   'type' => 'Fresh Water Supply', 'value' => 67.3,  'target' => 75.0 ],
            ['location' => 'North Reservoir Feed',      'type' => 'Fresh Water Supply', 'value' => 43.8,  'target' => 50.0 ],
        ];

        foreach ($waterStations as $ws) {
            $ts = $today->copy()->setHour(rand(8, 16))->setMinute(rand(0, 59));
            DB::table('sustainability_data')->insert([
                'record_date'         => $today->toDateString(),
                'category'            => 'water',
                'metric_name'         => $ws['location'],
                'notes'               => $ws['type'],
                'value'               => $ws['value'],
                'unit'                => 'L/sec',
                'target_value'        => $ws['target'],
                'status'              => 'approved',
                'created_by_user_id'  => $adminId,
                'approved_by_user_id' => $adminId,
                'synced_at'           => $ts,
                'created_at'          => $ts,
                'updated_at'          => $ts,
            ]);
        }

        // ==================================================
        // WASTE — 5 hari terakhir (buat bar chart weekly)
        // ==================================================
        $wasteStations = [
            ['location' => 'Main Waste Sorting Conveyor', 'type' => 'Solid Waste Metrics', 'base' => 12.4, 'target' => 15.0],
            ['location' => 'Bio-Waste Digester #4',       'type' => 'Methane Output',       'base' => 8.8,  'target' => 10.0],
            ['location' => 'Organic Compost Unit 2',      'type' => 'Compost Output',        'base' => 5.2,  'target' => 6.0 ],
        ];

        for ($d = 4; $d >= 0; $d--) {
            $date = $today->copy()->subDays($d);
            $ts   = $date->copy()->setHour(17)->setMinute(rand(0, 59));
            foreach ($wasteStations as $ws) {
                $val = max(0, round($ws['base'] + rand(-15, 25) / 10, 1));
                DB::table('sustainability_data')->insert([
                    'record_date'         => $date->toDateString(),
                    'category'            => 'waste',
                    'metric_name'         => $ws['location'],
                    'notes'               => $ws['type'],
                    'value'               => $val,
                    'unit'                => 'ton',
                    'target_value'        => $ws['target'],
                    'status'              => 'approved',
                    'created_by_user_id'  => $adminId,
                    'approved_by_user_id' => $adminId,
                    'synced_at'           => $ts,
                    'created_at'          => $ts,
                    'updated_at'          => $ts,
                ]);
            }
        }
    }
}