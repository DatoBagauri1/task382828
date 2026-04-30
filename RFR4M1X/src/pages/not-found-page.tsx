import { Link } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { SEO } from '@/components/common/seo';
import { useTranslation } from '@/hooks/use-translation';

export const NotFoundPage = () => {
  const dictionary = useTranslation();

  return (
    <>
      <SEO title="404 | ALEXANDRA LIMITED COLLECTION" description={dictionary.misc.notFoundDescription} />
      <div className="container-shell section-space">
        <div className="glass-panel mx-auto max-w-3xl px-8 py-14 text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-3 font-heading text-5xl font-bold tracking-tight">
            {dictionary.misc.notFoundTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-neutral-600 sm:text-base">
            {dictionary.misc.notFoundDescription}
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button>{dictionary.misc.backHome}</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
