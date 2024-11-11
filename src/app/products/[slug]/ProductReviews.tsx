"use client";

import logo from "@/assets/logo.png";
import LoadingButton from "@/components/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import WixImage from "@/components/WixImage";
import { cn } from "@/lib/utils";
import { wixBrowserClient } from "@/lib/wix-client.browser";
import { useInfiniteQuery } from "@tanstack/react-query";
import { reviews } from "@wix/reviews";
import { media as wixMedia } from "@wix/sdk";
import { products } from "@wix/stores";
import { CornerDownRight, StarIcon } from "lucide-react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";

interface ProductReviewsProps {
  product: products.Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  return <></>;
}

export function ProductReviewsLoadingSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div className="space-y-1.5" key={i}>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-72" />
        </div>
      ))}
    </div>
  );
}
