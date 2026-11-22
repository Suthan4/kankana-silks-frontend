"use client";
import type { ComponentProps } from "react";
import { ZoomGallery } from "@/components/ui/ZoomGallery";
type Props=ComponentProps<typeof ZoomGallery>;
export function ProductImageGallery(props:Props){return <ZoomGallery {...props}/>;}
