import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface MetricInfoProps {
  whatItShows: string;
  howToInterpret: string;
}

const TOOLTIP_WIDTH = 256;

export function MetricInfo({ whatItShows, howToInterpret }: MetricInfoProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function openTooltip() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, 8),
      window.innerWidth - TOOLTIP_WIDTH - 8
    );

    setCoords({ top: rect.bottom + 8, left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !target.closest('[data-metric-info-tooltip]')
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  return (
    <span className="relative inline-flex shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className="flex h-4 w-4 items-center justify-center text-muted transition-colors hover:text-naja-600"
        onMouseEnter={openTooltip}
        onMouseLeave={() => setOpen(false)}
        onClick={openTooltip}
        aria-label="Mais informações sobre este indicador"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            data-metric-info-tooltip
            role="tooltip"
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: TOOLTIP_WIDTH }}
            className="z-50 rounded-lg border border-gray-200 bg-card p-3 text-xs leading-relaxed shadow-panel-hover"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <p className="text-ink">{whatItShows}</p>
            <p className="mt-1.5 border-t border-gray-100 pt-1.5 text-muted">{howToInterpret}</p>
          </div>,
          document.body
        )}
    </span>
  );
}
