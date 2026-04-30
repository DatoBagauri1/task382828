import { Star } from 'lucide-react';

import { cn } from '@/utils/cn';

export const RatingStars = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className={cn('flex items-center gap-1', className)} aria-label={`Rating ${value} out of 5`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={cn(
          'h-4 w-4',
          index < Math.round(value)
            ? 'fill-black text-black'
            : 'fill-transparent text-neutral-300',
        )}
      />
    ))}
  </div>
);
