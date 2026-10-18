import { Response } from 'express';

export interface CsvColumn<T = any> {
  key?: string;
  header: string;
  format?: (row: T) => any;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return '';
    curr = curr[part];
  }
  return curr ?? '';
}

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function generateCsv<T = any>(columns: CsvColumn<T>[], rows: T[]): string {
  const headers = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const lines = rows.map((row) => {
    return columns
      .map((col) => {
        let val: any;
        if (col.format) {
          val = col.format(row);
        } else if (col.key) {
          val = getNestedValue(row, col.key);
        } else {
          val = '';
        }
        return escapeCsvCell(val);
      })
      .join(',');
  });

  return '\uFEFF' + [headers, ...lines].join('\r\n');
}

export function sendCsvResponse(res: Response, filename: string, csvContent: string): Response {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
}
