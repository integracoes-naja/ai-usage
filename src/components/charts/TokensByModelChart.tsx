import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { ChartCard } from './ChartCard';
import type { TokensByModelPoint } from '../../types';

interface TokensByModelChartProps {
  data: TokensByModelPoint[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-6" />
  </svg>
);

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload as TokensByModelPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-card p-3 text-sm shadow-panel-hover">
      <p className="mb-1.5 font-semibold text-ink">{label}</p>
      <p className="flex items-center gap-1.5" style={{ color: '#f58220' }}>
        <span className="h-2 w-2 rounded-sm" style={{ background: '#f58220' }} />
        Input: {numberFormatter.format(point.input_tokens)}
      </p>
      <p className="flex items-center gap-1.5" style={{ color: '#2563eb' }}>
        <span className="h-2 w-2 rounded-sm" style={{ background: '#2563eb' }} />
        Output: {numberFormatter.format(point.output_tokens)}
      </p>
      <p className="mt-1.5 border-t border-gray-200 pt-1.5 text-muted">
        Total: {numberFormatter.format(point.total_tokens)}
      </p>
    </div>
  );
}

export function TokensByModelChart({ data }: TokensByModelChartProps) {
  return (
    <ChartCard
      title="Tokens por Modelo"
      icon={icon}
      accent="blue"
      info={{
        whatItShows: 'Volume de tokens (entrada + saída) consumidos, agrupado por modelo de IA.',
        howToInterpret:
          'Modelo com volume alto e baixo custo unitário é eficiente; volume alto em modelo caro é candidato a downgrade.',
      }}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis dataKey="model" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v) => numberFormatter.format(v)}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} />} cursor={{ fill: 'rgba(17,24,39,0.03)' }} />
          <Legend formatter={(value) => (value === 'input_tokens' ? 'Input' : 'Output')} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="input_tokens" name="input_tokens" fill="#f58220" radius={[3, 3, 0, 0]} />
          <Bar dataKey="output_tokens" name="output_tokens" fill="#2563eb" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
