import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ITableController, ITableOption } from '../../config/interface';
import { TABLE_CLASSES } from '../../config/constant';

interface ITableHeaderProps<T = any> {
  controller: ITableController<T>;
  option: ITableOption<T>;
}

export function TableHeader<T = any>({
  controller,
  option,
}: ITableHeaderProps<T>) {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = controller.isPartiallySelected;
    }
  }, [controller.isPartiallySelected]);

  const isSelectionEnabled = Boolean(option.selection);

  return (
    <thead className={`${TABLE_CLASSES.thead} ${option.stickyHeader ? 'sticky top-0 z-20 shadow-xs' : ''}`}>
      <tr>
        {/* Selection Checkbox */}
        {isSelectionEnabled && (
          <th className="w-10 px-3 text-center align-middle">
            <input
              ref={selectAllCheckboxRef}
              type="checkbox"
              checked={controller.isAllOnPageSelected}
              onChange={(e) => controller.toggleAllOnPage(e.target.checked)}
              className="w-3.5 h-3.5 text-[#0F766E] border-[#D7E5E2] rounded focus:ring-0 focus:outline-none accent-[#0F766E] cursor-pointer"
              title="Select all on this page"
            />
          </th>
        )}

        {/* Dynamic Column Headers */}
        {controller.visibleColumns.map((col) => {
          const isAction = col.dataIndex === 'action';
          const isSortable = !isAction && col.sortable !== false;
          const isCurrentSort = controller.sortBy === col.dataIndex;

          const alignClass =
            col.align === 'right'
              ? 'text-right justify-end'
              : col.align === 'center'
              ? 'text-center justify-center'
              : 'text-left justify-start';

          const widthStyle: React.CSSProperties = {
            width: controller.columnWidths[col.dataIndex] || col.width,
            minWidth: col.minWidth,
            maxWidth: col.maxWidth,
          };

          return (
            <th
              key={col.dataIndex}
              style={widthStyle}
              className={`${TABLE_CLASSES.th} ${isAction ? 'text-center' : ''}`}
            >
              {isSortable ? (
                <button
                  type="button"
                  onClick={() => controller.toggleSort(col.dataIndex)}
                  className={`group inline-flex items-center gap-1.5 w-full py-1 font-bold text-[#123B3A] dark:text-[#E6F4F1] hover:text-[#0F766E] dark:hover:text-[#5EEAD4] transition-colors ${alignClass}`}
                >
                  <span className="truncate">{col.title}</span>
                  <span className="shrink-0">
                    {isCurrentSort ? (
                      controller.sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#566B69]/40 group-hover:text-[#0F766E] transition-colors" />
                    )}
                  </span>
                </button>
              ) : (
                <div className={`inline-flex items-center w-full py-1 ${alignClass}`}>
                  <span className="truncate">{col.title}</span>
                </div>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
