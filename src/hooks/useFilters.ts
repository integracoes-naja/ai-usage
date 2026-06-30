import { useState } from 'react';
import { startOfMonth } from 'date-fns';

export interface Filters {
  startDate: Date;
  endDate: Date;
  workflow: string | null; // null = todos
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    workflow: null,
  });

  const setDateRange = (start: Date, end: Date) =>
    setFilters((f) => ({ ...f, startDate: start, endDate: end }));

  const setWorkflow = (workflow: string | null) =>
    setFilters((f) => ({ ...f, workflow }));

  return { filters, setDateRange, setWorkflow };
}
