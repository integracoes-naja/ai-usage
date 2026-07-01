import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ChartCard } from './ChartCard';
import type { SuccessRatePoint } from '../../types';

interface SuccessRateChartProps {
  data: SuccessRatePoint[];
}

const COLORS: Record<string, string> = {
  Sucesso: '#10b981',
  Falha: '#ef4444',
};

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

export function SuccessRateChart({ data }: SuccessRateChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isMobile = useIsMobile();

  return (
    <ChartCard
      title="Taxa de Sucesso"
      icon={icon}
      accent="emerald"
      info={{
        whatItShows: 'Percentual de chamadas de IA que retornaram sem erro.',
        howToInterpret:
          'Abaixo de 95% de forma sustentada indica problema de integração, rate limit ou prompt malformado — não falha pontual.',
      }}
      isEmpty={total === 0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 36 : 52}
            outerRadius={isMobile ? 65 : 90}
            paddingAngle={2}
            cornerRadius={4}
            label={({ name, value }) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
              return isMobile ? `${pct}%` : `${name}: ${pct}% (${value})`;
            }}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} stroke="#ffffff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 8px 24px -12px rgba(17,24,39,0.18)',
              fontSize: 13,
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
