'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function ModalOverlay({
  open,
  onClose,
  children,
  maxWidthClass = 'max-w-xl',
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-40 flex items-start justify-center px-4 pb-6 pt-10 backdrop-blur-md sm:pt-14"
          style={{ background: 'var(--modal-backdrop)' }}
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`w-full ${maxWidthClass}`}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    ,
    document.body,
  );
}
