import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Filters } from './useFilters';
import type { AiUsageLog } from '../types';

const PAGE_SIZE = 50;

export function useUsageLog(filters: Filters, page: number, refreshKey: number) {
  const [rows, setRows] = useState<AiUsageLog[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsageLog() {
      setLoading(true);

      let query = supabase
        .from('ai_usage_log')
        .select('*', { count: 'exact' })
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString())
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filters.workflows.length > 0) {
        query = query.in('workflow_name', filters.workflows);
      }

      const { data, count: total, error } = await query;

      if (cancelled) return;

      if (error) {
        console.error('Erro ao buscar log de uso:', error);
        setRows([]);
        setCount(0);
      } else {
        setRows(data ?? []);
        setCount(total ?? 0);
      }

      setLoading(false);
    }

    fetchUsageLog();

    return () => {
      cancelled = true;
    };
  }, [filters.startDate, filters.endDate, filters.workflows, page, refreshKey]);

  return { rows, count, loading, pageSize: PAGE_SIZE };
}
