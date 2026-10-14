import { ITableColumn } from '../../config/interface';
import { getValueByPath } from '../column';

export interface IClientPipelineParams<T = any> {
  data: T[];
  search?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pageIndex: number;
  pageSize: number;
  columns: ITableColumn<T>[];
  paginationEnabled?: boolean;
}

export function applyClientPipeline<T = any>(
  params: IClientPipelineParams<T>
): { list: T[]; count: number } {
  const {
    data = [],
    search = '',
    filters = {},
    sortBy,
    sortOrder = 'asc',
    pageIndex = 0,
    pageSize = 10,
    columns = [],
    paginationEnabled = true,
  } = params;

  let result = [...data];

  // 1. Search Filter
  const trimmedSearch = search.trim().toLowerCase();
  if (trimmedSearch) {
    const searchableColumns = columns.filter(
      (c) => c.searchable !== false && c.dataIndex !== 'action'
    );

    result = result.filter((row) => {
      return searchableColumns.some((col) => {
        const val = getValueByPath(row, col.dataIndex);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(trimmedSearch);
      });
    });
  }

  // 2. Column / Advanced Filters
  for (const [key, filterVal] of Object.entries(filters)) {
    if (
      filterVal === undefined ||
      filterVal === null ||
      filterVal === '' ||
      (Array.isArray(filterVal) && filterVal.length === 0)
    ) {
      continue;
    }

    result = result.filter((row) => {
      const rowVal = getValueByPath(row, key);
      if (rowVal === null || rowVal === undefined) return false;

      if (Array.isArray(filterVal)) {
        return filterVal.includes(rowVal);
      }

      if (typeof filterVal === 'boolean') {
        return rowVal === filterVal;
      }

      if (typeof filterVal === 'number') {
        return Number(rowVal) === filterVal;
      }

      return String(rowVal).toLowerCase().includes(String(filterVal).toLowerCase());
    });
  }

  // 3. Sorting
  if (sortBy) {
    result.sort((a, b) => {
      const aVal = getValueByPath(a, sortBy);
      const bVal = getValueByPath(b, sortBy);

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  const count = result.length;

  // 4. Pagination
  if (!paginationEnabled) {
    return { list: result, count };
  }

  const start = pageIndex * pageSize;
  const list = result.slice(start, start + pageSize);

  return { list, count };
}
