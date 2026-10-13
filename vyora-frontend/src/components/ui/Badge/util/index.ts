import { BADGE_STYLES, DEFAULT_BADGE_VARIANT } from '../config/constant';
import { BadgeVariant } from '../config/interface';

export const resolveBadgeStyle = (variant: BadgeVariant = DEFAULT_BADGE_VARIANT): string => {
  return BADGE_STYLES[variant] ?? BADGE_STYLES[DEFAULT_BADGE_VARIANT];
};
