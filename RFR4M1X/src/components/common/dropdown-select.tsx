import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

type DropdownOption = {
  value: string;
  label: string;
  meta?: string;
};

type DropdownSelectProps = {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
};

export const DropdownSelect = ({
  label,
  value,
  options,
  onChange,
  className,
}: DropdownSelectProps) => {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
          {label}
        </label>
      ) : null}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        onClick={() => setIsOpen((current) => !current)}
        className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 text-left text-base font-semibold text-neutral-950 shadow-none transition duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/15 sm:gap-4 sm:text-sm"
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-neutral-500 transition duration-200 group-hover:text-white',
            isOpen && 'rotate-180 text-neutral-950 group-hover:text-white',
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={`${id}-menu`}
            role="listbox"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 z-30 mt-3 w-full min-w-full overflow-hidden rounded-[20px] border border-neutral-200 bg-white p-2 shadow-glass sm:min-w-[220px] sm:rounded-[24px]"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-left text-sm transition duration-200',
                    isSelected
                      ? 'bg-neutral-950 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{option.label}</span>
                    {option.meta ? (
                      <span className={cn('mt-1 block text-xs', isSelected ? 'text-white/65' : 'text-neutral-500')}>
                        {option.meta}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
