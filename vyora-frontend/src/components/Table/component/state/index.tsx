import React from 'react';
import { AlertCircle, SearchX, Inbox, Plus, RotateCw } from 'lucide-react';
import { ITableController, ITableOption } from '../../config/interface';

interface ITableStateProps<T = any> {
  controller: ITableController<T>;
  option: ITableOption<T>;
}

export function TableLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-10 h-10 mb-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#D7E5E2] dark:border-[#1E3B38] border-t-[#0F766E] animate-spin" />
      </div>
      <p className="text-xs font-medium text-[#566B69] dark:text-[#8FA8A4] animate-pulse">
        Loading data...
      </p>
    </div>
  );
}

export function TableCleanSlateState<T = any>({ option }: ITableStateProps<T>) {
  const title = option.emptyState?.title || `No ${option.module} found`;
  const description =
    option.emptyState?.description ||
    `Get started by creating your first ${option.module.replace(/s$/, '')}.`;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 mb-3 rounded-full bg-[#E6F4F2] dark:bg-[#162E2D] flex items-center justify-center text-[#0F766E] dark:text-[#5EEAD4] border border-[#B3DCD6]/60 dark:border-[#1E3B38]">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] max-w-sm mb-4">
        {description}
      </p>
      {option.emptyState?.actionLabel && option.emptyState?.onAction && (
        <button
          type="button"
          onClick={option.emptyState.onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#0D665F] text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{option.emptyState.actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export function TableFilteredEmptyState<T = any>({
  controller,
  option,
}: ITableStateProps<T>) {
  const title = option.filteredEmptyState?.title || 'No matching results';
  const description =
    option.filteredEmptyState?.description ||
    'Try adjusting your search terms or clearing your filters to see results.';

  const handleReset = () => {
    controller.setSearchValue('');
    controller.clearFilters();
    if (option.filteredEmptyState?.onAction) {
      option.filteredEmptyState.onAction();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 mb-3 rounded-full bg-[#F4F8F7] dark:bg-[#162E2D] flex items-center justify-center text-[#566B69] dark:text-[#8FA8A4] border border-[#D7E5E2] dark:border-[#1E3B38]">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] max-w-sm mb-4">
        {description}
      </p>
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] text-[#123B3A] dark:text-[#E6F4F1] transition-colors"
      >
        <span>{option.filteredEmptyState?.actionLabel || 'Clear all filters'}</span>
      </button>
    </div>
  );
}

export function TableErrorState<T = any>({
  controller,
  option,
}: ITableStateProps<T>) {
  const title = option.errorState?.title || 'Failed to load data';
  const description =
    option.errorState?.description ||
    controller.error?.message ||
    'An unexpected error occurred while communicating with the server.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 mb-3 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 border border-red-200 dark:border-red-900/60">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] max-w-sm mb-4">
        {description}
      </p>
      <button
        type="button"
        onClick={() => controller.reload()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#0D665F] text-white shadow-xs transition-colors"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>{option.errorState?.retryLabel || 'Try again'}</span>
      </button>
    </div>
  );
}
