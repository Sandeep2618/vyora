import React from 'react';
import { cn } from '@/lib/utils';
import { BadgeProps } from '../config/interface';
import { resolveBadgeStyle } from '../util';

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
        resolveBadgeStyle(variant),
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
