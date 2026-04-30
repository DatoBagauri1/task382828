import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

import { AppBootstrap } from '@/components/common/app-bootstrap';
import { LoadingScreen } from '@/components/common/skeletons';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';
import { useCommerceStore } from '@/store/commerce-store';

export const RootLayout = () => {
  const location = useLocation();
  const dictionary = useTranslation();
  const authLoading = useAuthStore((state) => state.isLoading);
  const catalogLoading = useCommerceStore((state) => state.isLoadingCatalog);

  return (
    <>
      <AppBootstrap />
      {authLoading || catalogLoading ? (
        <LoadingScreen message={dictionary.misc.skeletonHeading} />
      ) : (
        <>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname + location.search}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.26, ease: 'easeOut' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
          <CartDrawer />
        </>
      )}
    </>
  );
};
