import { createContext, useContext } from 'react';
export const EffectsContext = createContext({
  enabled: true,
  motionAllowed: true,
  toggle: () => {},
});
export const useEffects = () => useContext(EffectsContext);
