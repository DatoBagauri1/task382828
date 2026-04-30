import type { PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

export const Badge = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <span
    className={cn(
      'inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-700',
      className,
    )}
  >
    {children}
  </span>
);
