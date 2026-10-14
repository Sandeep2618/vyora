import { ITableColumn } from '../../config/interface';
import { getValueByPath } from '../column';

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If string contains quotes, commas, or newlines, wrap in quotes and escape quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportToCsv<T = any>(
  columns: ITableColumn<T>[],
  rows: T[],
  filename = 'export.csv'
): void {
  const exportableColumns = columns.filter(
    (col) => col.dataIndex !== 'action' && !col.hidden
  );

  const headers = exportableColumns.map((col) => escapeCsvCell(col.title)).join(',');

  const lines = rows.map((row) => {
    return exportableColumns
      .map((col) => {
        let val: any;
        if (col.exportValue) {
          val = col.exportValue(row);
        } else {
          val = getValueByPath(row, col.dataIndex);
        }
        return escapeCsvCell(val);
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
