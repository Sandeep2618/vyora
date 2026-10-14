import { DISPLAY_TYPE } from '../../config/enum';
import { formatCurrency, formatDateReadable } from '@/utils';

export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

export function formatCellValue(value: any, displayType?: DISPLAY_TYPE | `${DISPLAY_TYPE}`): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  switch (displayType) {
    case DISPLAY_TYPE.CURRENCY:
      return typeof value === 'number' ? formatCurrency(value) : String(value);

    case DISPLAY_TYPE.DATE:
      return typeof value === 'string' ? formatDateReadable(value) : String(value);

    case DISPLAY_TYPE.DATETIME:
      if (typeof value === 'string') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? value : `${formatDateReadable(value)} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return String(value);

    case DISPLAY_TYPE.NUMBER:
      return typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);

    default:
      return String(value);
  }
}
