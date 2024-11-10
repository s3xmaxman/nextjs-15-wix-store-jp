import PaginationBar from "@/components/PaginationBar";
import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { queryProducts } from "@/wix-api/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export function generateMetadata({ searchParams: { q } }: PageProps): Metadata {
  return {
    title: q ? `Results for "${q}"` : "Products",
  };
}

export default async function Page({
  searchParams: { q, page = "1" },
}: PageProps) {
  const title = q ? `「${q}」の検索結果` : "商品";

  return (
    <div className="space-y-10">
      <h1 className="text-center text-3xl font-bold md:text-4xl">{title}</h1>
      <Suspense fallback={<LoadingSkeleton />} key={`${q}-${page}`}>
        <ProductResults
          q={q}
          page={parseInt(page)}
          // collectionIds={collectionIds}
          // priceMin={price_min ? parseInt(price_min) : undefined}
          // priceMax={price_max ? parseInt(price_max) : undefined}
          // sort={sort as ProductsSort}
        />
      </Suspense>
    </div>
  );
}

interface ProductResultsProps {
  q?: string;
  page: number;
}

async function ProductResults({ q, page }: ProductResultsProps) {
  await delay(1000);

  const pageSize = 8;

  const products = await queryProducts(getWixServerClient(), {
    q,
    limit: pageSize,
    skip: (page - 1) * pageSize,
  });

  if (page > (products.totalPages || 1)) notFound();

  return (
    <div className="space-y-10">
      <p className="text-center text-xl">
        {products.totalCount} 件の商品が見つかりました
      </p>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {products.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar currentPage={page} totalPages={products.totalPages || 1} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="mx-auto h-9 w-52" />
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[26rem]" />
        ))}
      </div>
    </div>
  );
}
