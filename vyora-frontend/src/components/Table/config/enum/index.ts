export enum TABLE_EVENT {
  // State changes
  PAGE_CHANGE = 'PAGE_CHANGE',
  SORT_CHANGE = 'SORT_CHANGE',
  FILTER_CHANGE = 'FILTER_CHANGE',
  FILTERS_CLEARED = 'FILTERS_CLEARED',
  SEARCH_CHANGE = 'SEARCH_CHANGE',
  SELECTION_CHANGE = 'SELECTION_CHANGE',
  VISIBILITY_CHANGE = 'VISIBILITY_CHANGE',
  WIDTHS_CHANGE = 'WIDTHS_CHANGE',
  PINNING_CHANGE = 'PINNING_CHANGE',
  ORDER_CHANGE = 'ORDER_CHANGE',
  VIEW_CHANGE = 'VIEW_CHANGE',
  DEFAULTS_RESET = 'DEFAULTS_RESET',

  // Data settlement
  DATA_LOAD = 'DATA_LOAD',

  // Row interactions
  ROW_CLICK = 'ROW_CLICK',
  ROW_DOUBLE_CLICK = 'ROW_DOUBLE_CLICK',

  // Actions
  ACTION_TRIGGER = 'ACTION_TRIGGER',

  // Export
  EXPORT_START = 'EXPORT_START',
}

export enum DISPLAY_TYPE {
  TEXT = 'text',
  NUMBER = 'number',
  CURRENCY = 'currency',
  DATE = 'date',
  DATETIME = 'datetime',
  TAG = 'tag',
  BADGE = 'badge',
  LINK = 'link',
  PROFILE = 'profile',
}

export enum FILTER_OPERATOR {
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  NOT_IN = 'notIn',
  BETWEEN = 'between',
  EQ = 'eq',
  NEQ = 'neq',
  LT = 'lt',
  LTE = 'lte',
  GT = 'gt',
  GTE = 'gte',
  IN = 'in',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

export enum PREFERENCE_SCOPE {
  LOCAL = 'local',
  SESSION = 'session',
  MEMORY = 'memory',
}
