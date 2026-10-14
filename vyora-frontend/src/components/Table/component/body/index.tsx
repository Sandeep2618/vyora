import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { ITableController, ITableOption, ITableEvent } from '../../config/interface';
import { TABLE_CLASSES } from '../../config/constant';
import { TABLE_EVENT } from '../../config/enum';
import { getValueByPath, formatCellValue } from '../../util/column';

interface ITableBodyProps<T = any> {
  controller: ITableController<T>;
  option: ITableOption<T>;
  callBack?: (event: ITableEvent<T>) => void;
}

export function TableBody<T = any>({
  controller,
  option,
  callBack,
}: ITableBodyProps<T>) {
  const isSelectionEnabled = Boolean(option.selection);

  const getRowKey = (row: T, index: number): string => {
    if (typeof option.rowKey === 'function') {
      return option.rowKey(row);
    }
    const val = (row as any)?.[option.rowKey] ?? (row as any)?._id ?? (row as any)?.id;
    return val !== undefined && val !== null ? String(val) : String(index);
  };

  const handleRowClick = (row: T, index: number, event: React.MouseEvent) => {
    // Avoid triggering row click if user clicked an interactive input, button, or anchor
    const target = event.target as HTMLElement;
    if (target.closest('button, input, a, select, textarea, [data-prevent-row-click="true"]')) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.ROW_CLICK,
      data: { row, index },
    });
  };

  const handleRowDoubleClick = (row: T, index: number, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, a, select, textarea')) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.ROW_DOUBLE_CLICK,
      data: { row, index },
    });
  };

  const triggerAction = (actionId: string, row: T, e: React.MouseEvent) => {
    e.stopPropagation();
    callBack?.({
      type: TABLE_EVENT.ACTION_TRIGGER,
      data: { actionId, row },
    });
  };

  return (
    <tbody className={TABLE_CLASSES.tbody}>
      {controller.rows.map((row, rowIndex) => {
        const key = getRowKey(row, rowIndex);
        const isSelected = controller.selectedKeys.has(key);

        const isRowDisabled =
          typeof option.selection === 'object' && option.selection.disabled
            ? option.selection.disabled(row)
            : false;

        const customRowClass = option.rowClassName ? option.rowClassName(row, rowIndex) : '';

        return (
          <tr
            key={key}
            data-selected={isSelected}
            onClick={(e) => handleRowClick(row, rowIndex, e)}
            onDoubleClick={(e) => handleRowDoubleClick(row, rowIndex, e)}
            className={`${TABLE_CLASSES.tr} ${customRowClass}`}
          >
            {/* Selection Checkbox */}
            {isSelectionEnabled && (
              <td className="w-10 px-3 text-center align-middle" data-prevent-row-click="true">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isRowDisabled}
                  onChange={() => controller.toggleRowSelection(key, row)}
                  className="w-3.5 h-3.5 text-[#0F766E] border-[#D7E5E2] rounded focus:ring-0 focus:outline-none accent-[#0F766E] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </td>
            )}

            {/* Cells */}
            {controller.visibleColumns.map((col) => {
              const alignClass =
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                  ? 'text-center'
                  : 'text-left';

              const widthStyle: React.CSSProperties = {
                width: controller.columnWidths[col.dataIndex] || col.width,
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
              };

              // 1. Custom Render Function
              if (col.render) {
                return (
                  <td
                    key={col.dataIndex}
                    style={widthStyle}
                    className={`${TABLE_CLASSES.td} ${alignClass}`}
                  >
                    {col.render(row, rowIndex)}
                  </td>
                );
              }

              // 2. Action Column
              if (col.action) {
                const canView =
                  typeof col.action.view === 'function' ? col.action.view(row) : col.action.view;
                const canEdit =
                  typeof col.action.edit === 'function' ? col.action.edit(row) : col.action.edit;
                const canDelete =
                  typeof col.action.delete === 'function'
                    ? col.action.delete(row)
                    : col.action.delete;

                return (
                  <td
                    key={col.dataIndex}
                    style={widthStyle}
                    className={`${TABLE_CLASSES.td} text-center`}
                    data-prevent-row-click="true"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {canView && (
                        <button
                          type="button"
                          onClick={(e) => triggerAction('view', row, e)}
                          className="p-1 text-[#566B69] hover:text-[#0F766E] dark:hover:text-[#5EEAD4] rounded hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => triggerAction('edit', row, e)}
                          className="p-1 text-[#566B69] hover:text-[#0F766E] dark:hover:text-[#5EEAD4] rounded hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => triggerAction('delete', row, e)}
                          className="p-1 text-[#566B69] hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {col.action.custom?.map((act) => {
                        if (act.hidden && act.hidden(row)) return null;
                        const isDisabled = act.disabled ? act.disabled(row) : false;
                        return (
                          <button
                            key={act.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={(e) => triggerAction(act.id, row, e)}
                            className={`p-1 rounded transition-colors ${
                              act.danger
                                ? 'text-[#566B69] hover:text-red-600 hover:bg-red-50'
                                : 'text-[#566B69] hover:text-[#0F766E] hover:bg-[#E6F4F2]'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={act.label || act.id}
                          >
                            {act.icon || act.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                );
              }

              // 3. Standard Cell
              const rawValue = getValueByPath(row, col.dataIndex);
              const formatted = formatCellValue(rawValue, col.displayType);

              return (
                <td
                  key={col.dataIndex}
                  style={widthStyle}
                  className={`${TABLE_CLASSES.td} ${alignClass} ${
                    col.truncate ? 'truncate max-w-[200px]' : ''
                  }`}
                >
                  <span title={typeof rawValue === 'string' ? rawValue : undefined}>
                    {formatted}
                  </span>
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
