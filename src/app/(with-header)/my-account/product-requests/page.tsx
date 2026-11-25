"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CalendarDays, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { productRequestApi, type ProductRequest, type ProductRequestStatus } from "@/lib/api/product-request.api";

const statusMeta: Record<ProductRequestStatus, { label: string; className: string; description: string }> = {
  PENDING: { label: "Under review", className: "bg-amber-50 text-amber-800 border-amber-200", description: "Our team is reviewing your request." },
  APPROVED: { label: "Approved", className: "bg-green-50 text-green-800 border-green-200", description: "Your request has been approved." },
  REJECTED: { label: "Not approved", className: "bg-red-50 text-red-800 border-red-200", description: "Our team could not approve this request." },
  FULFILLED: { label: "Fulfilled", className: "bg-blue-50 text-blue-800 border-blue-200", description: "This request has been fulfilled." },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-700 border-gray-200", description: "This request was cancelled." },
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function RequestCard({ request, onCancel, cancelling, highlighted }: { request: ProductRequest; onCancel: (id: string) => void; cancelling: boolean; highlighted: boolean }) {
  const meta = statusMeta[request.status];
  const variant = [request.variant?.size, request.variant?.color, request.variant?.fabric].filter(Boolean).join(" / ");

  return (
    <article id={"product-request-" + request.id} className={"rounded-2xl border bg-white p-4 sm:p-5 shadow-sm " + (highlighted ? "border-emerald-400 ring-2 ring-emerald-100" : "border-gray-200")}>
      <div className="flex gap-4">
        {request.product.media?.[0]?.url ? (
          <img src={request.product.media[0].url} alt={request.product.name} className="h-20 w-20 rounded-xl object-cover bg-gray-100" />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center"><Package className="h-7 w-7 text-gray-400" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{request.product.name}</p>
              {variant && <p className="mt-1 text-xs text-gray-500">{variant}</p>}
              <p className="mt-1 text-xs text-gray-500">Request {request.requestNumber}</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">{meta.description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
        <div className="text-sm">
          <p className="text-xs text-gray-500">Submitted</p>
          <p className="mt-1 font-medium text-gray-800">{formatDate(request.createdAt) || "—"}</p>
        </div>
        {request.estimatedAvailability && (
          <div className="text-sm">
            <p className="flex items-center gap-1 text-xs text-gray-500"><CalendarDays className="h-3.5 w-3.5" /> Estimated availability</p>
            <p className="mt-1 font-medium text-gray-800">{formatDate(request.estimatedAvailability)}</p>
          </div>
        )}
      </div>

      {request.customerNote && <div className="mt-3 rounded-xl bg-gray-50 p-3"><p className="text-xs font-semibold text-gray-500">Your message</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{request.customerNote}</p></div>}
      {request.adminNote && (
        <div className={`mt-3 rounded-xl border p-3 ${request.status === "REJECTED" ? "border-red-100 bg-red-50" : "border-green-100 bg-green-50"}`}>
          <p className="flex items-center gap-2 text-xs font-semibold text-gray-700"><AlertCircle className="h-4 w-4" /> Update from Kankana Silks</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{request.adminNote}</p>
        </div>
      )}

      {request.status === "PENDING" && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => onCancel(request.id)} disabled={cancelling} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {cancelling ? "Cancelling…" : "Cancel request"}
          </button>
        </div>
      )}
    </article>
  );
}

export default function ProductRequestsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const highlightedRequestId = searchParams.get("requestId");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-product-requests"],
    queryFn: () => productRequestApi.getMyRequests({ page: 1, limit: 50 }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => productRequestApi.cancelRequest(id),
    onSuccess: () => {
      toast.success("Request cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-product-requests"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Unable to cancel request"),
  });

  const requests = data?.data?.requests ?? [];

  return (
    <div className="space-y-5 p-4 lg:p-0">
      <div>
        <h1 className="text-2xl font-futura-bold text-gray-900">Product Requests</h1>
        <p className="mt-1 text-sm text-gray-600">Track the status and updates for products you have requested.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl bg-white p-12 text-gray-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading your requests…</div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <p className="text-sm text-gray-700">We couldn't load your product requests.</p>
          <button onClick={() => refetch()} className="mt-3 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">Try again</button>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-3 font-semibold text-gray-900">No product requests yet</h2>
          <p className="mt-1 text-sm text-gray-500">When you request an unavailable product, its updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="rounded-full bg-gray-100 px-3 py-1">{requests.length} requests</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">{requests.filter((r) => r.status === "PENDING").length} under review</span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-green-800">{requests.filter((r) => r.status === "APPROVED").length} approved</span>
          </div>
          {requests.map((request) => <RequestCard key={request.id} request={request} onCancel={(id) => cancelMutation.mutate(id)} cancelling={cancelMutation.isPending && cancelMutation.variables === request.id} highlighted={request.id === highlightedRequestId} />)}
        </div>
      )}
    </div>
  );
}
