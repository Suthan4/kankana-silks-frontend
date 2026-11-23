"use client";

import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/hooks/useOrders";
import { shipmentApi } from "@/lib/api/shipment.api";
import { useTracking } from "@/hooks/useTracking";
import { OrderTrackingPageSkeleton } from "@/features/orders/components/OrderPageSkeletons";
import SmartImage from "@/components/common/smartImage";
import { ShipmentTimeline } from "@/features/orders/components/ShipmentTimeline";

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useOrder(id);
  const trackingNumber = orderData?.data?.shipment?.trackingNumber;

  const {
    data: trackingData,
    isLoading: trackingLoading,
    error: trackingError,
    refetch: refetchTracking,
  } = useTracking(trackingNumber);

  const order = orderData?.data;
  const tracking = trackingData?.data;

  const isLoading = orderLoading || trackingLoading;

  // Build timeline from tracking activities or default statuses
  const buildTimeline = () => {
    if (
      tracking &&
      tracking?.tracking_data?.shipment_track_activities?.length > 0
    ) {
      return tracking?.tracking_data.shipment_track_activities.map(
        (activity: any) => ({
          status: activity.status,
          date: new Date(activity.date).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: activity.location,
          activity: activity.activity,
          completed: true,
        }),
      );
    }

    // Default timeline if no tracking data
    const defaultTimeline = [
      {
        status: "Order Placed",
        date: order?.createdAt
          ? new Date(order.createdAt).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        completed: true,
      },
      {
        status: "Payment Confirmed",
        date: order?.payment?.status === "SUCCESS" ? "Confirmed" : "Pending",
        completed: order?.payment?.status === "SUCCESS",
      },
      {
        status: "Processing",
        date:
          order?.status === "PROCESSING" ||
          order?.status === "SHIPPED" ||
          order?.status === "DELIVERED"
            ? "In Progress"
            : "Pending",
        completed:
          order?.status === "PROCESSING" ||
          order?.status === "SHIPPED" ||
          order?.status === "DELIVERED",
      },
      {
        status: "Shipped",
        date: order?.shipment?.shippedAt
          ? new Date(order.shipment.shippedAt).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : order?.shipment?.estimatedDelivery
            ? `Expected ${new Date(
                order.shipment.estimatedDelivery,
              ).toLocaleDateString()}`
            : "Expected Soon",
        completed: order?.status === "SHIPPED" || order?.status === "DELIVERED",
        active: order?.status === "SHIPPED",
      },
      {
        status: "Out for Delivery",
        date: order?.shipment?.estimatedDelivery
          ? `Expected ${new Date(
              order.shipment.estimatedDelivery,
            ).toLocaleDateString()}`
          : "Pending",
        completed: false,
      },
      {
        status: "Delivered",
        date: order?.shipment?.deliveredAt
          ? new Date(order.shipment.deliveredAt).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : order?.shipment?.estimatedDelivery
            ? `Expected ${new Date(
                order.shipment.estimatedDelivery,
              ).toLocaleDateString()}`
            : "Pending",
        completed: order?.status === "DELIVERED",
      },
    ];

    return defaultTimeline;
  };

  const timeline = useMemo(() => buildTimeline(), [tracking, order]);
  const statusInfo = shipmentApi.formatTrackingStatus(
    order?.status || "processing",
  );

  if (isLoading) return <OrderTrackingPageSkeleton />;

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-red-500 text-lg font-medium">
            {orderError ? "Unable to load this order" : "Order not found"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {orderError && (
              <button
                type="button"
                onClick={() => void refetchOrder()}
                className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentShipmentTrack = tracking?.tracking_data?.shipment_track?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-semibold">Track Order</h1>
              <p className="text-sm text-gray-500">#{order.orderNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Estimated Delivery */}
        <div
          className={`bg-gradient-to-br ${
            order.status === "DELIVERED"
              ? "from-green-500 to-emerald-600"
              : order.status === "SHIPPED"
                ? "from-blue-500 to-indigo-600"
                : "from-orange-500 to-amber-600"
          } text-white rounded-2xl p-6`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm opacity-90 mb-1">
                {order.status === "DELIVERED"
                  ? "DELIVERED"
                  : "ESTIMATED DELIVERY"}
              </p>
              <h2 className="text-2xl font-futura-bold">
                {order.shipment?.deliveredAt
                  ? new Date(order.shipment.deliveredAt).toLocaleDateString(
                      "en-IN",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )
                  : order.shipment?.estimatedDelivery
                    ? new Date(
                        order.shipment.estimatedDelivery,
                      ).toLocaleDateString("en-IN", {
                        month: "long",
                        day: "numeric",
                      })
                    : "Processing"}
              </h2>
              {currentShipmentTrack?.edd && !order.shipment?.deliveredAt && (
                <p className="text-sm mt-1 opacity-90">
                  by {new Date(currentShipmentTrack.edd).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              {order.status === "DELIVERED" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Truck className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        {/* Tracking Number & Courier */}
        {order.shipment?.trackingNumber && (
          <div className="bg-white rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Tracking Number
                </label>
                <p className="font-futura-bold text-lg">
                  {order.shipment.trackingNumber}
                </p>
              </div>
              {order.shipment.courierName && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Courier Service
                  </label>
                  <p className="font-futura-bold text-lg">
                    {order.shipment.courierName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Status */}
        {currentShipmentTrack && (
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">CURRENT STATUS</p>
                <p className="font-futura-bold text-lg">
                  {currentShipmentTrack.current_status}
                </p>
              </div>
            </div>
            {currentShipmentTrack.destination && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Destination: {currentShipmentTrack.destination}</span>
              </div>
            )}
          </div>
        )}

        {trackingError && trackingNumber && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
          >
            <p className="text-sm text-amber-900">
              Live tracking could not be refreshed. The order status below is
              still available.
            </p>
            <button
              type="button"
              onClick={() => void refetchTracking()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry tracking
            </button>
          </div>
        )}

        <ShipmentTimeline items={timeline} isLoading={trackingLoading} />

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">
              {order.shippingAddress.addressLine1}
            </p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-gray-600">
                {order.shippingAddress.addressLine2}
              </p>
            )}
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
            </p>
            <div className="pt-2 flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{order.shippingAddress.phone}</span>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Items in this Order</h3>
          <div className="space-y-3">
            {order.items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {item.image && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <SmartImage
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
