import { ReactNode, useCallback, useMemo, useState } from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { EffectsContext } from './effects-context';
export const EffectsProvider = ({ children }: { children: ReactNode }) => {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('portfolio-effects') !== 'off';
    } catch {
      return true;
    }
  });
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData
  );
  const toggle = useCallback(() => {
    setEnabled((current) => {
      try {
        localStorage.setItem('portfolio-effects', current ? 'off' : 'on');
      } catch {
        /* The session preference still works when storage is restricted. */
      }
      return !current;
    });
  }, []);
  const value = useMemo(
    () => ({
      enabled,
      motionAllowed: enabled && !reducedMotion && !saveData,
      toggle,
    }),
    [enabled, reducedMotion, saveData, toggle]
  );
  return (
    <EffectsContext.Provider value={value}>
      <MotionConfig reducedMotion='user'>{children}</MotionConfig>
    </EffectsContext.Provider>
  );
};
