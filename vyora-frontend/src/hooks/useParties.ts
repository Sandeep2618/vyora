import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partiesApi, PartyListParams } from '../api/parties';
import { PartyInput } from '../types';
import { toast } from '../components/ui/Toast';

export const useParties = (params: PartyListParams = {}) => {
  return useQuery({
    queryKey: ['parties', params.type, params.search, params.skip, params.limit],
    queryFn: () => partiesApi.list(params),
  });
};

export const useCreateParty = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PartyInput) => partiesApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast.success(
        `${res.type === 'CUSTOMER' ? 'Customer' : 'Supplier'} Added`,
        `"${res.name}" was successfully added.`
      );
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Add Party', err?.response?.data?.message || err?.message || 'Could not save party details.');
    },
  });
};

export const useUpdateParty = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartyInput }) => partiesApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast.success(
        `${res.type === 'CUSTOMER' ? 'Customer' : 'Supplier'} Updated`,
        `"${res.name}" was successfully updated.`
      );
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Update Party', err?.response?.data?.message || err?.message || 'Could not update party details.');
    },
  });
};

export const useDeleteParty = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast.success('Party Removed', 'The party has been deleted.');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error('Failed to Delete Party', err?.response?.data?.message || err?.message || 'Could not delete party.');
    },
  });
};

