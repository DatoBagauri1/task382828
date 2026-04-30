import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export const EmptyState = ({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) => (
  <div className="surface-panel flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:px-10">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
      <PackageOpen className="h-6 w-6" />
    </div>
    <div className="space-y-2">
      <h3 className="font-heading text-2xl font-bold">{title}</h3>
      <p className="max-w-lg text-sm leading-7 text-neutral-600">{description}</p>
    </div>
    {actionHref && actionLabel ? (
      <Link
        to={actionHref}
        className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        {actionLabel}
      </Link>
    ) : null}
  </div>
);
