import React, { forwardRef, useImperativeHandle } from 'react';
import {
  ITableOption,
  ITableEvent,
  ITableHandle,
} from '../config/interface';
import { TABLE_CLASSES } from '../config/constant';
import { useTable } from '../hook/composer';
import { TableToolbar } from './toolbar';
import { TableHeader } from './header';
import { TableBody } from './body';
import { TableFooter } from './footer';
import { TableBulkBar } from './bulk';
import {
  TableLoadingState,
  TableCleanSlateState,
  TableFilteredEmptyState,
  TableErrorState,
} from './state';

export interface TableProps<T = any> {
  option: ITableOption<T>;
  callBack?: (event: ITableEvent<T>) => void;
  className?: string;
}

function TableInner<T = any>(
  props: TableProps<T>,
  ref: React.Ref<ITableHandle>
) {
  const { option, callBack, className = '' } = props;
  const controller = useTable<T>(option, callBack);

  // Expose imperative handle for parent controls (reload, clearSelection)
  useImperativeHandle(
    ref,
    () => ({
      reload: controller.reload,
      clearSelection: controller.clearSelection,
    }),
    [controller.reload, controller.clearSelection]
  );

  const isFiltered =
    option.isFiltered !== undefined
      ? option.isFiltered
      : Boolean(controller.searchValue.trim() || controller.activeFilterCount > 0);

  const isCleanSlate =
    controller.total === 0 && !isFiltered && !controller.isLoading && !controller.error;

  if (isCleanSlate) {
    return (
      <div className={`${TABLE_CLASSES.container} ${option.className || ''} ${className}`}>
        <TableCleanSlateState controller={controller} option={option} />
      </div>
    );
  }

  return (
    <div className={`${TABLE_CLASSES.container} ${option.className || ''} ${className}`}>
      {/* 1. Toolbar */}
      <TableToolbar
        controller={controller}
        option={option}
      />

      {/* 2. Refetching Indicator Bar */}
      {controller.isRefetching && (
        <div className="h-0.5 w-full bg-[#E6F4F2] dark:bg-[#162E2D] overflow-hidden">
          <div className="h-full bg-[#0F766E] animate-pulse w-full" />
        </div>
      )}

      {/* 3. Main Table Area */}
      <div className={TABLE_CLASSES.tableWrapper}>
        {controller.isLoading ? (
          <TableLoadingState />
        ) : controller.error ? (
          <TableErrorState controller={controller} option={option} />
        ) : controller.rows.length === 0 ? (
          <TableFilteredEmptyState controller={controller} option={option} />
        ) : (
          <table className={TABLE_CLASSES.table}>
            {option.header !== false && (
              <TableHeader controller={controller} option={option} />
            )}
            <TableBody controller={controller} option={option} callBack={callBack} />
          </table>
        )}
      </div>

      {/* 4. Footer */}
      <TableFooter controller={controller} option={option} />

      {/* 5. Floating Bulk Actions Bar */}
      <TableBulkBar controller={controller} option={option} callBack={callBack} />
    </div>
  );
}

export const Table = forwardRef(TableInner) as <T = any>(
  props: TableProps<T> & { ref?: React.Ref<ITableHandle> }
) => React.ReactElement | null;
