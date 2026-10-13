import React from 'react';
import { cn } from '@/lib/utils';
import { PageHeaderProps } from '../config/interface';
import { PAGE_HEADER_CONTAINER_STYLES } from '../config/constant';

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn(PAGE_HEADER_CONTAINER_STYLES, className)}>
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-[#566B69] dark:text-[#8FA8A4] mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">{children}</div>
      )}
    </div>
  );
};
