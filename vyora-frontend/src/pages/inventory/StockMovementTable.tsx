import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';

export interface MovementItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  movementType: string;
  quantityDelta: number;
  resultingStock: number;
  reason?: string;
  referenceType?: string;
  createdAt: string;
}

interface StockMovementTableProps {
  movements: MovementItem[];
  isLoading: boolean;
  canAdjust?: boolean;
  onOpenAdjustment: () => void;
}

export const StockMovementTable: React.FC<StockMovementTableProps> = ({
  movements,
  isLoading,
  canAdjust = true,
  onOpenAdjustment,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedMovements = movements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const getMovementBadge = (type: string, delta: number) => {
    switch (type) {
      case 'PURCHASE':
      case 'OPENING':
      case 'ADJUSTMENT_IN':
      case 'SALE_CANCEL':
        return <Badge variant="success">+{delta}</Badge>;
      case 'SALE':
      case 'ADJUSTMENT_OUT':
      case 'PURCHASE_CANCEL':
        return <Badge variant="overdue">{delta}</Badge>;
      default:
        return <Badge variant="neutral">{delta > 0 ? `+${delta}` : delta}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading stock movement history...
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        title="No stock movements recorded"
        description="All sales, purchases, and manual adjustments create an immutable audit trail here."
        actionLabel={canAdjust ? "Record Adjustment" : undefined}
        onAction={canAdjust ? onOpenAdjustment : undefined}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] bg-white overflow-hidden shadow-sm">
        <Table className="min-w-[700px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-center">Movement Type</TableHead>
              <TableHead className="text-center">Change</TableHead>
              <TableHead className="text-center">Resulting Stock</TableHead>
              <TableHead>Reason / Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMovements.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-[#566B69]">
                  {new Date(m.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="font-bold text-[#123B3A]">{m.productName}</TableCell>
                <TableCell className="font-mono font-semibold text-[#0F766E]">{m.sku}</TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold text-[#123B3A] text-[11px]">
                    {m.movementType}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {getMovementBadge(m.movementType, m.quantityDelta)}
                </TableCell>
                <TableCell className="text-center font-bold text-[#123B3A]">
                  {m.resultingStock} {m.unit}
                </TableCell>
                <TableCell className="text-[#566B69] italic max-w-xs truncate">
                  {m.reason || m.referenceType || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={movements.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};
