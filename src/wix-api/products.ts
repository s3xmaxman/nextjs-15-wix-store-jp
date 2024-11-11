import { WIX_STORES_APP_ID } from "@/lib/constants";
import { WixClient } from "@/lib/wix-client.base";
import { cache } from "react";

export type ProductsSort = "last_updated" | "price_asc" | "price_desc";

interface QueryProductsFilter {
  q?: string;
  collectionIds?: string[] | string;
  sort?: ProductsSort;
  priceMin?: number;
  priceMax?: number;
  skip?: number;
  limit?: number;
}

/**
 * Wix APIを使用して商品をクエリする関数です。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {QueryProductsFilter} options - クエリのオプション
 * @param {string|string[]} [options.collectionIds] - フィルタリングするコレクションID。単一のIDまたはIDの配列
 * @param {ProductsSort} [options.sort="last_updated"] - ソートオプション。デフォルトは"last_updated"
 * @param {number} [options.skip] - スキップする商品の数
 * @param {number} [options.limit] - 取得する商品の最大数
 * @returns {Promise<products.Product[]>} 商品の配列
 */
export async function queryProducts(
  wixClient: WixClient,
  {
    collectionIds,
    sort = "last_updated",
    skip,
    limit,
    q,
    priceMin,
    priceMax,
  }: QueryProductsFilter,
) {
  let query = wixClient.products.queryProducts();

  if (q) {
    query = query.startsWith("name", q);
  }

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

  if (priceMin) {
    query = query.ge("priceData.price", priceMin);
  }

  if (priceMax) {
    query = query.le("priceData.price", priceMax);
  }

  // 取得する商品の数を制限
  if (limit) {
    query = query.limit(limit);
  }

  // スキップする商品の数を設定
  if (skip) {
    query = query.skip(skip);
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

/**
 * 指定された商品IDに関連する商品を取得します。
 *
 * この関数は、WixのレコメンデーションAPIを使用して、指定された商品に関連する商品を取得します。
 * 以下のステップで処理を行います：
 * 1. 指定された商品IDに基づいて、同じカテゴリからの商品やよく一緒に購入される商品を推薦します。
 * 2. 推薦された商品のIDを取得し、重複を除去します。
 * 3. 取得した商品IDを使用して、商品情報を取得します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {string} productId - 関連商品を取得する対象の商品ID
 * @returns {Promise<products.Product[]>} 関連商品の配列。関連商品が見つからない場合は空の配列を返します。
 */
export async function getRelatedProducts(
  wixClient: WixClient,
  productId: string,
) {
  const result = await wixClient.recommendations.getRecommendation(
    [
      {
        _id: "68ebce04-b96a-4c52-9329-08fc9d8c1253", // "From the same categories"
        appId: WIX_STORES_APP_ID,
      },
      {
        _id: "d5aac1e1-2e53-4d11-85f7-7172710b4783", // Frequenly bought together
        appId: WIX_STORES_APP_ID,
      },
    ],
    {
      items: [
        {
          appId: WIX_STORES_APP_ID,
          catalogItemId: productId,
        },
      ],
      minimumRecommendedItems: 3,
    },
  );

  // 推薦された商品のIDを取得し、重複を除去
  const productIds = result.recommendation?.items
    .map((item) => item.catalogItemId)
    .filter((id) => id !== productId);

  if (!productIds || productIds.length === 0) return [];

  // 商品情報を取得
  const productsResult = await wixClient.products
    .queryProducts()
    .in("_id", productIds)
    .limit(4)
    .find();

  return productsResult.items;
}
