import { orderApi } from "@/lib/api/order.api";
import { useQuery } from "@tanstack/react-query";

const useOrderPreview = ({
  selectedAddressId,
  couponCode,
  isBuyNowMode,
  buyNowItem,
  cartItems,
}: {
  selectedAddressId?: string;
  couponCode?: string;
  isBuyNowMode: boolean;
  buyNowItem: any;
  cartItems: any[];
}) => {
  return useQuery({
    queryKey: [
      "order-preview",
      selectedAddressId,
      couponCode,
      isBuyNowMode,
      buyNowItem?.productId,
      buyNowItem?.variantId,
      buyNowItem?.quantity,
      cartItems?.map((i) => `${i.productId}-${i.variantId}-${i.quantity}`).join("|"),
    ],
    queryFn: async () => {
      if (!selectedAddressId) return null;

      const items =
        isBuyNowMode && buyNowItem
          ? [
              {
                productId: buyNowItem.productId,
                variantId: buyNowItem.variantId,
                quantity: buyNowItem.quantity,
              },
            ]
          : undefined;

      const response = await orderApi.getOrderPreview({
        shippingAddressId: selectedAddressId,
        couponCode,
        items,
      });

      return response;
    },
    enabled: !!selectedAddressId,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
  });
};
