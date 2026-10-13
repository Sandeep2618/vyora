import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { EmptyStateProps } from '../config/interface';
import { EMPTY_STATE_CONTAINER_STYLES, EMPTY_STATE_ICON_BOX_STYLES } from '../config/constant';

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={cn(EMPTY_STATE_CONTAINER_STYLES, className)}>
      <div className={EMPTY_STATE_ICON_BOX_STYLES}>
        <Icon className="w-6 h-6 opacity-80" />
      </div>
      {title && (
        <h4 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA] mb-1">{title}</h4>
      )}
      <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] max-w-sm mb-4 leading-relaxed">
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
