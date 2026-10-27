<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'title',
        'content',
        'target_date'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}