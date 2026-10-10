import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partiesApi, PartyListParams } from '../api/parties';
import { PartyInput } from '../types';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      if (onSuccess) onSuccess();
    },
  });
};
