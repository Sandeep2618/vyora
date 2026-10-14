import { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ITableOption,
  ITableEvent,
  ITableController,
} from '../../config/interface';
import { TABLE_EVENT } from '../../config/enum';
import { DEFAULT_PAGE_SIZE } from '../../config/constant';
import { buildPayload } from '../../util/payload';
import { applyClientPipeline } from '../../util/clientPipeline';
import {
  useTablePagination,
  useTableSort,
  useTableSearch,
  useTableFilter,
  useTableSelection,
  useTableVisibility,
  useTableWidths,
} from '../state';
import { useTableFetch } from '../data';

export function useTable<T = any>(
  option: ITableOption<T>,
  callBack?: (event: ITableEvent<T>) => void
): ITableController<T> {
  const isServerPaged = Boolean(option.api?.url);

  // Row Key Extractor
  const rowKeyExtractor = useCallback(
    (row: T): string => {
      if (typeof option.rowKey === 'function') {
        return option.rowKey(row);
      }
      const val = (row as any)?.[option.rowKey] ?? (row as any)?._id ?? (row as any)?._id ?? (row as any)?._id;
      return String(val ?? Math.random());
    },
    [option.rowKey]
  );

  // Sorting
  const { sortBy, sortOrder, toggleSort } = useTableSort(option.defaultSort);

  // Searching
  const { searchValue, debouncedSearch, setSearchValue } = useTableSearch(
    option.defaultSearch || ''
  );

  // Filtering
  const { filters, setFilter, clearFilters, activeFilterCount } = useTableFilter(
    option.defaultFilter || {}
  );

  // Column Visibility
  const { visibleColumns, allColumns, visibilityMap, toggleColumnVisibility } =
    useTableVisibility(option.column);

  // Column Widths
  const { columnWidths, setColumnWidth } = useTableWidths(option.column);

  // Mode C (Client-side) Calculation
  const clientData = useMemo(() => {
    if (isServerPaged) {
      return { list: [] as T[], count: 0 };
    }
    return applyClientPipeline<T>({
      data: option.data || [],
      search: debouncedSearch,
      filters,
      sortBy,
      sortOrder,
      pageIndex: 0, // temporary, will slice below
      pageSize: 10,
      columns: option.column,
      paginationEnabled: false, // get full filtered count first
    });
  }, [isServerPaged, option.data, debouncedSearch, filters, sortBy, sortOrder, option.column]);

  // Pagination (initialized with client count or 0)
  const initialPageSize =
    option.pagination === false
      ? DEFAULT_PAGE_SIZE
      : option.pagination?.defaultPageSize || DEFAULT_PAGE_SIZE;

  const {
    pageIndex,
    pageSize,
    totalPages,
    setPageIndex,
    setPageSize,
  } = useTablePagination(initialPageSize, isServerPaged ? 0 : clientData.count);

  // Mode A (Backend) Fetch Payload
  const payload = useMemo(() => {
    if (!isServerPaged) return {};
    return buildPayload({
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      search: debouncedSearch,
      filters,
      columns: option.column,
      defaultPayload: option.defaultPayload,
    });
  }, [
    isServerPaged,
    pageIndex,
    pageSize,
    sortBy,
    sortOrder,
    debouncedSearch,
    filters,
    option.column,
    option.defaultPayload,
  ]);

  const handleFetchSuccess = useCallback(
    (rows: T[], total: number) => {
      callBack?.({
        type: TABLE_EVENT.DATA_LOAD,
        data: { rows, total },
      });
    },
    [callBack]
  );

  const fetchResult = useTableFetch<T>({
    api: option.api,
    payload,
    enabled: isServerPaged,
    onSuccess: handleFetchSuccess,
  });

  // Client Paging Slice for Mode C
  const clientPagedRows = useMemo(() => {
    if (isServerPaged) return [];
    if (option.pagination === false) return clientData.list;
    const start = pageIndex * pageSize;
    return clientData.list.slice(start, start + pageSize);
  }, [isServerPaged, option.pagination, clientData.list, pageIndex, pageSize]);

  // Resolved Rows and Total
  const rows = isServerPaged ? fetchResult.rows : clientPagedRows;
  const total = isServerPaged ? fetchResult.total : clientData.count;
  const isLoading = isServerPaged ? fetchResult.isLoading : false;
  const isRefetching = isServerPaged ? fetchResult.isRefetching : false;
  const error = isServerPaged ? fetchResult.error : null;

  // Selection
  const disabledFn = useMemo(() => {
    if (typeof option.selection === 'object' && option.selection.disabled) {
      return option.selection.disabled;
    }
    return undefined;
  }, [option.selection]);

  const {
    selectedKeys,
    toggleRowSelection,
    toggleAllOnPage,
    clearSelection,
    isAllOnPageSelected,
    isPartiallySelected,
    selectedRows,
  } = useTableSelection(rowKeyExtractor, rows, disabledFn);

  // Event dispatchers for state changes
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.PAGE_CHANGE,
      data: { page: pageIndex, pageSize },
    });
  }, [pageIndex, pageSize, callBack]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    if (sortBy && sortOrder) {
      callBack?.({
        type: TABLE_EVENT.SORT_CHANGE,
        data: { by: sortBy, order: sortOrder },
      });
    }
  }, [sortBy, sortOrder, callBack]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.SEARCH_CHANGE,
      data: debouncedSearch,
    });
  }, [debouncedSearch, callBack]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.FILTER_CHANGE,
      data: filters,
    });
  }, [filters, callBack]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.SELECTION_CHANGE,
      data: { keys: Array.from(selectedKeys), rows: selectedRows },
    });
  }, [selectedKeys, selectedRows, callBack]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    callBack?.({
      type: TABLE_EVENT.VISIBILITY_CHANGE,
      data: visibilityMap,
    });
  }, [visibilityMap, callBack]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    callBack?.({ type: TABLE_EVENT.FILTERS_CLEARED });
  }, [clearFilters, callBack]);

  return {
    rows,
    total,
    isLoading,
    isRefetching,
    error,
    reload: fetchResult.reload,

    pageIndex,
    pageSize,
    totalPages,
    setPageIndex,
    setPageSize,

    sortBy,
    sortOrder,
    toggleSort,

    searchValue,
    setSearchValue,

    filters,
    setFilter,
    clearFilters: handleClearFilters,
    activeFilterCount,

    selectedKeys,
    toggleRowSelection,
    toggleAllOnPage,
    clearSelection,
    isAllOnPageSelected,
    isPartiallySelected,
    selectedRows,

    visibleColumns,
    allColumns,
    toggleColumnVisibility,
    columnWidths,
    setColumnWidth,
  };
}
