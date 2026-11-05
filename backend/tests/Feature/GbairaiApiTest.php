<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Gbairai;
use App\Services\DeviceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GbairaiApiTest extends TestCase
{
    use RefreshDatabase;

    protected DeviceService $deviceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->deviceService = app(DeviceService::class);
    }

    public function test_can_create_a_gbairai_with_hashed_device_id(): void
    {
        $deviceId = (string) Str::uuid();

        $response = $this->withHeader('X-Device-ID', $deviceId)
            ->postJson('/api/gbairais', [
                'content' => 'Voici un secret incroyable sur Cotonou !',
                'location' => 'Cotonou',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.content', 'Voici un secret incroyable sur Cotonou !')
            ->assertJsonPath('data.location', 'Cotonou')
            ->assertJsonPath('data.likes_count', 0)
            ->assertJsonPath('data.is_mine', true);

        $expectedHash = $this->deviceService->hashDeviceId($deviceId);
        $this->assertDatabaseHas('gbairais', [
            'device_id_hash' => $expectedHash,
            'content' => 'Voici un secret incroyable sur Cotonou !',
            'location' => 'Cotonou',
            'status' => 'active',
        ]);
    }

    public function test_can_fetch_active_gbairais_with_filters(): void
    {
        $device1 = (string) Str::uuid();
        $hash1 = $this->deviceService->hashDeviceId($device1);

        $post1 = Gbairai::create([
            'device_id_hash' => $hash1,
            'content' => 'Secret Cotonou 1',
            'location' => 'Cotonou',
            'likes_count' => 5,
            'status' => 'active',
        ]);

        $post2 = Gbairai::create([
            'device_id_hash' => $hash1,
            'content' => 'Secret Bohicon 1',
            'location' => 'Bohicon',
            'likes_count' => 20,
            'status' => 'active',
        ]);

        // Hidden post should not appear
        Gbairai::create([
            'device_id_hash' => $hash1,
            'content' => 'Secret masqué',
            'location' => 'Cotonou',
            'likes_count' => 10,
            'status' => 'hidden',
        ]);

        // 1. Fetch filtered by location
        $responseLocation = $this->getJson('/api/gbairais?location=Cotonou');
        $responseLocation->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.content', 'Secret Cotonou 1');

        // 2. Fetch sorted by hot
        $responseHot = $this->getJson('/api/gbairais?sort=hot');
        $responseHot->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.content', 'Secret Bohicon 1'); // 20 likes
    }

    public function test_can_toggle_like_on_gbairai(): void
    {
        $authorDevice = (string) Str::uuid();
        $likerDevice = (string) Str::uuid();

        $post = Gbairai::create([
            'device_id_hash' => $this->deviceService->hashDeviceId($authorDevice),
            'content' => 'Test like',
            'location' => 'Cotonou',
            'likes_count' => 0,
            'status' => 'active',
        ]);

        // First like -> adds like and increments count
        $responseLike = $this->withHeader('X-Device-ID', $likerDevice)
            ->postJson("/api/gbairais/{$post->id}/like");

        $responseLike->assertStatus(200)
            ->assertJson([
                'liked' => true,
                'likes_count' => 1,
            ]);

        $this->assertEquals(1, $post->fresh()->likes_count);
        $this->assertDatabaseHas('likes', [
            'gbairai_id' => $post->id,
            'device_id_hash' => $this->deviceService->hashDeviceId($likerDevice),
        ]);

        // Second click -> removes like and decrements count
        $responseUnlike = $this->withHeader('X-Device-ID', $likerDevice)
            ->postJson("/api/gbairais/{$post->id}/like");

        $responseUnlike->assertStatus(200)
            ->assertJson([
                'liked' => false,
                'likes_count' => 0,
            ]);

        $this->assertEquals(0, $post->fresh()->likes_count);
        $this->assertDatabaseMissing('likes', [
            'gbairai_id' => $post->id,
            'device_id_hash' => $this->deviceService->hashDeviceId($likerDevice),
        ]);
    }

    public function test_report_increments_count_and_auto_hides_at_10(): void
    {
        $authorDevice = (string) Str::uuid();
        $post = Gbairai::create([
            'device_id_hash' => $this->deviceService->hashDeviceId($authorDevice),
            'content' => 'Contenu inapproprié',
            'location' => 'Cotonou',
            'likes_count' => 0,
            'reports_count' => 8,
            'status' => 'active',
        ]);

        // Report #9
        $this->postJson("/api/gbairais/{$post->id}/report")
            ->assertStatus(200)
            ->assertJsonPath('status', 'active')
            ->assertJsonPath('is_hidden', false);

        // Report #10 -> status must switch to 'hidden'
        $this->postJson("/api/gbairais/{$post->id}/report")
            ->assertStatus(200)
            ->assertJsonPath('status', 'hidden')
            ->assertJsonPath('is_hidden', true);

        $this->assertEquals('hidden', $post->fresh()->status);
    }

    public function test_comments_generate_consistent_pseudos(): void
    {
        $authorDevice = (string) Str::uuid();
        $commenter1Device = (string) Str::uuid();
        $commenter2Device = (string) Str::uuid();

        $post = Gbairai::create([
            'device_id_hash' => $this->deviceService->hashDeviceId($authorDevice),
            'content' => 'Gbairai avec commentaires',
            'location' => 'Porto-Novo',
            'likes_count' => 0,
            'status' => 'active',
        ]);

        // 1. Comment from commenter 1 -> Anonyme_1
        $res1 = $this->withHeader('X-Device-ID', $commenter1Device)
            ->postJson("/api/gbairais/{$post->id}/comments", [
                'content' => 'Premier commentaire !',
            ]);

        $res1->assertStatus(201)
            ->assertJsonPath('data.random_pseudo', 'Anonyme_1')
            ->assertJsonPath('data.is_author', false);

        // 2. Second comment from same commenter 1 -> keeps Anonyme_1
        $res1Bis = $this->withHeader('X-Device-ID', $commenter1Device)
            ->postJson("/api/gbairais/{$post->id}/comments", [
                'content' => 'Deuxième commentaire du même device !',
            ]);

        $res1Bis->assertStatus(201)
            ->assertJsonPath('data.random_pseudo', 'Anonyme_1');

        // 3. Comment from author (OP) -> Auteur (OP)
        $resAuthor = $this->withHeader('X-Device-ID', $authorDevice)
            ->postJson("/api/gbairais/{$post->id}/comments", [
                'content' => 'C\'est moi qui ai écrit le post',
            ]);

        $resAuthor->assertStatus(201)
            ->assertJsonPath('data.random_pseudo', 'Auteur (OP)')
            ->assertJsonPath('data.is_author', true);

        // 4. Comment from commenter 2 -> Anonyme_2
        $res2 = $this->withHeader('X-Device-ID', $commenter2Device)
            ->postJson("/api/gbairais/{$post->id}/comments", [
                'content' => 'Autre commentaire',
            ]);

        $res2->assertStatus(201)
            ->assertJsonPath('data.random_pseudo', 'Anonyme_2');

        // 5. Fetch comments list
        $resList = $this->getJson("/api/gbairais/{$post->id}/comments");
        $resList->assertStatus(200)
            ->assertJsonCount(4, 'data');
    }

    public function test_only_author_can_delete_gbairai(): void
    {
        $authorDevice = (string) Str::uuid();
        $otherDevice = (string) Str::uuid();

        $post = Gbairai::create([
            'device_id_hash' => $this->deviceService->hashDeviceId($authorDevice),
            'content' => 'Mon post à supprimer',
            'location' => 'Parakou',
            'status' => 'active',
        ]);

        // Attempt delete by someone else -> 403
        $this->withHeader('X-Device-ID', $otherDevice)
            ->deleteJson("/api/gbairais/{$post->id}")
            ->assertStatus(403);

        // Delete by author -> 200
        $this->withHeader('X-Device-ID', $authorDevice)
            ->deleteJson("/api/gbairais/{$post->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('gbairais', ['id' => $post->id]);
    }
}

