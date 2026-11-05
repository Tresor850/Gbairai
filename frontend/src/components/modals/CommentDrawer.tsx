'use client';

import { useState, useRef, useEffect } from 'react';
import { Gbairai } from '@/types/gbairai';
import { getComments, addComment } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';

interface CommentDrawerProps {
  gbairai: Gbairai | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentDrawer({ gbairai, isOpen, onClose }: CommentDrawerProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: commentsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['comments', gbairai?.id],
    queryFn: () => (gbairai ? getComments(gbairai.id) : Promise.resolve({ data: [] })),
    enabled: !!gbairai && isOpen,
  });

  const mutation = useMutation({
    mutationFn: (text: string) => {
      if (!gbairai) throw new Error('Post introuvable');
      return addComment(gbairai.id, text);
    },
    onSuccess: () => {
      setContent('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['gbairais'] });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (err: Error) => {
      alert(err.message || 'Impossible d\'envoyer le commentaire.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0 || mutation.isPending) return;
    mutation.mutate(content.trim());
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [isOpen, commentsResponse]);

  if (!isOpen || !gbairai) return null;

  const comments = commentsResponse?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col h-[85vh] sm:h-[650px] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Commentaires</h2>
              <p className="text-[11px] text-zinc-400">
                {comments.length} réponse{comments.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable list of comments */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Original Post Preview */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mb-1.5">
              <Sparkles className="h-3 w-3" />
              <span>Gbairai d'origine</span>
            </div>
            <p className="line-clamp-3 italic text-zinc-300">"{gbairai.content}"</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <span className="text-xs">Chargement des réactions...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <p className="text-sm">Aucun commentaire pour l'instant.</p>
              <p className="text-xs mt-1 text-zinc-600">Sois le premier à réagir !</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-2xl p-3.5 border transition-colors ${
                  comment.is_author
                    ? 'border-purple-500/30 bg-purple-950/20'
                    : 'border-zinc-800/70 bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                        comment.is_author
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <User className="h-3 w-3" />
                      <span>{comment.random_pseudo}</span>
                    </span>

                    {comment.is_mine && (
                      <span className="text-[10px] text-zinc-400 font-medium">
                        (Vous)
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-zinc-500">{comment.time_ago}</span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-wrap pl-1">
                  {comment.content}
                </p>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-800/80 p-3 sm:p-4 bg-zinc-950 flex items-center gap-2"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrire une réponse anonyme..."
            maxLength={1000}
            className="flex-1 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={content.trim().length === 0 || mutation.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-md shadow-purple-600/30"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

