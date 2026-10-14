import React from 'react';
import { TABLE_EVENT, DISPLAY_TYPE, FILTER_OPERATOR } from '../enum';

export interface ITableServiceRequest {
  method?: string;
  url: string;
  data?: any;
  params?: any;
}

export interface IColumnFilter {
  editor: 'select' | 'multiSelect' | 'text' | 'number' | 'date' | 'dateRange' | 'boolean';
  options?: Array<{ label: string; value: any }>;
  apiField?: string;
  default?: boolean;
  includeInGlobalSearch?: boolean;
}

export interface IRowAction<T> {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface IColumnAction<T> {
  edit?: boolean | ((row: T) => boolean);
  delete?: boolean | ((row: T) => boolean);
  view?: boolean | ((row: T) => boolean);
  custom?: IRowAction<T>[];
}

export interface ITableColumn<T = any> {
  dataIndex: string;
  title: string;
  displayType?: DISPLAY_TYPE | `${DISPLAY_TYPE}`;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  resizable?: boolean;
  canHide?: boolean;
  alwaysVisible?: boolean;
  hidden?: boolean;
  copyable?: boolean;
  truncate?: boolean;
  exportValue?: (row: T) => any;
  filter?: IColumnFilter;
  action?: IColumnAction<T>;
}

export interface IBulkAction<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick?: (selectedKeys: string[], selectedRows: T[]) => void;
}

export interface ITableOption<T = any> {
  module: string;
  rowKey: string | ((row: T) => string);
  column: ITableColumn<T>[];

  // Data Mode A: Backend-paged
  api?: {
    url: string;
    method?: 'GET' | 'POST';
    service?: (request: ITableServiceRequest) => Promise<any>;
    responseAdapter?: (raw: any) => { list: T[]; count: number };
  };

  // Data Mode C: Client-side memory array
  data?: T[];

  defaultPayload?: Record<string, any>;
  pagination?: false | {
    defaultPageSize?: number;
    pageSizeOptions?: number[];
  };
  defaultSort?: {
    by: string;
    order: 'asc' | 'desc';
  };
  defaultSearch?: string;
  defaultFilter?: Record<string, any>;
  selection?: boolean | {
    mode?: 'single' | 'multiple';
    disabled?: (row: T) => boolean;
    hidden?: (row: T) => boolean;
    noun?: string;
  };
  bulkActions?: IBulkAction<T>[];
  export?: false | {
    allowedScopes?: Array<'current' | 'selected' | 'all'>;
    filename?: string;
    endpoint?: string;
  };
  emptyState?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  filteredEmptyState?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  errorState?: {
    title?: string;
    description?: string;
    retryLabel?: string;
  };
  headerActions?: React.ReactNode;
  stickyHeader?: boolean;
  toolbar?: boolean;
  header?: boolean;
  footer?: boolean;
  search?: boolean | { placeholder?: string };
  refresh?: boolean;
  countPill?: boolean;
  columnSettings?: boolean;
  preference?: boolean;
  isFiltered?: boolean;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
}

export type ITableEvent<T = any> =
  | { type: TABLE_EVENT.PAGE_CHANGE; data: { page: number; pageSize: number } }
  | { type: TABLE_EVENT.SORT_CHANGE; data: { by: string; order: 'asc' | 'desc' } }
  | { type: TABLE_EVENT.FILTER_CHANGE; data: Record<string, any> }
  | { type: TABLE_EVENT.FILTERS_CLEARED }
  | { type: TABLE_EVENT.SEARCH_CHANGE; data: string }
  | { type: TABLE_EVENT.SELECTION_CHANGE; data: { keys: string[]; rows: T[] } }
  | { type: TABLE_EVENT.VISIBILITY_CHANGE; data: Record<string, boolean> }
  | { type: TABLE_EVENT.WIDTHS_CHANGE; data: Record<string, number> }
  | { type: TABLE_EVENT.PINNING_CHANGE; data: { left: string[]; right: string[] } }
  | { type: TABLE_EVENT.DATA_LOAD; data: { rows: T[]; total: number } }
  | { type: TABLE_EVENT.ROW_CLICK; data: { row: T; index: number } }
  | { type: TABLE_EVENT.ROW_DOUBLE_CLICK; data: { row: T; index: number } }
  | { type: TABLE_EVENT.ACTION_TRIGGER; data: { actionId: string; row?: T; rows?: T[]; keys?: string[] } }
  | { type: TABLE_EVENT.EXPORT_START; data: { scope: 'current' | 'selected' | 'all' } }
  | { type: TABLE_EVENT.DEFAULTS_RESET };

export interface ITableHandle {
  reload: () => void;
  clearSelection: () => void;
}

export interface ITableController<T = any> {
  // Data
  rows: T[];
  total: number;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  reload: () => void;

  // Pagination
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  toggleSort: (dataIndex: string) => void;

  // Searching
  searchValue: string;
  setSearchValue: (val: string) => void;

  // Filtering
  filters: Record<string, any>;
  setFilter: (dataIndex: string, value: any) => void;
  clearFilters: () => void;
  activeFilterCount: number;

  // Selection
  selectedKeys: Set<string>;
  toggleRowSelection: (rowKey: string, row: T) => void;
  toggleAllOnPage: (checked: boolean) => void;
  clearSelection: () => void;
  isAllOnPageSelected: boolean;
  isPartiallySelected: boolean;
  selectedRows: T[];

  // Visibility & Pinning
  visibleColumns: ITableColumn<T>[];
  allColumns: ITableColumn<T>[];
  toggleColumnVisibility: (dataIndex: string) => void;
  columnWidths: Record<string, number>;
  setColumnWidth: (dataIndex: string, width: number) => void;
}
