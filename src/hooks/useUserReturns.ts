import { ReturnApiService, ReturnStatus } from "@/lib/api/return.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Get user's returns list
export function useUserReturns(params?: {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
}) {
  return useQuery({
    queryKey: ["returns", "user", params],
    queryFn: () => ReturnApiService.getUserReturns(params),
  });
}

// Get single return details
export function useReturn(returnId: string) {
  return useQuery({
    queryKey: ["returns", returnId],
    queryFn: () => ReturnApiService.getReturn(returnId),
    enabled: !!returnId,
  });
}

// Create return mutation
export function useCreateReturn() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ReturnApiService.createReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    createReturn: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}