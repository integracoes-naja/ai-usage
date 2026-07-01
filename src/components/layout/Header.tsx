import { useState } from 'react';
import { format } from 'date-fns';

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
}

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh();
    window.setTimeout(() => setSpinning(false), 500);
  };

  return (
    <header className="relative overflow-hidden border-b border-gray-200 bg-card">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-naja-500 via-naja-400 to-blue-600" />
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-naja-50 p-2 ring-1 ring-naja-100 sm:h-12 sm:w-12">
            <img src="/logo-naja.png" alt="Naja Soluções" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-lg font-bold uppercase tracking-[0.08em] text-naja-600 sm:text-xl">
              Naja
            </p>
            <h1 className="text-xs font-medium leading-tight text-ink sm:text-sm">
              Monitoramento de consumo e custo de IA
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-bg px-3 py-1.5 text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-xs sm:text-sm">
              Atualizado às {format(lastUpdated, 'HH:mm:ss')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="group flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-panel active:translate-y-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-4 w-4 transition-transform duration-500 ${spinning ? 'rotate-[360deg]' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.6 15a8 8 0 0 0 14.5 2.5M19.4 9A8 8 0 0 0 4.9 6.5"
              />
            </svg>
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
