import { MIN_BAR_HEIGHT_PERCENT } from '../config/constant';

export const calculateBarHeightPercent = (salesMinor: number, max: number): number => {
  return Math.max(MIN_BAR_HEIGHT_PERCENT, Math.round((salesMinor / max) * 100));
};
