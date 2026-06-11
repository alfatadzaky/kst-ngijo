<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            // Drop FK lama ke users
            $table->dropForeign(['principal_investigator_id']);
            // Tambah FK baru ke researchers (nullable biar ga error kalau existing data)
            $table->foreign('principal_investigator_id')
                  ->references('id')->on('researchers')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->dropForeign(['principal_investigator_id']);
            $table->foreign('principal_investigator_id')
                  ->references('id')->on('users')
                  ->nullOnDelete();
        });
    }
};