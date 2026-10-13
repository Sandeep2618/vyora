import { MODAL_WIDTH_STYLES, DEFAULT_MODAL_MAX_WIDTH } from '../config/constant';

export const resolveModalWidthClass = (maxWidth?: string): string => {
  return (
    MODAL_WIDTH_STYLES[maxWidth ?? DEFAULT_MODAL_MAX_WIDTH] ??
    MODAL_WIDTH_STYLES[DEFAULT_MODAL_MAX_WIDTH]
  );
};
