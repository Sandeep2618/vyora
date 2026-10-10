import React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#123B3A] tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
