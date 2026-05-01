import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-3 break-words font-heading text-2xl font-bold leading-tight text-neutral-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);
