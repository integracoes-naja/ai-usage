import { useEffect, useState } from 'react';
import { useFilters } from './hooks/useFilters';
import { useMetrics } from './hooks/useMetrics';
import { useChartData } from './hooks/useChartData';
import { useUsageLog } from './hooks/useUsageLog';
import { useRunRate } from './hooks/useRunRate';
import { useWorkflowComparison } from './hooks/useWorkflowComparison';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/filters/FilterBar';
import { KpiGrid } from './components/cards/KpiGrid';
import { RunRateCard } from './components/cards/RunRateCard';
import { CostByDayChart } from './components/charts/CostByDayChart';
import { TokensByModelChart } from './components/charts/TokensByModelChart';
import { SuccessRateChart } from './components/charts/SuccessRateChart';
import { CostByWorkflowChart } from './components/charts/CostByWorkflowChart';
import { AvgCostPerExecutionChart } from './components/charts/AvgCostPerExecutionChart';
import { CostPer1kTokensChart } from './components/charts/CostPer1kTokensChart';
import { ErrorParetoChart } from './components/charts/ErrorParetoChart';
import { UsageTable } from './components/table/UsageTable';
import { WorkflowComparisonTable } from './components/table/WorkflowComparisonTable';

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
  const {
    costByDay,
    tokensByModel,
    successRate,
    costByWorkflow,
    avgCostByWorkflow,
    costPer1kTokens,
    errorsByWorkflow,
    errorsByMessage,
  } = useChartData(filters, refreshKey);
  const { rows, count, loading: usageLogLoading, pageSize } = useUsageLog(filters, page, refreshKey);
  const { runRate, loading: runRateLoading } = useRunRate(refreshKey);
  const {
    rows: comparisonRows,
    loading: comparisonLoading,
    error: comparisonError,
  } = useWorkflowComparison(refreshKey);

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <div className="pointer-events-none fixed inset-0 bg-mesh" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0 bg-dotgrid bg-[length:18px_18px] opacity-60"
        aria-hidden="true"
      />

      <div className="relative">
        <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} />

        <main className="flex flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
          <FilterBar filters={filters} setDateRange={setDateRange} setWorkflow={setWorkflow} />

          <KpiGrid metrics={metrics} loading={metricsLoading} />

          <div className="animate-rise" style={{ animationDelay: '40ms' }}>
            <RunRateCard runRate={runRate} loading={runRateLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="animate-rise xl:col-span-2" style={{ animationDelay: '80ms' }}>
              <CostByDayChart data={costByDay} />
            </div>
            <div className="animate-rise" style={{ animationDelay: '140ms' }}>
              <TokensByModelChart data={tokensByModel} />
            </div>
            <div className="animate-rise" style={{ animationDelay: '200ms' }}>
              <SuccessRateChart data={successRate} />
            </div>
            <div className="animate-rise" style={{ animationDelay: '240ms' }}>
              <CostByWorkflowChart data={costByWorkflow} />
            </div>
            <div className="animate-rise" style={{ animationDelay: '280ms' }}>
              <AvgCostPerExecutionChart data={avgCostByWorkflow} />
            </div>
            <div className="animate-rise" style={{ animationDelay: '320ms' }}>
              <CostPer1kTokensChart data={costPer1kTokens} />
            </div>
          </div>

          <WorkflowComparisonTable rows={comparisonRows} loading={comparisonLoading} error={comparisonError} />

          <ErrorParetoChart errorsByWorkflow={errorsByWorkflow} errorsByMessage={errorsByMessage} />

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
    </div>
  );
}

export default App;
