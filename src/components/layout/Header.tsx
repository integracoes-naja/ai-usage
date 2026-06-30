import { format } from 'date-fns';

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
}

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-naja-50 p-2">
          <img src="/logo-naja.png" alt="Naja Soluções" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink">Naja Soluções | IA Usage</h1>
          <p className="text-sm text-muted">Monitoramento de consumo e custo de IA</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="font-mono">Atualizado às {format(lastUpdated, 'HH:mm:ss')}</span>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>
    </header>
  );
}
