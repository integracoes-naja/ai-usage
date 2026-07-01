import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  loading?: boolean;
  accent?: 'orange' | 'blue';
  index?: number;
}

const ACCENT_CLASSES: Record<'orange' | 'blue', string> = {
  orange: 'bg-naja-50 text-naja-600',
  blue: 'bg-blue-50 text-blue-600',
};

const ACCENT_BAR: Record<'orange' | 'blue', string> = {
  orange: 'bg-naja-500',
  blue: 'bg-blue-600',
};

export function KpiCard({ label, value, icon, loading, accent = 'orange', index = 0 }: KpiCardProps) {
  return (
    <div
      className="group relative flex animate-rise items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-card p-4 shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:shadow-panel-hover"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 ${ACCENT_BAR[accent]}`} />
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${ACCENT_CLASSES[accent]}`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col">
        {loading ? (
          <span className="skeleton-shimmer mb-1 h-7 w-20 animate-shimmer rounded" aria-hidden="true" />
        ) : (
          <span className="truncate font-mono text-2xl font-semibold tabular-nums text-ink">{value}</span>
        )}
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}
