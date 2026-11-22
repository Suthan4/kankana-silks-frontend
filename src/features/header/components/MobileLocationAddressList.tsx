"use client";
import Link from "next/link"; import { Check } from "lucide-react"; import { toast } from "@/store/useToastStore";
import type { Address } from "@/lib/api/addresses.api"; import type { HeaderLocation } from "../types";
interface Props { addresses: Address[]; location: HeaderLocation | null; setLocation: (location: HeaderLocation) => void; onClose: () => void; }
export function MobileLocationAddressList({addresses,location,setLocation,onClose}:Props) {
 if (!addresses.length) return null;
 return <div className="mb-6">
  <h4 className="mb-3 text-sm font-semibold text-gray-900">Your Address</h4>
  <div className="space-y-3">{addresses.map(address=>{const selected=location?.pincode===address.pincode;return <button key={address.id} onClick={()=>{const next={city:address.city,pincode:address.pincode,isServiceable:true};setLocation(next);localStorage.setItem("userLocation",JSON.stringify(next));onClose();toast.success(`Delivering to ${address.city}, ${address.pincode}`);}} className={`w-full rounded-xl border-2 p-4 text-left transition-all ${selected?"border-black bg-gray-50":"border-gray-200 hover:border-black"}`}><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{address.fullName}</p><p className="text-xs text-gray-600">{address.city} - {address.pincode}</p></div>{selected&&<Check className="h-5 w-5 text-green-600"/>}</div></button>;})}</div>
  <Link href="/my-account/addresses" onClick={onClose} className="mt-3 block py-2 text-center text-sm font-medium text-blue-600">Manage address</Link>
  <div className="my-4 border-t border-gray-200"/>
 </div>;
}
