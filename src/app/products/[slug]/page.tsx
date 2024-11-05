import { getProductBySlug } from "@/wix-api/products";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params: { slug } }: PageProps) {
  const decodedSlug = decodeURIComponent(slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product?._id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <ProductDetails product={product} />
    </main>
  );
}
