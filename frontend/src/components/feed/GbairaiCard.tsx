'use client';

import { useState } from 'react';
import { Gbairai } from '@/types/gbairai';
import { toggleLike, reportGbairai, deleteGbairai } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, MapPin, Flag, Trash2, Share2 } from 'lucide-react';

interface GbairaiCardProps {
  gbairai: Gbairai;
  onOpenComments: (gbairai: Gbairai) => void;
}

export default function GbairaiCard({ gbairai, onOpenComments }: GbairaiCardProps) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(gbairai.has_liked);
  const [likesCount, setLikesCount] = useState(gbairai.likes_count);
  const [isReporting, setIsReporting] = useState(false);

  // Optimistic Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(gbairai.id),
    onMutate: async () => {
      // Snapshot current local state
      const prevLiked = isLiked;
      const prevCount = likesCount;

      // Optimistically update local UI immediately
      const nextLiked = !prevLiked;
      setIsLiked(nextLiked);
      setLikesCount(nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1));

      return { prevLiked, prevCount };
    },
    onError: (_err, _vars, context) => {
      // Revert if API fails
      if (context) {
        setIsLiked(context.prevLiked);
        setLikesCount(context.prevCount);
      }
    },
    onSuccess: (data) => {
      // Align with server response
      setIsLiked(data.liked);
      setLikesCount(data.likes_count);
      // Invalidate queries in background
      queryClient.invalidateQueries({ queryKey: ['gbairais'] });
    },
  });

  // Report Mutation
  const reportMutation = useMutation({
    mutationFn: () => reportGbairai(gbairai.id),
    onSuccess: (data) => {
      alert(data.message || 'Signalement enregistré.');
      queryClient.invalidateQueries({ queryKey: ['gbairais'] });
    },
    onError: (err: Error) => {
      alert(err.message || 'Erreur lors du signalement.');
    },
    onSettled: () => {
      setIsReporting(false);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteGbairai(gbairai.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gbairais'] });
    },
    onError: (err: Error) => {
      alert(err.message || 'Erreur lors de la suppression.');
    },
  });

  const handleReport = () => {
    if (confirm('Voulez-vous vraiment signaler ce gbairai comme inapproprié ?')) {
      setIsReporting(true);
      reportMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (confirm('Voulez-vous supprimer définitivement votre gbairai ?')) {
      deleteMutation.mutate();
    }
  };

  const handleShare = async () => {
    const text = `Gbairai anonyme : "${gbairai.content.slice(0, 80)}..."`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gbairai',
          text,
          url: window.location.href,
        });
      } catch {
        // Ignored or cancelled by user
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
    <article className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90 shadow-sm">
      {/* Top Meta info */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <div className="flex items-center gap-2">
          {gbairai.location ? (
            <span className="flex items-center gap-1 font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <MapPin className="h-3 w-3" />
              <span>{gbairai.location}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-full">
              <MapPin className="h-3 w-3 text-zinc-500" />
              <span>Partout</span>
            </span>
          )}

          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">{gbairai.time_ago}</span>
        </div>

        {/* Author badge or actions */}
        <div className="flex items-center gap-1">
          {gbairai.is_mine && (
            <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
              Mon post
            </span>
          )}
          {gbairai.is_mine && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              title="Supprimer mon gbairai"
              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <p className="text-[15px] sm:text-base leading-relaxed text-zinc-100 whitespace-pre-wrap break-words font-normal">
        {gbairai.content}
      </p>

      {/* Bottom Actions Bar */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-zinc-400">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-400'
            }`}
          >
            <div
              className={`p-1.5 rounded-full transition-transform active:scale-125 ${
                isLiked ? 'bg-rose-500/10 text-rose-500' : 'hover:bg-zinc-800'
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  isLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </div>
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onOpenComments(gbairai)}
            className="flex items-center gap-1.5 text-xs font-medium hover:text-purple-400 transition-colors"
          >
            <div className="p-1.5 rounded-full hover:bg-zinc-800 transition-transform active:scale-110">
              <MessageCircle className="h-4 w-4" />
            </div>
            <span>{gbairai.comments_count}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Share button */}
          <button
            onClick={handleShare}
            title="Partager"
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Report Button */}
          <button
            onClick={handleReport}
            disabled={isReporting || reportMutation.isPending}
            title="Signaler ce contenu"
            className="p-1.5 text-zinc-500 hover:text-amber-400 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

