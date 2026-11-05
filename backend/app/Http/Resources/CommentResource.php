<?php

namespace App\Http\Resources;

use App\Services\DeviceService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $deviceService = app(DeviceService::class);
        $currentDeviceHash = $deviceService->getHashedDeviceIdFromRequest($request);

        $isMine = $currentDeviceHash && ($this->device_id_hash === $currentDeviceHash);

        return [
            'id' => $this->id,
            'gbairai_id' => $this->gbairai_id,
            'random_pseudo' => $this->random_pseudo,
            'content' => $this->content,
            'is_author' => str_contains($this->random_pseudo, 'Auteur') || ($this->gbairai && $this->gbairai->device_id_hash === $this->device_id_hash),
            'is_mine' => (bool) $isMine,
            'created_at' => $this->created_at?->toISOString(),
            'time_ago' => $this->created_at?->diffForHumans(),
        ];
    }
}

