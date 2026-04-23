"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartDrawer } from "@/store/useCartDrawer";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { X, ShoppingBag, Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function MiniCartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items: localItems, removeItem: removeItemLocal } = useCartStore();
  const { user } = useAuthModal();
  const router = useRouter();
  const queryClient = useQueryClient();

  /* -------------------- MOBILE DETECTION -------------------- */
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* -------------------- FETCH CART -------------------- */
  const { data: cartData } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
  });

  const apiItems = cartData?.items ?? [];
  const displayItems = user ? apiItems : localItems;

  const lastAdded = displayItems[displayItems.length - 1] ?? null;
  const otherItems = displayItems.slice(0, -1);

  const subtotal = displayItems.reduce(
    (s: number, i: any) =>
      s + Number(i.product?.sellingPrice ?? 0) * Number(i.quantity ?? 1),
    0,
  );

  const totalItems = displayItems.reduce(
    (s: number, i: any) => s + Number(i.quantity ?? 1),
    0,
  );

  /* -------------------- REMOVE ITEM -------------------- */
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartApi"] });
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const handleRemove = (item: any) => {
    if (user) {
      removeItemMutation.mutate(item.id);
    } else {
      removeItemLocal(item.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isMobile ? 0.5 : 0.45 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* DRAWER / BOTTOM SHEET */}
          <motion.div
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={`
              fixed z-[61] bg-[#fafafa] shadow-2xl flex flex-col
              ${
                isMobile
                  ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl"
                  : "right-0 top-0 h-full w-full sm:w-[400px]"
              }
            `}
          >
            {/* DRAG INDICATOR (Mobile only) */}
            {isMobile && (
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm">Added to bag</span>
              </div>
              <button onClick={close}>
                <X />
              </button>
            </div>

            {/* CONTENT */}
            <div
              className={`flex-1 overflow-y-auto ${
                isMobile ? "pb-24 px-2" : ""
              }`}
            >
              {displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                  <p className="text-gray-400 mt-2">Your bag is empty</p>
                </div>
              ) : (
                <>
                  {/* LAST ADDED */}
                  {lastAdded && (
                    <div className="m-4 bg-white rounded-xl p-3 flex gap-3">
                      <div className="relative w-20 h-24">
                        <Image
                          src={
                            lastAdded.product?.media?.[0]?.url ||
                            "/placeholder.jpg"
                          }
                          alt={lastAdded.product?.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {lastAdded.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {lastAdded.quantity}
                        </p>

                        <div className="flex justify-between mt-2">
                          <span className="font-bold">
                            ₹
                            {Number(
                              lastAdded.product?.sellingPrice,
                            ).toLocaleString("en-IN")}
                          </span>

                          <button onClick={() => handleRemove(lastAdded)}>
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OTHER ITEMS */}
                  {otherItems.length > 0 && (
                    <div className="px-4 space-y-2">
                      {otherItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-white p-2 rounded-lg"
                        >
                          <div className="relative w-12 h-12">
                            <Image
                              src={
                                item.product?.media?.[0]?.url ||
                                "/placeholder.jpg"
                              }
                              alt={item.product?.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>

                          <div className="flex-1">
                            <p className="text-xs font-medium">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <button onClick={() => handleRemove(item)}>
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* FOOTER */}
            {displayItems.length > 0 && (
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between mb-3">
                  <span>Subtotal ({totalItems})</span>
                  <span className="font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => {
                    close();
                    router.push("/cart");
                  }}
                  className="w-full bg-black text-white py-3 rounded-lg"
                >
                  View Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
