import { Camera, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTranslation } from '@/hooks/use-translation';

export const Footer = () => {
  const dictionary = useTranslation();
  const [brandPrimary, brandSecondary = ''] = dictionary.brand.split(' LIMITED ');

  return (
    <footer className="border-t border-black/5 bg-black/[0.02]">
      <div className="container-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3" aria-label={dictionary.brand}>
            <img
              src="/brand-logo.png"
              alt={dictionary.brand}
              className="h-14 w-14 rounded-full bg-black object-cover ring-1 ring-black/10"
            />
            <div>
              <h3 className="font-heading text-xl font-bold leading-none">{brandPrimary}</h3>
              <p className="mt-1 text-xs font-semibold uppercase leading-none text-neutral-500">
                {brandSecondary ? `LIMITED ${brandSecondary}` : dictionary.misc.headerTagline}
              </p>
            </div>
          </Link>
          <p className="text-sm leading-7 text-neutral-600">
            {dictionary.misc.footerDescription}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">{dictionary.misc.footerExplore}</p>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link to="/shop">{dictionary.nav.shop}</Link>
            <Link to="/wishlist">{dictionary.nav.wishlist}</Link>
            <Link to="/profile">{dictionary.nav.profile}</Link>
            <Link to="/admin">{dictionary.nav.admin}</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">{dictionary.misc.footerContact}</p>
          <div className="space-y-3 text-sm text-neutral-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {dictionary.misc.footerLocation}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +995 555 00 00 00
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              studio@alexandralimitedcollection.com
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">{dictionary.misc.footerSocial}</p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-950"
          >
            <Camera className="h-4 w-4" />
            @alexandralimitedcollection
          </a>
        </div>
      </div>
    </footer>
  );
};
