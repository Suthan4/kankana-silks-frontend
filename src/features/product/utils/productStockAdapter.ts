import type { Product, ProductVariant } from "@/lib/api/product.api";
import { getCartItemStockMessage, getCartItemStockState } from "@/lib/utils/cartStock";
export function getProductStock(input:{product:Product;variant?:ProductVariant|null;quantity?:number}) {
 const item={product:input.product,variant:input.variant??undefined,variantId:input.variant?.id,quantity:input.quantity??1,allowOutOfStockOrders:input.product.allowOutOfStockOrders};
 return {item,state:getCartItemStockState(item),message:getCartItemStockMessage(item)};
}
