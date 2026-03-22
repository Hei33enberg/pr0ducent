import { useEffect, useRef, useState } from "react";

const callbacks = new Map<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) {
              cb();
              sharedObserver!.unobserve(entry.target);
              callbacks.delete(entry.target);
            }
          }
        }
        if (callbacks.size === 0 && sharedObserver) {
          sharedObserver.disconnect();
          sharedObserver = null;
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px 200px 0px" }
    );
  }
  return sharedObserver;
}

export function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getObserver();
    callbacks.set(el, () => setIsVisible(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, []);

  return { ref, isVisible };
}
