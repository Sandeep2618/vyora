import React from 'react';
import { cn } from '@/lib/utils';
import { CardProps, CardTitleProps, CardDescriptionProps } from '../config/interface';
import { CARD_BASE_STYLES } from '../config/constant';

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn(CARD_BASE_STYLES, className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-3 border-b border-[#D7E5E2] dark:border-[#1E3B38] mb-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn('text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA]', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn('text-xs text-[#566B69] dark:text-[#8FA8A4] mt-0.5', className)}
      {...props}
    >
      {children}
    </p>
  );
};
