import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  loading?: boolean;
  accent?: 'orange' | 'blue';
}

const ACCENT_CLASSES: Record<'orange' | 'blue', string> = {
  orange: 'bg-naja-50 text-naja-600',
  blue: 'bg-blue-50 text-blue-600',
};

export function KpiCard({ label, value, icon, loading, accent = 'orange' }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-card p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ACCENT_CLASSES[accent]}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-2xl font-semibold text-ink">
          {loading ? '—' : value}
        </span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}
