import {
  DRAWER_SIZE_WIDTHS,
  DRAWER_SIZE_HEIGHTS,
  DEFAULT_DRAWER_PLACEMENT,
  DEFAULT_DRAWER_SIZE,
} from '../config/constant';

export interface DrawerClasses {
  positionClass: string;
  sizeClass: string;
  roundedClass: string;
}

export const resolveDrawerClasses = (
  placement = DEFAULT_DRAWER_PLACEMENT,
  size = DEFAULT_DRAWER_SIZE,
): DrawerClasses => {
  if (placement === 'bottom') {
    return {
      positionClass: 'inset-x-0 bottom-0 top-auto',
      sizeClass: DRAWER_SIZE_HEIGHTS[size] ?? DRAWER_SIZE_HEIGHTS[DEFAULT_DRAWER_SIZE],
      roundedClass: 'rounded-t-2xl',
    };
  }
  if (placement === 'top') {
    return {
      positionClass: 'inset-x-0 top-0 bottom-auto',
      sizeClass: DRAWER_SIZE_HEIGHTS[size] ?? DRAWER_SIZE_HEIGHTS[DEFAULT_DRAWER_SIZE],
      roundedClass: 'rounded-b-2xl',
    };
  }
  if (placement === 'left') {
    return {
      positionClass: 'inset-y-0 left-0 right-auto',
      sizeClass: `w-full ${DRAWER_SIZE_WIDTHS[size] ?? DRAWER_SIZE_WIDTHS[DEFAULT_DRAWER_SIZE]}`,
      roundedClass: 'rounded-r-2xl',
    };
  }
  // Default: right
  return {
    positionClass: 'inset-y-0 right-0 left-auto',
    sizeClass: `w-full ${DRAWER_SIZE_WIDTHS[size] ?? DRAWER_SIZE_WIDTHS[DEFAULT_DRAWER_SIZE]}`,
    roundedClass: 'rounded-l-2xl',
  };
};
