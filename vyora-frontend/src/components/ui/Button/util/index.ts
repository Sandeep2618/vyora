import { BUTTON_VARIANTS, BUTTON_SIZES, DEFAULT_BUTTON_VARIANT, DEFAULT_BUTTON_SIZE } from '../config/constant';

export const resolveButtonClasses = (
  variant = DEFAULT_BUTTON_VARIANT,
  size = DEFAULT_BUTTON_SIZE,
): string => {
  return `${BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS[DEFAULT_BUTTON_VARIANT]} ${BUTTON_SIZES[size] ?? BUTTON_SIZES[DEFAULT_BUTTON_SIZE]}`;
};
