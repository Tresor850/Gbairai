<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGbairaiRequest;
use App\Http\Resources\GbairaiResource;
use App\Models\Gbairai;
use App\Models\Like;
use App\Services\DeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GbairaiController extends Controller
{
    public function __construct(protected DeviceService $deviceService)
    {
    }

    /**
     * Display a paginated listing of active Gbairais.
     * Query parameters:
     * - sort: 'latest' (default) | 'hot'
     * - location: string (optional)
     * - per_page: int (default: 15)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $deviceHash = $this->deviceService->getHashedDeviceIdFromRequest($request);

        $query = Gbairai::query()
            ->active()
            ->location($request->query('location'))
            ->sortFeed($request->query('sort'))
            ->withCount('comments');

        // Eager load only the like corresponding to the current requester (avoids N+1)
        if ($deviceHash) {
            $query->with(['likes' => fn ($q) => $q->where('device_id_hash', $deviceHash)]);
        }

        $perPage = $request->integer('per_page', 15);
        $gbairais = $query->paginate($perPage);

        return GbairaiResource::collection($gbairais);
    }

    /**
     * Store a newly created Gbairai in storage.
     */
    public function store(StoreGbairaiRequest $request): JsonResponse
    {
        $deviceHash = $this->deviceService->getHashedDeviceIdFromRequest($request);

        if (! $deviceHash) {
            return response()->json([
                'message' => 'Identifiant appareil manquant.',
            ], 422);
        }

        $gbairai = Gbairai::create([
            'device_id_hash' => $deviceHash,
            'content' => $request->input('content'),
            'location' => $request->input('location'),
            'status' => 'active',
            'likes_count' => 0,
            'reports_count' => 0,
        ]);

        return (new GbairaiResource($gbairai))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified Gbairai.
     */
    public function show(Request $request, Gbairai $gbairai): JsonResponse|GbairaiResource
    {
        if ($gbairai->status !== 'active') {
            return response()->json(['message' => 'Ce gbairai n\'est plus disponible.'], 404);
        }

        $deviceHash = $this->deviceService->getHashedDeviceIdFromRequest($request);
        if ($deviceHash) {
            $gbairai->load(['likes' => fn ($q) => $q->where('device_id_hash', $deviceHash)]);
        }
        $gbairai->loadCount('comments');

        return new GbairaiResource($gbairai);
    }

    /**
     * Toggle like on a Gbairai.
     */
    public function toggleLike(Request $request, Gbairai $gbairai): JsonResponse
    {
        $deviceHash = $this->deviceService->getHashedDeviceIdFromRequest($request);

        if (! $deviceHash) {
            return response()->json([
                'message' => 'Un identifiant appareil (Device ID) est requis pour liker.',
            ], 422);
        }

        if ($gbairai->status !== 'active') {
            return response()->json(['message' => 'Action impossible sur ce gbairai.'], 404);
        }

        $result = DB::transaction(function () use ($gbairai, $deviceHash) {
            $existingLike = Like::where('gbairai_id', $gbairai->id)
                ->where('device_id_hash', $deviceHash)
                ->first();

            if ($existingLike) {
                $existingLike->delete();
                $newCount = max(0, $gbairai->likes_count - 1);
                $gbairai->update(['likes_count' => $newCount]);

                return ['liked' => false, 'likes_count' => $newCount];
            } else {
                Like::create([
                    'gbairai_id' => $gbairai->id,
                    'device_id_hash' => $deviceHash,
                ]);
                $newCount = $gbairai->likes_count + 1;
                $gbairai->update(['likes_count' => $newCount]);

                return ['liked' => true, 'likes_count' => $newCount];
            }
        });

        return response()->json([
            'message' => $result['liked'] ? 'Like ajouté.' : 'Like retiré.',
            'liked' => $result['liked'],
            'likes_count' => $result['likes_count'],
        ]);
    }

    /**
     * Report a Gbairai.
     * Triggering 10+ reports hides the post automatically via GbairaiObserver.
     */
    public function report(Request $request, Gbairai $gbairai): JsonResponse
    {
        if ($gbairai->status !== 'active') {
            return response()->json(['message' => 'Ce gbairai est déjà masqué ou archivé.'], 400);
        }

        $gbairai->reports_count += 1;
        $gbairai->save();

        return response()->json([
            'message' => 'Signalement pris en compte.',
            'status' => $gbairai->status,
            'is_hidden' => $gbairai->status === 'hidden',
        ]);
    }

    /**
     * Delete a post if the requester is the original author.
     */
    public function destroy(Request $request, Gbairai $gbairai): JsonResponse
    {
        $deviceHash = $this->deviceService->getHashedDeviceIdFromRequest($request);

        if (! $deviceHash || $gbairai->device_id_hash !== $deviceHash) {
            return response()->json([
                'message' => 'Action non autorisée. Vous n\'êtes pas l\'auteur de ce gbairai.',
            ], 403);
        }

        $gbairai->delete();

        return response()->json(['message' => 'Gbairai supprimé avec succès.']);
    }
}
