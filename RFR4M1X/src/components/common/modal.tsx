import type { PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/cn';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}>;

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  const dictionary = useTranslation();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              'surface-panel max-h-[calc(100svh-1rem)] w-full max-w-3xl overflow-y-auto rounded-b-none p-4 sm:max-h-[90vh] sm:rounded-b-2xl sm:p-7',
              className,
            )}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              {title ? (
                <h3 className="min-w-0 break-words font-heading text-xl font-bold leading-tight sm:text-2xl">
                  {title}
                </h3>
              ) : <span />}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-neutral-500 transition can-hover:hover:bg-neutral-100 can-hover:hover:text-neutral-950"
                aria-label={dictionary.common.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
