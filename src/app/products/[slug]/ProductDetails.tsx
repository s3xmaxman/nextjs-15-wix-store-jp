"use client";

import Badge from "@/components/ui/badge";
import WixImage from "@/components/WixImage";
import { products } from "@wix/stores";

interface ProductDetailsProps {
  product: products.Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="flex flex-col gap-10 md:flex-row lg:gap-20">
      <div>
        <WixImage
          mediaIdentifier={product.media?.mainMedia?.image?.url}
          alt={product.media?.mainMedia?.image?.altText}
          width={1000}
          height={1000}
          className="stick top-0"
        />
      </div>
      <div className="basis-3/5 space-y-5">
        <div className="space-y-2.5">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.brand && (
            <div className="text-muted-foreground">{product.brand}</div>
          )}
          {product.ribbon && <Badge className="block">{product.ribbon}</Badge>}
        </div>
        {product.description && (
          <div
            dangerouslySetInnerHTML={{ __html: product.description }}
            className="prose dark:prose-invert"
          />
        )}
      </div>
    </div>
  );
}
