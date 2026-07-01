import { useEffect, useRef, useState } from 'react';
import { format, isValid, parse } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { datePresets } from '../../lib/datePresets';
import type { Filters } from '../../hooks/useFilters';

interface FilterBarProps {
  filters: Filters;
  setDateRange: (start: Date, end: Date) => void;
  setWorkflows: (workflows: string[]) => void;
}

const CUSTOM_PRESET_ID = 'custom';

function parseDateInput(value: string): Date | null {
  // input[type=date] só emite valor completo (yyyy-MM-dd) quando válido, mas
  // alguns navegadores disparam onChange com valores parciais/inválidos
  // durante a digitação (ex.: dia "0"), então validamos antes de propagar.
  if (value.length !== 10) return null;
  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
}

function matchPresetId(filters: Filters): string {
  const match = datePresets.find((preset) => {
    const range = preset.getRange();
    return (
      format(range.start, 'yyyy-MM-dd') === format(filters.startDate, 'yyyy-MM-dd') &&
      format(range.end, 'yyyy-MM-dd') === format(filters.endDate, 'yyyy-MM-dd')
    );
  });
  return match?.id ?? CUSTOM_PRESET_ID;
}

export function FilterBar({ filters, setDateRange, setWorkflows }: FilterBarProps) {
  const [workflows, setAvailableWorkflows] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetId, setPresetId] = useState(() => matchPresetId(filters));
  const containerRef = useRef<HTMLDivElement>(null);
  const presetContainerRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  const isCustom = presetId === CUSTOM_PRESET_ID;
  const selectedPresetLabel = isCustom
    ? 'Personalizado'
    : (datePresets.find((p) => p.id === presetId)?.label ?? 'Personalizado');

  useEffect(() => {
    async function fetchWorkflows() {
      const { data, error } = await supabase
        .from('ai_usage_log')
        .select('workflow_name')
        .not('workflow_name', 'is', null);

      if (error) {
        console.error('Erro ao buscar workflows:', error);
        return;
      }

      const distinct = Array.from(new Set((data ?? []).map((r) => r.workflow_name))).sort();
      setAvailableWorkflows(distinct);
    }

    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (!open && !presetOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (open && containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
      if (presetOpen && presetContainerRef.current && !presetContainerRef.current.contains(target)) {
        setPresetOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, presetOpen]);

  // Ao entrar em "Personalizado" via seleção do usuário, leva o foco para o
  // primeiro campo revelado — o usuário acabou de pedir para editar as datas.
  useEffect(() => {
    if (isCustom) startDateRef.current?.focus();
  }, [isCustom]);

  const allSelected = filters.workflows.length === 0;

  const toggleWorkflow = (workflow: string) => {
    if (filters.workflows.includes(workflow)) {
      setWorkflows(filters.workflows.filter((w) => w !== workflow));
    } else {
      setWorkflows([...filters.workflows, workflow]);
    }
  };

  const summaryLabel = allSelected
    ? 'Todos'
    : filters.workflows.length === 1
      ? filters.workflows[0]
      : `${filters.workflows.length} selecionados`;

  const handlePresetChange = (value: string) => {
    setPresetOpen(false);
    if (value === CUSTOM_PRESET_ID) {
      setPresetId(CUSTOM_PRESET_ID);
      return;
    }
    const preset = datePresets.find((p) => p.id === value);
    if (!preset) return;
    const range = preset.getRange();
    setDateRange(range.start, range.end);
    setPresetId(value);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-card p-4 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
        <div className="relative flex flex-col gap-1.5" ref={presetContainerRef}>
          <label
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
            id="date-preset-label"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            Período
          </label>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-left text-sm text-ink transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-44"
            onClick={() => setPresetOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={presetOpen}
            aria-labelledby="date-preset-label"
          >
            <span className="break-words">{selectedPresetLabel}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${presetOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {presetOpen && (
            <div
              role="listbox"
              aria-labelledby="date-preset-label"
              className="absolute left-0 top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg sm:w-44"
            >
              {datePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={presetId === preset.id}
                  className={`block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 ${
                    presetId === preset.id ? 'bg-naja-50 font-medium text-naja-600' : 'text-ink'
                  }`}
                  onClick={() => handlePresetChange(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                role="option"
                aria-selected={isCustom}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 ${
                  isCustom ? 'bg-naja-50 font-medium text-naja-600' : 'text-ink'
                }`}
                onClick={() => handlePresetChange(CUSTOM_PRESET_ID)}
              >
                Personalizado
              </button>
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col gap-1.5 sm:flex-none" ref={containerRef}>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
            </svg>
            Workflow
          </label>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-left text-sm text-ink transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-96"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="break-words">{summaryLabel}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div
              role="listbox"
              aria-multiselectable="true"
              className="absolute left-0 top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg sm:w-96"
            >
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-gray-300 text-naja-500 focus:ring-naja-500/20"
                  checked={allSelected}
                  onChange={() => setWorkflows([])}
                />
                <span className="font-medium">Todos</span>
              </label>
              <div className="my-1 border-t border-gray-100" />
              {workflows.map((w) => (
                <label
                  key={w}
                  className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-naja-500 focus:ring-naja-500/20"
                    checked={filters.workflows.includes(w)}
                    onChange={() => toggleWorkflow(w)}
                  />
                  <span className="break-words">{w}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {!allSelected && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Filtro ativo
          </span>
        )}
      </div>

      <div
        aria-hidden={!isCustom}
        className={`grid transition-all duration-200 ease-out ${
          isCustom ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 pt-3">
            <div className="flex flex-col gap-4 p-1 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
                  htmlFor="start-date"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                  Data inicial
                </label>
                <input
                  ref={startDateRef}
                  id="start-date"
                  type="date"
                  tabIndex={isCustom ? 0 : -1}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-ink [color-scheme:light] transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-auto"
                  value={format(filters.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = parseDateInput(e.target.value);
                    if (newDate) setDateRange(newDate, filters.endDate);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
                  htmlFor="end-date"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                  Data final
                </label>
                <input
                  id="end-date"
                  type="date"
                  tabIndex={isCustom ? 0 : -1}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-ink [color-scheme:light] transition-colors focus:border-naja-500 focus:outline-none focus:ring-2 focus:ring-naja-500/20 sm:w-auto"
                  value={format(filters.endDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = parseDateInput(e.target.value);
                    if (newDate) setDateRange(filters.startDate, newDate);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
