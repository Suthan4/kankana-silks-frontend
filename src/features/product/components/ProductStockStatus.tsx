import { AlertCircle } from "lucide-react";
import type { CartStockState, StockMessage } from "@/lib/utils/cartStock";
interface Props { stockState:CartStockState; availableStock:number; stockMessage:StockMessage|null; }
export function ProductStockStatus({stockState,availableStock,stockMessage}:Props){return <div aria-live="polite">{stockState.isOutOfStock?<p className="text-red-600 font-medium text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/>Out of Stock</p>:<div className="space-y-1"><p className="text-main-secondary font-medium text-sm">✓ {stockState.hasStockData?"In Stock ("+availableStock+" available)":"Availability confirmed at checkout"}</p>{stockMessage&&<p className="text-amber-700 text-xs font-medium">{stockMessage.message}</p>}</div>}</div>}
