<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'gbairai_id',
        'device_id_hash',
    ];

    /**
     * The Gbairai that was liked.
     */
    public function gbairai(): BelongsTo
    {
        return $this->belongsTo(Gbairai::class);
    }
}

