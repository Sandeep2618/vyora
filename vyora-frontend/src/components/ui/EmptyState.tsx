import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center my-4',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 opacity-80" />
      </div>
      {title && (
        <h4 className="text-sm font-bold text-[#123B3A] mb-1">{title}</h4>
      )}
      <p className="text-xs text-[#566B69] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
