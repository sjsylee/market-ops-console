'use client';

import { useCallback, useEffect, useState } from 'react';

const modalUrlChangeEvent = 'kfs-modal-url-change';

export function openUrlModal(href: string) {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new Event(modalUrlChangeEvent));
}

export function closeUrlModal(href: string) {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new Event(modalUrlChangeEvent));
}

export function useUrlModal(initialModal?: string) {
  const [modal, setModal] = useState<string | null>(initialModal ?? null);

  const readModal = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    setModal(params.get('modal'));
  }, []);

  useEffect(() => {
    readModal();
    window.addEventListener('popstate', readModal);
    window.addEventListener(modalUrlChangeEvent, readModal);

    return () => {
      window.removeEventListener('popstate', readModal);
      window.removeEventListener(modalUrlChangeEvent, readModal);
    };
  }, [readModal]);

  return modal;
}
