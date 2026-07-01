import { useEffect, useState } from 'react';
import { endOfMonth, getDaysInMonth, startOfMonth, subMonths } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { RunRate } from '../types';

export function useRunRate(refreshKey: number) {
  const [runRate, setRunRate] = useState<RunRate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRunRate() {
      setLoading(true);

      const now = new Date();
      const monthStart = startOfMonth(now);
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));

      const [currentMonth, previousMonth] = await Promise.all([
        supabase
          .from('ai_usage_log')
          .select('cost_usd')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', now.toISOString()),
        supabase
          .from('ai_usage_log')
          .select('cost_usd')
          .gte('created_at', prevMonthStart.toISOString())
          .lte('created_at', prevMonthEnd.toISOString()),
      ]);

      if (cancelled) return;

      if (currentMonth.error || previousMonth.error) {
        console.error('Erro ao buscar run-rate:', currentMonth.error ?? previousMonth.error);
        setRunRate(null);
        setLoading(false);
        return;
      }

      const custoAcumulado = (currentMonth.data ?? []).reduce((sum, r) => sum + r.cost_usd, 0);
      const custoMesAnterior = (previousMonth.data ?? []).reduce((sum, r) => sum + r.cost_usd, 0);

      const diaAtual = now.getDate();
      const diasNoMes = getDaysInMonth(now);
      const projecao = (custoAcumulado / diaAtual) * diasNoMes;

      const variacaoPct = custoMesAnterior > 0 ? ((projecao - custoMesAnterior) / custoMesAnterior) * 100 : null;

      setRunRate({ custoAcumulado, projecao, custoMesAnterior, variacaoPct });
      setLoading(false);
    }

    fetchRunRate();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { runRate, loading };
}
