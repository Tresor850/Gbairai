'use client';

import { useState } from 'react';
import { createGbairai } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MapPin, Sparkles, Loader2, Navigation } from 'lucide-react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CITIES = [
  'Cotonou',
  'Abomey-Calavi',
  'Porto-Novo',
  'Parakou',
  'Bohicon',
  'Ouidah',
];

export default function PostModal({ isOpen, onClose }: PostModalProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('Cotonou');
  const [customLocation, setCustomLocation] = useState('');
  const [isCustomLoc, setIsCustomLoc] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      const loc = isCustomLoc ? customLocation.trim() : location;
      return createGbairai({
        content: content.trim(),
        location: loc || undefined,
      });
    },
    onSuccess: () => {
      setContent('');
      setIsCustomLoc(false);
      setCustomLocation('');
      queryClient.invalidateQueries({ queryKey: ['gbairais'] });
      onClose();
    },
    onError: (err: Error) => {
      alert(err.message || 'Impossible de publier ce gbairai.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 3) {
      alert('Le contenu doit comporter au moins 3 caractères.');
      return;
    }
    mutation.mutate();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocoding using free OpenStreetMap Nominatim endpoint
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Bénin';
          setIsCustomLoc(true);
          setCustomLocation(city);
        } catch {
          alert('Impossible de déterminer la ville avec précision.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert('Accès à la géolocalisation refusé.');
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">Nouveau Gbairai</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Balance ton gbairai ici en toute discrétion... Aucun nom, 100% anonyme !"
              rows={5}
              maxLength={2000}
              autoFocus
              className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all leading-relaxed"
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500 px-1">
              <span>{content.length}/2000 caractères</span>
              {content.length < 3 && content.length > 0 && (
                <span className="text-amber-400">3 caractères minimum</span>
              )}
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <label className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>Où s'est passé ce potin ?</span>
              </label>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:underline"
              >
                {isLocating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Navigation className="h-3 w-3" />
                )}
                <span>Détecter</span>
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((city) => (
                <button
                  type="button"
                  key={city}
                  onClick={() => {
                    setIsCustomLoc(false);
                    setLocation(city);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    !isCustomLoc && location === city
                      ? 'bg-rose-500 text-white font-semibold shadow-sm shadow-rose-500/30'
                      : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {city}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomLoc(true)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isCustomLoc
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'border border-dashed border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Autre ville...
              </button>
            </div>

            {isCustomLoc && (
              <input
                type="text"
                placeholder="Ex: Natitingou, Ouidah, Lokossa..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                maxLength={50}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
              />
            )}
          </div>

          {/* Privacy Note */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-2.5 text-[11px] text-zinc-400">
            🔒 Votre identifiant est chiffré en SHA-256. Personne ne saura qui a publié ceci.
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={content.trim().length < 3 || mutation.isPending}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Publication...</span>
                </>
              ) : (
                <span>Lancer le gbairai 🚀</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

