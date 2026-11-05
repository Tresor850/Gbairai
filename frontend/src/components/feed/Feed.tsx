'use client';

import { useState } from 'react';
import { Gbairai } from '@/types/gbairai';
import { getGbairais } from '@/lib/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import GbairaiCard from './GbairaiCard';
import { Flame, Clock, MapPin, RefreshCw, Loader2, MessageSquarePlus } from 'lucide-react';

interface FeedProps {
  onOpenComments: (gbairai: Gbairai) => void;
  onOpenCreateModal: () => void;
}

const LOCATIONS = [
  'Tous',
  'Cotonou',
  'Abomey-Calavi',
  'Porto-Novo',
  'Parakou',
  'Bohicon',
  'Ouidah',
];

export default function Feed({ onOpenComments, onOpenCreateModal }: FeedProps) {
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [selectedLocation, setSelectedLocation] = useState<string>('Tous');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['gbairais', sort, selectedLocation],
    queryFn: ({ pageParam = 1 }) =>
      getGbairais({
        page: pageParam,
        sort,
        location: selectedLocation === 'Tous' ? undefined : selectedLocation,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta.current_page;
      const lastPageNum = lastPage.meta.last_page;
      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
  });

  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6">
      {/* Feed Controls (Sorting & Filters) */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 mb-4 border-b border-zinc-800/80 bg-zinc-950/90 px-4 sm:px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Sort Tabs */}
          <div className="flex items-center rounded-xl bg-zinc-900/80 p-1 border border-zinc-800/60">
            <button
              onClick={() => setSort('latest')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                sort === 'latest'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-rose-400" />
              <span>Plus récents</span>
            </button>
            <button
              onClick={() => setSort('hot')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                sort === 'hot'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Populaires</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Rafraîchir le fil"
            className="flex items-center justify-center h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>

        {/* Location Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-0.5" />
          {LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc;
            return (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-36 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 animate-pulse p-4"
            >
              <div className="h-4 w-28 bg-zinc-800 rounded-full mb-4" />
              <div className="h-4 w-full bg-zinc-800 rounded mb-2" />
              <div className="h-4 w-3/4 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center text-red-300">
          <p className="text-sm font-semibold">Impossible de contacter le serveur Gbairai.</p>
          <p className="text-xs text-red-400/80 mt-1">
            Vérifiez que le backend Laravel est bien démarré sur le port 8000.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-red-600/30 border border-red-500/40 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-600/50 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center text-zinc-400">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-500 mb-3">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">Aucun gbairai trouvé ici</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            {selectedLocation !== 'Tous'
              ? `Il n'y a pas encore de potin pour ${selectedLocation}. Sois le premier à en lancer un !`
              : 'Le fil est vide. Partage une confession anonyme pour allumer la flamme !'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Écrire le premier Gbairai</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <GbairaiCard
              key={post.id}
              gbairai={post}
              onOpenComments={onOpenComments}
            />
          ))}

          {/* Load More / Infinite Trigger */}
          {hasNextPage && (
            <div className="pt-4 pb-12 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <span>Voir plus de gbairais</span>
                )}
              </button>
            </div>
          )}

          {!hasNextPage && posts.length > 0 && (
            <div className="py-8 text-center text-xs text-zinc-600 font-medium">
              ✨ Vous avez lu tous les gbairais récents !
            </div>
          )}
        </div>
      )}
    </div>
  );
}

