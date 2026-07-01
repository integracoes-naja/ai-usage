import type { ReactNode } from 'react';
import { MetricInfo } from '../common/MetricInfo';

interface ChartCardProps {
  title: string;
  icon: ReactNode;
  accent: 'orange' | 'blue' | 'emerald';
  info?: { whatItShows: string; howToInterpret: string };
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

const ACCENT_BAR: Record<'orange' | 'blue' | 'emerald', string> = {
  orange: 'bg-naja-500',
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-500',
};

const ACCENT_ICON: Record<'orange' | 'blue' | 'emerald', string> = {
  orange: 'bg-naja-50 text-naja-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

export function ChartCard({ title, icon, accent, info, isEmpty, emptyMessage, children }: ChartCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-card p-4 shadow-panel">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${ACCENT_BAR[accent]}`} />
      <div className="mb-4 flex items-center gap-2.5">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${ACCENT_ICON[accent]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {info && <MetricInfo whatItShows={info.whatItShows} howToInterpret={info.howToInterpret} />}
      </div>
      {isEmpty ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-9 w-9 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 15v-3M12 15V9M16 15v-6" />
          </svg>
          <p className="text-sm">{emptyMessage ?? 'Sem dados para o período selecionado'}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
