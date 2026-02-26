import { useMemo } from 'react';
import { calculateTredecoScore } from '../logic/tredecoEngine';

export function useTredecoEngine(amount: number, multiplier: number) {
  return useMemo(
    () => calculateTredecoScore({ amount, multiplier }),
    [amount, multiplier]
  );
}
