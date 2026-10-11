import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, InvoiceListParams } from '../api/invoices';
import { CreateInvoiceInput } from '../types';
import { toast } from '../components/ui/Toast';

export const useInvoices = (params: InvoiceListParams = {}) => {
  return useQuery({
    queryKey: ['invoices', params.status, params.search, params.skip, params.limit],
    queryFn: () => invoicesApi.list(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getById(id),
    enabled: Boolean(id),
  });
};

export const useCreateInvoice = (onSuccess?: (id: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceInput) => invoicesApi.create(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Invoice Created', `Invoice #${data.invoiceNumber} created as draft.`);
      if (onSuccess) onSuccess(data.id);
    },
    onError: (err: any) => {
      toast.error('Failed to Create Invoice', err?.response?.data?.message || err?.message || 'Could not generate invoice.');
    },
  });
};

export const useFinalizeInvoice = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.finalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Invoice Finalized', 'Stock committed and ledger balance updated.');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Finalize Invoice', err?.response?.data?.message || err?.message || 'Could not finalize invoice.');
    },
  });
};

export const useCancelInvoice = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      invoicesApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Invoice Cancelled', 'Stock restored and ledger balance reversed.');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Cancel Invoice', err?.response?.data?.message || err?.message || 'Could not cancel invoice.');
    },
  });
};
