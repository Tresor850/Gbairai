<?php

namespace App\Events;

use App\Models\Gbairai;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GbairaiHidden
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Gbairai $gbairai)
    {
    }
}

