<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'gbairai_id',
        'device_id_hash',
        'random_pseudo',
        'content',
    ];

    /**
     * The Gbairai this comment belongs to.
     */
    public function gbairai(): BelongsTo
    {
        return $this->belongsTo(Gbairai::class);
    }
}

