// src/hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "@/lib/api/addresses.api";
import type {
  CreateAddressDTO,
  UpdateAddressDTO,
} from "@/lib/api/addresses.api";
import { toast } from "sonner";
import { useAuthModal } from "@/store/useAuthModalStore";
import { addressKeys, addressQueryPolicy } from "@/lib/query/addressQuery";

export { addressKeys } from "@/lib/query/addressQuery";

// Query keys and freshness are shared with checkout and the global header.

// Get all addresses
export function useAddresses() {
  const { user } = useAuthModal();

  return useQuery({
    queryKey: addressKeys.user(user?.id),
    queryFn: async () => (await addressApi.getAddresses()).data,
    enabled: !!user,
    ...addressQueryPolicy,
    placeholderData: [],
  });
}

// Get default address
export function useDefaultAddress(enabled = true) {
  return useQuery({
    queryKey: addressKeys.default(),
    queryFn: () => addressApi.getDefaultAddress(),
    enabled,
    staleTime: 60000,
  });
}

// Get single address
export function useAddress(id: string, enabled = true) {
  return useQuery({
    queryKey: addressKeys.detail(id),
    queryFn: () => addressApi.getAddress(id),
    enabled: enabled && !!id,
  });
}

// Create address mutation
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressDTO) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      queryClient.invalidateQueries({ queryKey: addressKeys.default() });
      toast.success("Address added successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add address");
    },
  });
}

// Update address mutation
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressDTO }) =>
      addressApi.updateAddress(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      queryClient.invalidateQueries({
        queryKey: addressKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: addressKeys.default() });
      toast.success("Address updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update address");
    },
  });
}

// Set as default mutation
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressApi.setAsDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      queryClient.invalidateQueries({ queryKey: addressKeys.default() });
      toast.success("Default address updated!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to set default address"
      );
    },
  });
}

// Delete address mutation
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      queryClient.invalidateQueries({ queryKey: addressKeys.default() });
      toast.success("Address deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete address");
    },
  });
}
