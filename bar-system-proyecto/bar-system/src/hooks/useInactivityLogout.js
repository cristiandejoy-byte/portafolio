import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutos

/**
 * HU-003: Cierre de sesión automático por inactividad (5 minutos).
 * Reinicia el timer en cualquier interacción del usuario.
 */
export function useInactivityLogout(onLogout, enabled = true) {
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    if (!enabled) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_MS);
  }, [onLogout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start timer

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
    };
  }, [reset, enabled]);
}
