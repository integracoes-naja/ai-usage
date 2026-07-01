import { useState } from 'react';
import { startOfMonth } from 'date-fns';

export interface Filters {
  startDate: Date;
  endDate: Date;
  workflows: string[]; // vazio = todos
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    workflows: [],
  });

  const setDateRange = (start: Date, end: Date) =>
    setFilters((f) => ({ ...f, startDate: start, endDate: end }));

  const setWorkflows = (workflows: string[]) =>
    setFilters((f) => ({ ...f, workflows }));

  return { filters, setDateRange, setWorkflows };
}
