"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock3, Loader2, RotateCcw } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";
import { productRequestApi, type ProductRequest, type ProductRequestStatus } from "@/lib/api/product-request.api";

interface ProductRequestStatusButtonProps {
  productId: string;
  variantId?: string | null;
  onRequest: () => void;
  className?: string;
  showWhenNoRequest?: boolean;
}

function findMatchingRequest(
  requests: ProductRequest[],
  productId: string,
  variantId?: string | null,
) {
  return requests.find((request) =>
    request.productId === productId &&
    (request.variantId ?? null) === (variantId ?? null) &&
    (request.status === "PENDING" || request.status === "APPROVED")
  ) ?? null;
}

const buttonCopy: Record<ProductRequestStatus, { label: string; detail: string; icon: typeof CheckCircle2 }> = {
  PENDING: { label: "Request Submitted", detail: "Our team is reviewing your request", icon: Clock3 },
  APPROVED: { label: "Check Availability", detail: "Your request has been approved", icon: CheckCircle2 },
  REJECTED: { label: "View Request Update", detail: "There is an update to your request", icon: AlertCircle },
  FULFILLED: { label: "View Request", detail: "Your request has been fulfilled", icon: CheckCircle2 },
  CANCELLED: { label: "Request Product", detail: "Submit a new request", icon: RotateCcw },
  CLOSED: { label: "Available again", detail: "This product became available again", icon: CheckCircle2 },
};

export function ProductRequestStatusButton({
  productId,
  variantId,
  onRequest,
  className = "",
  showWhenNoRequest = false,
}: ProductRequestStatusButtonProps) {
  const router = useRouter();
  const { user, openModal } = useAuthModal();

  const requestQuery = useQuery({
    queryKey: ["my-product-requests"],
    queryFn: () => productRequestApi.getMyRequests({ page: 1, limit: 50 }),
    enabled: Boolean(user),
    staleTime: 15_000,
    refetchInterval: user ? 30_000 : false,
    refetchOnWindowFocus: true,
  });

  const request = findMatchingRequest(
    requestQuery.data?.data?.requests ?? [],
    productId,
    variantId,
  );
  const isLoading = Boolean(user) && requestQuery.isLoading;
  if (!request && !showWhenNoRequest) return null;

  const meta = request ? buttonCopy[request.status] : null;
  const Icon = meta?.icon ?? AlertCircle;

  const handleClick = () => {
    if (!user) {
      openModal("login");
      return;
    }
    if (request) {
      router.push(`/my-account/product-requests?requestId=${encodeURIComponent(request.id)}`);
      return;
    }
    onRequest();
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || requestQuery.isError}
        aria-busy={isLoading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all disabled:cursor-wait disabled:opacity-60 ${className || (request ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "brand-button")}`}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
        {isLoading ? "Checking request..." : meta?.label ?? "Request Product"}
      </button>
      {request && meta && (
        <p className="mt-1.5 text-center text-[11px] text-gray-500" aria-live="polite">
          {meta.detail}
          {request.estimatedAvailability && request.status === "APPROVED"
            ? ` · Est. ${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(request.estimatedAvailability))}`
            : ""}
        </p>
      )}
      {requestQuery.isError && (
        <button type="button" onClick={() => requestQuery.refetch()} className="mt-1 w-full text-center text-xs text-red-600">
          Couldn't check request status. Retry
        </button>
      )}
    </div>
  );
}
