import { useState, useEffect, useMemo } from 'react';
import { Invoice } from '../../../../../../types';
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENT_PAGE } from '../config/constant';

export interface UseInvoiceTableOptions {
  invoices: Invoice[];
  hasActiveFilters?: boolean;
  initialPageSize?: number;
}

export const useInvoiceTable = ({
  invoices,
  hasActiveFilters,
  initialPageSize = DEFAULT_PAGE_SIZE,
}: UseInvoiceTableOptions) => {
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, [invoices.length, hasActiveFilters]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return invoices.slice(start, start + pageSize);
  }, [invoices, currentPage, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedInvoices,
  };
};
