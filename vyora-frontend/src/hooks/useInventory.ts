import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, MovementListParams, StockAdjustmentInput } from '../api/inventory';

export const useInventoryMovements = (params: MovementListParams = {}) => {
  return useQuery({
    queryKey: ['inventory-movements', params.productId, params.skip, params.limit],
    queryFn: () => inventoryApi.getMovements(params),
  });
};

export const useStockAdjustment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: StockAdjustmentInput) => inventoryApi.createAdjustment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      if (onSuccess) onSuccess();
    },
  });
};
