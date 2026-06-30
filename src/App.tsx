import { useEffect, useState } from 'react';
import { useFilters } from './hooks/useFilters';
import { useMetrics } from './hooks/useMetrics';
import { useChartData } from './hooks/useChartData';
import { useUsageLog } from './hooks/useUsageLog';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/filters/FilterBar';
import { KpiGrid } from './components/cards/KpiGrid';
import { CostByDayChart } from './components/charts/CostByDayChart';
import { TokensByModelChart } from './components/charts/TokensByModelChart';
import { SuccessRateChart } from './components/charts/SuccessRateChart';
import { UsageTable } from './components/table/UsageTable';

const POLL_INTERVAL_MS = 60_000;

function App() {
  const { filters, setDateRange, setWorkflow } = useFilters();
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    setPage(0);
  }, [filters.startDate, filters.endDate, filters.workflow]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
      setLastUpdated(new Date());
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setLastUpdated(new Date());
  };

  const { metrics, loading: metricsLoading } = useMetrics(filters, refreshKey);
  const { costByDay, tokensByModel, successRate } = useChartData(filters, refreshKey);
  const { rows, count, loading: usageLogLoading, pageSize } = useUsageLog(filters, page, refreshKey);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} />

      <main className="flex flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
        <FilterBar filters={filters} setDateRange={setDateRange} setWorkflow={setWorkflow} />

        <KpiGrid metrics={metrics} loading={metricsLoading} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CostByDayChart data={costByDay} />
          <TokensByModelChart data={tokensByModel} />
          <SuccessRateChart data={successRate} />
        </div>

        <UsageTable
          rows={rows}
          count={count}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          loading={usageLogLoading}
        />
      </main>
    </div>
  );
}

export default App;
