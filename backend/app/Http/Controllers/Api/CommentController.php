<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Gbairai;
use App\Services\DeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommentController extends Controller
{
    public function __construct(protected DeviceService $deviceService)
    {
    }

    /**
     * Get all comments for a given Gbairai.
     */
    public function index(Request $request, Gbairai $gbairai): AnonymousResourceCollection
    {
        $comments = $gbairai->comments()
            ->oldest() // chronological order for conversation thread
            ->get();

        return CommentResource::collection($comments);
    }

    /**
     * Store a comment for a given Gbairai.
     */
    public function store(StoreCommentRequest $request, Gbairai $gbairai): JsonResponse
    {
        if ($gbairai->status !== 'active') {
            return response()->json([
                'message' => 'Impossible de commenter un gbairai inactif.',
            ], 400);
        }

        $deviceHash = $this->deviceService->getHashedDeviceIdFromRequest($request);

        if (! $deviceHash) {
            return response()->json([
                'message' => 'Identifiant appareil manquant.',
            ], 422);
        }

        // Generate or retrieve the consistent pseudo for this device under this post
        $pseudo = $this->deviceService->resolveCommentPseudo($gbairai, $deviceHash);

        $comment = Comment::create([
            'gbairai_id' => $gbairai->id,
            'device_id_hash' => $deviceHash,
            'random_pseudo' => $pseudo,
            'content' => $request->input('content'),
        ]);

        return (new CommentResource($comment))
            ->response()
            ->setStatusCode(201);
    }
}

