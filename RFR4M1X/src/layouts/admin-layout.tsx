import { BarChart3, FolderKanban, Package, ReceiptText } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/cn';

export const AdminLayout = () => {
  const dictionary = useTranslation();
  const tabs = [
    { href: '/admin', label: dictionary.admin.overview, icon: BarChart3, end: true },
    { href: '/admin/products', label: dictionary.admin.manageProducts, icon: Package },
    { href: '/admin/orders', label: dictionary.admin.manageOrders, icon: ReceiptText },
    { href: '/admin/categories', label: dictionary.admin.manageCategories, icon: FolderKanban },
  ];

  return (
    <div className="container-shell section-space">
      <div className="mb-6 max-w-3xl sm:mb-8">
        <p className="eyebrow">{dictionary.common.admin}</p>
        <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{dictionary.admin.title}</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
          {dictionary.admin.description}
        </p>
      </div>
      <div className="-mx-3.5 mb-6 flex gap-2 overflow-x-auto px-3.5 pb-2 mobile-scrollbar sm:mx-0 sm:mb-8 sm:flex-wrap sm:gap-3 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.href}
              to={tab.href}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-black/10 transition sm:px-5 sm:py-3',
                  isActive
                    ? 'bg-ink text-white'
                    : 'can-hover:hover:bg-black/5',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
};
