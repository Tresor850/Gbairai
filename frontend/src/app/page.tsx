'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Feed from '@/components/feed/Feed';
import PostModal from '@/components/modals/PostModal';
import CommentDrawer from '@/components/modals/CommentDrawer';
import { Gbairai } from '@/types/gbairai';
import { Plus } from 'lucide-react';

export default function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedGbairaiForComments, setSelectedGbairaiForComments] = useState<Gbairai | null>(null);

  return (
    <div className="relative min-h-screen bg-zinc-950 pb-20">
      {/* Navbar */}
      <Navbar onOpenCreateModal={() => setIsPostModalOpen(true)} />

      {/* Main Feed */}
      <main>
        <Feed
          onOpenComments={(post) => setSelectedGbairaiForComments(post)}
          onOpenCreateModal={() => setIsPostModalOpen(true)}
        />
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-600 text-white shadow-xl shadow-rose-600/40 hover:scale-110 active:scale-95 transition-all sm:hidden"
        aria-label="Créer un gbairai"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* New Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />

      {/* Comments Drawer / Modal */}
      <CommentDrawer
        gbairai={selectedGbairaiForComments}
        isOpen={!!selectedGbairaiForComments}
        onClose={() => setSelectedGbairaiForComments(null)}
      />
    </div>
  );
}
