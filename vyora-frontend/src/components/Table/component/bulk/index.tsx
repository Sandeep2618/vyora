import React from 'react';
import { X } from 'lucide-react';
import { ITableController, ITableOption, ITableEvent } from '../../config/interface';
import { TABLE_CLASSES } from '../../config/constant';
import { TABLE_EVENT } from '../../config/enum';

interface ITableBulkBarProps<T = any> {
  controller: ITableController<T>;
  option: ITableOption<T>;
  callBack?: (event: ITableEvent<T>) => void;
}

export function TableBulkBar<T = any>({
  controller,
  option,
  callBack,
}: ITableBulkBarProps<T>) {
  const selectedCount = controller.selectedKeys.size;

  if (selectedCount === 0) {
    return null;
  }

  const noun =
    typeof option.selection === 'object' && option.selection.noun
      ? option.selection.noun
      : 'items';

  const handleActionClick = (actionId: string, customOnClick?: (keys: string[], rows: T[]) => void) => {
    const keys = Array.from(controller.selectedKeys);
    const rows = controller.selectedRows;

    if (customOnClick) {
      customOnClick(keys, rows);
    }

    callBack?.({
      type: TABLE_EVENT.ACTION_TRIGGER,
      data: {
        actionId,
        keys,
        rows,
      },
    });
  };

  return (
    <div className={TABLE_CLASSES.bulkBar}>
      {/* Selected counter */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/20">
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-[#0F766E] text-white rounded-full">
          {selectedCount}
        </span>
        <span className="text-xs font-medium">
          {noun} selected
        </span>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        {option.bulkActions?.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleActionClick(action.id, action.onClick)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs ${
              action.danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#0F766E] hover:bg-[#0D665F] text-white'
            }`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Clear selection */}
      <button
        type="button"
        onClick={() => controller.clearSelection()}
        className="p-1 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
