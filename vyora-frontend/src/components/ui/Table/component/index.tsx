import React from 'react';
import { cn } from '@/lib/utils';
import {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
} from '../config/interface';
import {
  TABLE_CONTAINER_STYLES,
  TABLE_HEAD_STYLES,
  TABLE_CELL_STYLES,
} from '../config/constant';

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className={TABLE_CONTAINER_STYLES}>
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-xs text-left', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-[#F4F8F7]/80 dark:bg-[#142B2A] border-b border-[#D7E5E2] dark:border-[#1E3B38] [&_tr]:border-b-0',
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        'divide-y divide-[#D7E5E2] dark:divide-[#1E3B38] bg-white dark:bg-[#112322] [&_tr:last-child]:border-0',
        className,
      )}
      {...props}
    />
  ),
);
TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-[#D7E5E2] dark:border-[#1E3B38] bg-[#F4F8F7] dark:bg-[#162E2D] font-semibold text-[#123B3A] dark:text-[#E6F4F1] [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-[#D7E5E2] dark:border-[#1E3B38] transition-colors hover:bg-[#F4F8F7]/70 dark:hover:bg-[#162E2D]/60 data-[state=selected]:bg-[#E6F4F2] dark:data-[state=selected]:bg-[#162E2D]',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn(TABLE_HEAD_STYLES, className)} {...props} />
  ),
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn(TABLE_CELL_STYLES, className)} {...props} />
  ),
);
TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-xs text-[#566B69] dark:text-[#8FA8A4]', className)}
      {...props}
    />
  ),
);
TableCaption.displayName = 'TableCaption';
