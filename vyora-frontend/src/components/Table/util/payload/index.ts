import { ITableColumn } from '../../config/interface';

export function buildPayload(params: {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  columns: ITableColumn[];
  defaultPayload?: Record<string, any>;
}) {
  const {
    pageIndex,
    pageSize,
    sortBy,
    sortOrder,
    search,
    filters = {},
    columns,
    defaultPayload = {},
  } = params;

  // Searchable columns for global filter
  const globalFilterFields = columns
    .filter((col) => col.searchable !== false && col.dataIndex !== 'action')
    .map((col) => ({ field: col.dataIndex }));

  // Advance filters translation
  const advanceFilters: Array<{ field: string; operator: string; value: any }> = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      continue;
    }

    const col = columns.find((c) => c.dataIndex === key);
    const fieldName = col?.filter?.apiField || key;

    let operator = 'eq';
    if (Array.isArray(value)) {
      operator = 'in';
    } else if (typeof value === 'string' && col?.filter?.editor === 'text') {
      operator = 'contains';
    }

    advanceFilters.push({
      field: fieldName,
      operator,
      value,
    });
  }

  const payload: Record<string, any> = {
    // 0-based to 1-based wire standard
    page_index: pageIndex + 1,
    page_size: pageSize,
    // Backend standard compatibility: also populate limit & skip
    limit: pageSize,
    skip: pageIndex * pageSize,
  };

  if (sortBy) {
    payload.sort_by = sortBy;
    payload.sort_order = sortOrder || 'asc';
  }

  if (search && search.trim()) {
    payload.global_value = search.trim();
    payload.search = search.trim();
    if (globalFilterFields.length > 0) {
      payload.global_filter = globalFilterFields;
    }
  }

  if (advanceFilters.length > 0) {
    payload.advance_filters = advanceFilters;
  }

  // Merge default payload without overwriting core paging parameters
  for (const [k, v] of Object.entries(defaultPayload)) {
    if (payload[k] === undefined) {
      payload[k] = v;
    }
  }

  return payload;
}

export function parseResponse<T = any>(raw: any): { list: T[]; count: number } {
  if (!raw) {
    return { list: [], count: 0 };
  }

  // 1. Bare array: [...]
  if (Array.isArray(raw)) {
    return { list: raw, count: raw.length };
  }

  // 2. Direct { list, count }
  if (Array.isArray(raw.list)) {
    return { list: raw.list, count: typeof raw.count === 'number' ? raw.count : raw.list.length };
  }

  // 3. Direct { items, total }
  if (Array.isArray(raw.items)) {
    return { list: raw.items, count: typeof raw.total === 'number' ? raw.total : raw.items.length };
  }

  // 4. Nested under data: { data: { list, count } } or { data: { items, total } }
  if (raw.data) {
    if (Array.isArray(raw.data)) {
      return { list: raw.data, count: raw.data.length };
    }
    if (Array.isArray(raw.data.list)) {
      return {
        list: raw.data.list,
        count: typeof raw.data.count === 'number' ? raw.data.count : raw.data.list.length,
      };
    }
    if (Array.isArray(raw.data.items)) {
      return {
        list: raw.data.items,
        count: typeof raw.data.total === 'number' ? raw.data.total : raw.data.items.length,
      };
    }
  }

  console.warn('[Table] Unexpected response structure, returned empty list:', raw);
  return { list: [], count: 0 };
}
