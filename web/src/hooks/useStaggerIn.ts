import { useLayoutEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

/** Fades + slides in the children of the returned ref matching `selector`, staggered. */
export function useStaggerIn<T extends HTMLElement>(selector: string, deps: unknown[] = []) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const targets = ref.current?.querySelectorAll<HTMLElement>(selector);
    if (!targets?.length) return;
    animate(targets, {
      opacity: [0, 1],
      y: [16, 0],
      duration: 500,
      delay: stagger(60),
      ease: 'outQuad',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
