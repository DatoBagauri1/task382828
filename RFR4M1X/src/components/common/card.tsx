import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn('surface-panel', className)} {...props}>
    {children}
  </div>
);
