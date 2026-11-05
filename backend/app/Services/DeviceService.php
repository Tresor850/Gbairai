<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Gbairai;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceService
{
    /**
     * Hash the given device ID using HMAC SHA-256 with the APP_KEY.
     */
    public function hashDeviceId(?string $deviceId): ?string
    {
        if (blank($deviceId)) {
            return null;
        }

        $appKey = config('app.key');
        // Handle base64: prefix if present in APP_KEY
        if (str_starts_with($appKey, 'base64:')) {
            $appKey = base64_decode(substr($appKey, 7));
        }

        return hash_hmac('sha256', trim($deviceId), $appKey);
    }

    /**
     * Resolve the device ID from the Request (Header or Request Body).
     */
    public function getDeviceIdFromRequest(Request $request): ?string
    {
        return $request->header('X-Device-ID') 
            ?? $request->input('device_id')
            ?? $request->query('device_id');
    }

    /**
     * Resolve the hashed device ID from the Request.
     */
    public function getHashedDeviceIdFromRequest(Request $request): ?string
    {
        $deviceId = $this->getDeviceIdFromRequest($request);

        return $this->hashDeviceId($deviceId);
    }

    /**
     * Get or create a consistent pseudo for a device on a specific Gbairai.
     * E.g. "Auteur (OP)" if OP, or "Anonyme_1", "Anonyme_2" based on commenter index.
     */
    public function resolveCommentPseudo(Gbairai $gbairai, string $deviceHash): string
    {
        // 1. Check if the device already commented on this post
        $existingPseudo = Comment::where('gbairai_id', $gbairai->id)
            ->where('device_id_hash', $deviceHash)
            ->value('random_pseudo');

        if ($existingPseudo) {
            return $existingPseudo;
        }

        // 2. If the commenter is the post author
        if ($gbairai->device_id_hash === $deviceHash) {
            return 'Auteur (OP)';
        }

        // 3. Count distinct previous non-OP commenters on this post to assign an incremental number
        $distinctCommentersCount = Comment::where('gbairai_id', $gbairai->id)
            ->where('device_id_hash', '!=', $gbairai->device_id_hash)
            ->distinct('device_id_hash')
            ->count('device_id_hash');

        $commenterNumber = $distinctCommentersCount + 1;

        return "Anonyme_{$commenterNumber}";
    }
}

