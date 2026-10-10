import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled' | 'neutral' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  ...props
}) => {
  const styles = {
    paid: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    success: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    pending: 'bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]',
    overdue: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    cancelled: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
    draft: 'bg-[#F4F8F7] text-[#566B69] border-[#D7E5E2]',
    neutral: 'bg-[#E6F4F2] text-[#0F766E] border-[#D7E5E2]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
