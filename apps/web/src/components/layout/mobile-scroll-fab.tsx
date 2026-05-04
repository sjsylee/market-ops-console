'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const SHOW_SCROLL_Y = 260;
const MIN_SCROLLABLE_HEIGHT = 240;

export function MobileScrollFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    function updateVisibility() {
      const scrollTop = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const shouldShow = scrollTop > SHOW_SCROLL_Y && scrollableHeight > MIN_SCROLLABLE_HEIGHT;

      setVisible((current) => (current === shouldShow ? current : shouldShow));
      ticking = false;
    }

    function handleScroll() {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    }

    updateVisibility();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={scrollToTop}
      className={[
        'mobile-scroll-fab md:hidden',
        visible ? 'mobile-scroll-fab-visible' : 'mobile-scroll-fab-hidden',
      ].join(' ')}
    >
      <ArrowUp size={18} />
    </button>
  );
}
