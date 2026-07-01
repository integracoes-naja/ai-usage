import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

export interface DatePreset {
  id: string;
  label: string;
  getRange: () => { start: Date; end: Date };
}

export const datePresets: DatePreset[] = [
  {
    id: 'today',
    label: 'Hoje',
    getRange: () => {
      const now = new Date();
      return { start: startOfDay(now), end: endOfDay(now) };
    },
  },
  {
    id: 'yesterday',
    label: 'Ontem',
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    },
  },
  {
    id: 'this-month',
    label: 'Mês atual',
    getRange: () => {
      const now = new Date();
      return { start: startOfMonth(now), end: endOfDay(now) };
    },
  },
  {
    id: 'last-month',
    label: 'Mês anterior',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    },
  },
  {
    id: 'this-year',
    label: 'Ano atual',
    getRange: () => {
      const now = new Date();
      return { start: startOfYear(now), end: endOfDay(now) };
    },
  },
  {
    id: 'last-year',
    label: 'Ano anterior',
    getRange: () => {
      const lastYear = subYears(new Date(), 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    },
  },
];
