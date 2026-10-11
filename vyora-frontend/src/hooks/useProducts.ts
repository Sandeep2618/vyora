import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ProductListParams } from '../api/products';
import { ProductInput } from '../types';
import { toast } from '../components/ui/Toast';

export const useProducts = (params: ProductListParams = {}) => {
  return useQuery({
    queryKey: ['products', params.search, params.lowStockOnly, params.skip, params.limit],
    queryFn: () => productsApi.list(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: Boolean(id),
  });
};

export const useCreateProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductInput) => productsApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Product Added', `Product "${res.name}" was successfully added to your catalog.`);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Add Product', err?.response?.data?.message || err?.message || 'Could not save product.');
    },
  });
};

export const useUpdateProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductInput }) => productsApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Product Updated', `Product "${res.name}" was successfully updated.`);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Update Product', err?.response?.data?.message || err?.message || 'Could not update product.');
    },
  });
};

export const useDeleteProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Product Removed', 'The item has been deleted from your inventory.');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Delete Product', err?.response?.data?.message || err?.message || 'Could not delete product.');
    },
  });
};
