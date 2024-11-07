import { WixClient } from "@/lib/wix-client.base";
import { cache } from "react";

type ProductsSort = "last_updated" | "price_asc" | "price_desc";

interface QueryProductsFilter {
  collectionIds?: string[] | string;
  sort?: ProductsSort;
}

/**
 * Wix APIを使用して商品をクエリするための関数です。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {QueryProductsFilter} options - クエリフィルターとソートオプション
 * @returns {Promise<products.Product[]>} 商品の配列
 */
export async function queryProducts(
  wixClient: WixClient,
  { collectionIds, sort = "last_updated" }: QueryProductsFilter,
) {
  let query = wixClient.products.queryProducts();

  // collectionIdsを配列に変換
  const collectionIdsArray = Array.isArray(collectionIds)
    ? collectionIds
    : collectionIds
      ? [collectionIds]
      : [];

  // コレクションIDが存在する場合、フィルタリングを行う
  if (collectionIdsArray.length > 0) {
    query = query.hasSome("collectionIds", collectionIdsArray);
  }

  // ソートオプションに基づいてクエリを調整
  switch (sort) {
    case "price_asc":
      query = query.ascending("price");
      break;
    case "price_desc":
      query = query.descending("price");
      break;
    case "last_updated":
      query = query.descending("lastUpdated");
      break;
  }

  // クエリを実行して商品を取得
  return query.find();
}

/**
 * 指定されたスラグに基づいて商品を取得する関数です。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {string} slug - 商品のスラグ
 * @returns {Promise<products.Product | null>} 商品オブジェクトまたはnull
 */
export const getProductBySlug = cache(
  async (wixClient: WixClient, slug: string) => {
    const { items } = await wixClient.products
      .queryProducts()
      .eq("slug", slug)
      .limit(1)
      .find();

    const product = items[0];

    // 商品が存在し、かつ表示可能な場合に返す
    if (!product || !product.visible) {
      return null;
    }

    return product;
  },
);
