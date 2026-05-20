<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    // Cuma kolom-kolom ini yang boleh di-input lewat API
    protected $fillable = [
        'name',
        'description',
        'location',
        'image_url',
        'is_active',
    ];

    // Otomatis ubah status dari database jadi boolean murni pas keluar di JSON API
    protected $casts = [
        'is_active' => 'boolean',
    ];
}