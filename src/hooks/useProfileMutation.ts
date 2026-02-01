import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/api.base.service";
import { toast } from "sonner";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useRouter } from "next/navigation";

// Types
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Fetch Profile Hook (runs on component mount)
export function useFetchProfile() {
  const { setUser, user: currentUser } = useAuthModal();

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await authService.getProfile();
      setUser(response.data.data);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!currentUser, // Only fetch if user is logged in
    retry: 1
  });
}

// Update Profile Hook
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user: currentUser, setUser } = useAuthModal();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      // Get current data from server for comparison
      const currentProfile = queryClient.getQueryData<any>(["user-profile"]) || currentUser;

      // Check if data is the same
      const isSameData =
        currentProfile?.firstName === data.firstName.trim() &&
        currentProfile?.lastName === data.lastName.trim() &&
        (currentProfile?.phone || "") === (data.phone?.trim() || "");

      if (isSameData) {
        throw new Error("NO_CHANGES");
      }

      return authService.updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || undefined,
      });
    },
    onSuccess: (response, variables) => {
      if (response.data.success) {
        const updatedUser = response.data.data;

        // Update store with server response
        setUser(updatedUser);

        // Update query cache
        queryClient.setQueryData(["user-profile"], updatedUser);

        // Invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });

        toast.success("Profile updated successfully!");
      }
    },
    onError: (error: any) => {
      if (error.message === "NO_CHANGES") {
        toast.error("No changes detected. Data is the same as current profile.");
        return;
      }

      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    },
  });
}

// Change Password Hook
export function useChangePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      return authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password changed successfully! Please login again.");

      // Clear all queries
      queryClient.clear();

      // Logout user after 2 seconds
      setTimeout(() => {
        authService.logout();
        router.push("/");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    },
  });
}