<?php

namespace App\Observers;

use App\Events\GbairaiHidden;
use App\Models\Gbairai;
use Illuminate\Support\Facades\Log;

class GbairaiObserver
{
    /**
     * Handle the Gbairai "saving" event.
     * Automatically hide post if report threshold (10) is reached.
     */
    public function saving(Gbairai $gbairai): void
    {
        if ($gbairai->reports_count >= 10 && $gbairai->status === 'active') {
            $gbairai->status = 'hidden';
            Log::info("Gbairai #{$gbairai->id} has been automatically hidden due to 10+ reports.");
        }
    }

    /**
     * Handle the Gbairai "updated" event.
     */
    public function updated(Gbairai $gbairai): void
    {
        if ($gbairai->wasChanged('status') && $gbairai->status === 'hidden') {
            GbairaiHidden::dispatch($gbairai);
        }
    }
}

