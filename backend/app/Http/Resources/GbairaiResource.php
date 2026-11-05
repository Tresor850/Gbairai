<?php

namespace App\Http\Resources;

use App\Services\DeviceService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GbairaiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $deviceService = app(DeviceService::class);
        $currentDeviceHash = $deviceService->getHashedDeviceIdFromRequest($request);

        // Determine if current requester has liked this gbairai
        $hasLiked = false;
        if ($currentDeviceHash) {
            if ($this->relationLoaded('likes')) {
                $hasLiked = $this->likes->contains('device_id_hash', $currentDeviceHash);
            } else {
                $hasLiked = $this->likes()->where('device_id_hash', $currentDeviceHash)->exists();
            }
        }

        // Determine if current requester is the author of this post
        $isMine = $currentDeviceHash && ($this->device_id_hash === $currentDeviceHash);

        return [
            'id' => $this->id,
            'content' => $this->content,
            'location' => $this->location,
            'likes_count' => (int) $this->likes_count,
            'comments_count' => (int) ($this->comments_count ?? $this->comments()->count()),
            'has_liked' => (bool) $hasLiked,
            'is_mine' => (bool) $isMine,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'time_ago' => $this->created_at?->diffForHumans(),
        ];
    }
}

