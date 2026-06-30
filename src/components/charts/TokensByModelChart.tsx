import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { TokensByModelPoint } from '../../types';

interface TokensByModelChartProps {
  data: TokensByModelPoint[];
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload as TokensByModelPoint;

  return (
    <div className="rounded-lg border border-gray-200 bg-card p-3 text-sm shadow-sm">
      <p className="mb-1 font-medium text-ink">{label}</p>
      <p style={{ color: '#f58220' }}>Input: {numberFormatter.format(point.input_tokens)}</p>
      <p style={{ color: '#2563eb' }}>Output: {numberFormatter.format(point.output_tokens)}</p>
      <p className="mt-1 border-t border-gray-200 pt-1 text-muted">
        Total: {numberFormatter.format(point.total_tokens)}
      </p>
    </div>
  );
}

export function TokensByModelChart({ data }: TokensByModelChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-ink">Tokens por Modelo</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="model" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => numberFormatter.format(v)} />
          <Tooltip content={(props) => <CustomTooltip {...props} />} />
          <Legend formatter={(value) => (value === 'input_tokens' ? 'Input' : 'Output')} />
          <Bar dataKey="input_tokens" name="input_tokens" fill="#f58220" />
          <Bar dataKey="output_tokens" name="output_tokens" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
