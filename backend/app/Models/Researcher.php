<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Researcher extends Model
{
    protected $fillable = ['name', 'institution'];

    public function projects()
    {
        return $this->hasMany(ResearchProject::class, 'principal_investigator_id');
    }
}