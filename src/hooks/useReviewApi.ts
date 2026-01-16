import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/lib/api/review.api";
import { toast } from "@/store/useToastStore";
export type ReviewSortBy = "createdAt" | "rating" | "helpfulCount";

export function useProductReviews(
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: ReviewSortBy;
    sortOrder?: "asc" | "desc";
  }
) {
  return useQuery({
    queryKey: ["reviews", "product", productId, params],
    queryFn: () => reviewApi.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserReviews(params?: {
  page?: number;
  limit?: number;
  sortBy?: ReviewSortBy;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["reviews", "user", params],
    queryFn: () => reviewApi.getUserReviews(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCanReviewProduct(productId: string) {
  return useQuery({
    queryKey: ["reviews", "can-review", productId],
    queryFn: () => reviewApi.canReviewProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["reviews", "user"] });
      queryClient.invalidateQueries({
        queryKey: ["reviews", "can-review", variables.productId],
      });
      toast.success("Review submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: any;
    }) => reviewApi.updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update review");
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.markHelpful,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to mark as helpful");
    },
  });
}

export function useUnmarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.unmarkHelpful,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unmark as helpful");
    },
  });
}