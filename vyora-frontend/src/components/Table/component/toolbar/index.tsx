import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  RotateCw,
  Columns,
  Download,
} from 'lucide-react';
import { ITableController, ITableOption } from '../../config/interface';
import { TABLE_CLASSES } from '../../config/constant';
import { exportToCsv } from '../../util/export';
import { downloadFile } from '@/lib/api';

interface ITableToolbarProps<T = any> {
  controller: ITableController<T>;
  option: ITableOption<T>;
  onExport?: () => void;
}

export function TableToolbar<T = any>({
  controller,
  option,
  onExport,
}: ITableToolbarProps<T>) {
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (option.toolbar === false) {
    return null;
  }

  const isSearchEnabled = option.search !== false;
  const isCountPillEnabled = option.countPill !== false && controller.total > 0;
  const isRefreshEnabled = option.refresh !== false;
  const hideableColumns = controller.allColumns.filter(
    (col) => !col.alwaysVisible && col.canHide !== false && col.dataIndex !== 'action'
  );
  const isColumnSettingsEnabled = option.columnSettings !== false && hideableColumns.length > 0;
  const isExportEnabled = option.export !== false;
  const hasHeaderActions = Boolean(option.headerActions);

  const hasLeft = isSearchEnabled || isCountPillEnabled;
  const hasRight =
    hasHeaderActions ||
    isRefreshEnabled ||
    isColumnSettingsEnabled ||
    isExportEnabled;

  if (!hasLeft && !hasRight) {
    return null;
  }

  const handleExport = async () => {
    if (onExport) {
      onExport();
      return;
    }

    const exportConfig = typeof option.export === 'object' ? option.export : undefined;
    const filename = exportConfig?.filename || `${option.module || 'export'}-export.csv`;

    let endpoint = exportConfig?.endpoint;
    if (!endpoint && option.module) {
      const moduleMap: Record<string, string> = {
        invoices: '/invoices/export',
        products: '/products/export',
        parties: '/parties/export',
        purchases: '/purchases/export',
        payments: '/payments/export',
        inventory: '/inventory/export',
        'stock-movements': '/inventory/export',
        expenses: '/expenses/export',
        'reports-sales': '/reports/sales-register/export',
        'reports-purchases': '/reports/purchase-register/export',
        'reports-stock': '/reports/stock-summary/export',
        'reports-dues': '/reports/customer-dues/export',
      };
      endpoint = moduleMap[option.module];
    }

    if (endpoint) {
      try {
        setIsExporting(true);
        let exportUrl = endpoint;
        if (controller.searchValue) {
          const sep = exportUrl.includes('?') ? '&' : '?';
          exportUrl += `${sep}search=${encodeURIComponent(controller.searchValue)}`;
        }
        await downloadFile(exportUrl, filename);
        return;
      } catch (err) {
        console.warn('Backend export failed, falling back to client rows export:', err);
        exportToCsv(controller.visibleColumns, controller.rows, filename);
      } finally {
        setIsExporting(false);
      }
    } else {
      exportToCsv(controller.visibleColumns, controller.rows, filename);
    }
  };

  const searchPlaceholder =
    typeof option.search === 'object' && option.search.placeholder
      ? option.search.placeholder
      : `Search ${option.module}...`;

  return (
    <div className={TABLE_CLASSES.toolbar}>
      {/* Left side: Search & count badge */}
      {hasLeft && (
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[200px]">
          {/* Search input */}
          {isSearchEnabled && (
            <div className="relative flex-1 max-w-xs sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566B69] dark:text-[#8FA8A4] pointer-events-none" />
              <input
                type="text"
                value={controller.searchValue}
                onChange={(e) => controller.setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8.5 pl-8 pr-7 text-xs bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-[#123B3A] dark:text-[#E6F4F1] placeholder-[#566B69]/60 dark:placeholder-[#8FA8A4]/60 focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              />
              {controller.searchValue && (
                <button
                  type="button"
                  onClick={() => controller.setSearchValue('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#566B69] hover:text-[#123B3A] dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Count pill (never shown when 0 records) */}
          {isCountPillEnabled && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#5EEAD4] rounded-full border border-[#B3DCD6]/60 dark:border-[#1E3B38]">
              <span>{controller.total.toLocaleString('en-IN')}</span>
              <span className="text-[#566B69] dark:text-[#8FA8A4] font-normal">records</span>
            </div>
          )}
        </div>
      )}

      {/* Right side: Actions, Refresh, Columns, Export */}
      {hasRight && (
        <div className="flex items-center gap-2 ml-auto">
          {/* Custom Header Actions slot */}
          {hasHeaderActions && (
            <div className="flex items-center gap-2 mr-1">
              {option.headerActions}
            </div>
          )}

          {/* Refresh button */}
          {isRefreshEnabled && (
            <button
              type="button"
              onClick={() => controller.reload()}
              disabled={controller.isLoading || controller.isRefetching}
              className="inline-flex items-center justify-center w-8.5 h-8.5 text-[#123B3A] dark:text-[#E6F4F1] bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] disabled:opacity-50 transition-colors focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] cursor-pointer"
              title="Refresh data"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${
                  controller.isRefetching || controller.isLoading ? 'animate-spin text-[#0F766E]' : ''
                }`}
              />
            </button>
          )}

          {/* Column settings dropdown */}
          {isColumnSettingsEnabled && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 h-8.5 px-2.5 text-xs text-[#123B3A] dark:text-[#E6F4F1] bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] transition-colors focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] cursor-pointer"
                title="Toggle columns"
              >
                <Columns className="w-3.5 h-3.5 text-[#566B69] dark:text-[#8FA8A4]" />
                <span className="hidden sm:inline font-medium">Columns</span>
              </button>

              {isColumnDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#122524] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl shadow-lg z-30 p-2 text-xs divide-y divide-[#D7E5E2]/40 dark:divide-[#1E3B38]/40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 font-semibold text-[#123B3A] dark:text-white">
                    Visible Columns
                  </div>
                  <div className="pt-1.5 max-h-56 overflow-y-auto space-y-1">
                    {hideableColumns.map((col) => {
                      const isVisible = controller.visibleColumns.some(
                        (c) => c.dataIndex === col.dataIndex
                      );
                      return (
                        <label
                          key={col.dataIndex}
                          className="flex items-center gap-2 px-2 py-1 hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] rounded-md cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => controller.toggleColumnVisibility(col.dataIndex)}
                            className="w-3.5 h-3.5 text-[#0F766E] border-[#D7E5E2] rounded focus:ring-0 focus:outline-none accent-[#0F766E]"
                          />
                          <span className="truncate text-[#123B3A] dark:text-[#E6F4F1]">
                            {col.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export trigger */}
          {isExportEnabled && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 h-8.5 px-2.5 text-xs text-[#123B3A] dark:text-[#E6F4F1] bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] disabled:opacity-50 transition-colors focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] cursor-pointer"
              title="Export CSV"
            >
              <Download
                className={`w-3.5 h-3.5 ${
                  isExporting
                    ? 'animate-bounce text-[#0F766E] dark:text-[#14B8A6]'
                    : 'text-[#566B69] dark:text-[#8FA8A4]'
                }`}
              />
              <span className="hidden sm:inline font-medium">
                {isExporting ? 'Exporting...' : 'Export'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
