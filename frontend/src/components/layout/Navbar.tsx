'use client';

import { useState, useEffect } from 'react';
import { getDeviceId, resetDeviceId } from '@/lib/device';
import { Plus, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export default function Navbar({ onOpenCreateModal }: NavbarProps) {
  const [deviceShort, setDeviceShort] = useState<string>('');

  useEffect(() => {
    const id = getDeviceId();
    setDeviceShort(id.slice(0, 8));
  }, []);

  const handleResetDevice = () => {
    if (confirm('Voulez-vous générer un nouvel identifiant anonyme pour cet appareil ?')) {
      const newId = resetDeviceId();
      setDeviceShort(newId.slice(0, 8));
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
              <Sparkles className="h-5 w-5 text-rose-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Gbairai</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full">
                Bénin
              </span>
            </h1>
            <p className="text-[11px] font-medium text-zinc-400 hidden xs:block">
              Potins & vérités anonymes
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Device badge */}
          {deviceShort && (
            <button
              onClick={handleResetDevice}
              title="Votre ID anonyme unique (Cliquer pour réinitialiser)"
              className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ID:</span>
              <span className="font-mono text-zinc-300">{deviceShort}</span>
            </button>
          )}

          {/* New Post Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-600/25 transition-all hover:scale-105 active:scale-95 hover:shadow-rose-600/40"
          >
            <Plus className="h-4 w-4" />
            <span>Confesser</span>
          </button>
        </div>
      </div>
    </header>
  );
}

