<?php

namespace App\Models;

use App\Observers\GbairaiObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([GbairaiObserver::class])]
class Gbairai extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id_hash',
        'content',
        'location',
        'likes_count',
        'reports_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'likes_count' => 'integer',
            'reports_count' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Relationship: Comments on this Gbairai.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }

    /**
     * Relationship: Likes on this Gbairai.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Scope: Only active posts.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Filter by geographic location.
     */
    public function scopeLocation(Builder $query, ?string $location): Builder
    {
        if (blank($location) || strtolower($location) === 'tous' || strtolower($location) === 'all') {
            return $query;
        }

        return $query->where('location', $location);
    }

    /**
     * Scope: Sort by latest or hot.
     */
    public function scopeSortFeed(Builder $query, ?string $sort): Builder
    {
        if ($sort === 'hot') {
            return $query->orderBy('likes_count', 'desc')->latest();
        }

        return $query->latest();
    }
}
