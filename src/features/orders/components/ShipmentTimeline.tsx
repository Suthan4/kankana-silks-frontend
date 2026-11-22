"use client";
import { Clock, CheckCircle2, Package, Truck } from "lucide-react";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
export interface ShipmentTimelineItem { status:string; date:string; location?:string; activity?:string; completed:boolean; active?:boolean; }
interface ShipmentTimelineProps { items:ShipmentTimelineItem[]; isLoading?:boolean; }
export function ShipmentTimeline({items,isLoading=false}:ShipmentTimelineProps){
  if(isLoading)return <SkeletonGroup label="Refreshing shipment timeline" className="rounded-2xl bg-white p-6"><Skeleton className="mb-6 h-5 w-40"/>{[0,1,2,3].map(index=><div key={index} className="mb-6 flex gap-4"><Skeleton className="h-10 w-10 shrink-0 rounded-full"/><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3"/><Skeleton className="h-3 w-full"/><Skeleton className="h-3 w-1/3"/></div></div>)}</SkeletonGroup>;
  return (<div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Shipment Timeline
          </h3>
          <div className="space-y-6">
            {items?.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.completed
                        ? "bg-green-100"
                        : item.active
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          item.completed ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    ) : item.active ? (
                      <Truck className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {idx < items.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-6 ${
                        item.completed ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p
                    className={`font-medium ${
                      item.active ? "text-black" : "text-gray-700"
                    }`}
                  >
                    {item.status}
                  </p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                  {item.location && (
                    <p className="text-xs text-gray-400 mt-1">
                      {item.location}
                    </p>
                  )}
                  {item.activity && (
                    <p className="text-xs text-gray-600 mt-1">
                      {item.activity}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>);
}
