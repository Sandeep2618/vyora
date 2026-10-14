import { useState, useCallback, useMemo, useEffect } from 'react';
import { ITableColumn } from '../../config/interface';
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../../config/constant';

export function useTablePagination(initialPageSize = DEFAULT_PAGE_SIZE, total = 0) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / (pageSize || DEFAULT_PAGE_SIZE)));
  }, [total, pageSize]);

  // If page index exceeds totalPages due to external filter/deletion, adjust safely
  useEffect(() => {
    if (pageIndex >= totalPages && totalPages > 0) {
      setPageIndex(totalPages - 1);
    }
  }, [totalPages, pageIndex]);

  const handleSetPageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0); // reset to page 0 on page size change
  }, []);

  return {
    pageIndex,
    pageSize,
    totalPages,
    setPageIndex,
    setPageSize: handleSetPageSize,
  };
}

export function useTableSort(initialSort?: { by: string; order: 'asc' | 'desc' }) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSort?.by);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(initialSort?.order);

  const toggleSort = useCallback((dataIndex: string) => {
    setSortBy((currBy) => {
      if (currBy !== dataIndex) {
        setSortOrder('asc');
        return dataIndex;
      }
      // Toggle
      setSortOrder((currOrder) => {
        if (currOrder === 'asc') return 'desc';
        if (currOrder === 'desc') {
          // cycle to un-sorted
          return undefined;
        }
        return 'asc';
      });
      return dataIndex;
    });
  }, []);

  // Sync if sortOrder became undefined to clear sortBy
  useEffect(() => {
    if (sortOrder === undefined) {
      setSortBy(undefined);
    }
  }, [sortOrder]);

  return {
    sortBy,
    sortOrder,
    toggleSort,
  };
}

export function useTableSearch(initialSearch = '', debounceMs = SEARCH_DEBOUNCE_MS) {
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs]);

  return {
    searchValue,
    debouncedSearch,
    setSearchValue,
  };
}

export function useTableFilter(initialFilters: Record<string, any> = {}) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const setFilter = useCallback((field: string, value: any) => {
    setFilters((prev) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => {
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
  };
}

export function useTableSelection<T = any>(
  rowKeyExtractor: (row: T) => string,
  rows: T[] = [],
  disabledFn?: (row: T) => boolean
) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const pageKeys = useMemo(() => {
    return rows
      .filter((row) => !disabledFn || !disabledFn(row))
      .map((row) => rowKeyExtractor(row));
  }, [rows, rowKeyExtractor, disabledFn]);

  const toggleRowSelection = useCallback((rowKey: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (checked) {
          pageKeys.forEach((key) => next.add(key));
        } else {
          pageKeys.forEach((key) => next.delete(key));
        }
        return next;
      });
    },
    [pageKeys]
  );

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const isAllOnPageSelected = useMemo(() => {
    if (pageKeys.length === 0) return false;
    return pageKeys.every((key) => selectedKeys.has(key));
  }, [pageKeys, selectedKeys]);

  const isPartiallySelected = useMemo(() => {
    if (pageKeys.length === 0) return false;
    const count = pageKeys.filter((key) => selectedKeys.has(key)).length;
    return count > 0 && count < pageKeys.length;
  }, [pageKeys, selectedKeys]);

  const selectedRows = useMemo(() => {
    return rows.filter((row) => selectedKeys.has(rowKeyExtractor(row)));
  }, [rows, selectedKeys, rowKeyExtractor]);

  return {
    selectedKeys,
    toggleRowSelection,
    toggleAllOnPage,
    clearSelection,
    isAllOnPageSelected,
    isPartiallySelected,
    selectedRows,
  };
}

export function useTableVisibility<T = any>(columns: ITableColumn<T>[]) {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.dataIndex] = col.hidden !== true;
    });
    return initial;
  });

  const toggleColumnVisibility = useCallback((dataIndex: string) => {
    setVisibilityMap((prev) => {
      const col = columns.find((c) => c.dataIndex === dataIndex);
      if (col?.alwaysVisible) return prev;
      return {
        ...prev,
        [dataIndex]: !prev[dataIndex],
      };
    });
  }, [columns]);

  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      if (col.alwaysVisible) return true;
      return visibilityMap[col.dataIndex] !== false;
    });
  }, [columns, visibilityMap]);

  return {
    visibleColumns,
    allColumns: columns,
    visibilityMap,
    toggleColumnVisibility,
  };
}

export function useTableWidths<T = any>(columns: ITableColumn<T>[]) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    columns.forEach((col) => {
      if (typeof col.width === 'number') {
        initial[col.dataIndex] = col.width;
      }
    });
    return initial;
  });

  const setColumnWidth = useCallback((dataIndex: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [dataIndex]: width,
    }));
  }, []);

  return {
    columnWidths,
    setColumnWidth,
  };
}
