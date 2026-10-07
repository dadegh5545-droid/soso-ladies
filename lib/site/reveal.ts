import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Scroll reveal: put the returned ref on a container that has a data-reveal
 * attribute. It gets data-visible the first time it enters the view, and its
 * [data-reveal-item] children animate in (styles/base.css). One observer
 * serves the whole page.
 */
let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.visible = '';
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  return observer;
}

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      element.dataset.visible = '';
      return;
    }
    const io = sharedObserver();
    io.observe(element);
    return () => io.unobserve(element);
  }, []);
  return ref;
}

/** Props for one staggered child of a revealed container. */
export const revealItem = (index = 0) => ({
  'data-reveal-item': '',
  style: { '--reveal-index': index } as CSSProperties,
});
