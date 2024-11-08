import { WIX_STORES_APP_ID_BACK_IN_STOCK_NOTIFICATIONS } from "@/lib/constants";
import { findVariant } from "@/lib/utils";
import { WixClient } from "@/lib/wix-client.base";
import { products } from "@wix/stores";

export interface BackInStockNotificationRequestValues {
  email: string;
  itemUrl: string;
  product: products.Product;
  selectedOptions: Record<string, string>;
}

/**
 * 在庫復活通知リクエストを作成します。
 *
 * この関数は、指定された製品と選択されたオプションに基づいて、在庫復活通知リクエストをWixクライアントに送信します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {Object} options - 通知リクエストのオプション
 * @param {string} options.email - 通知を受け取るメールアドレス
 * @param {string} options.itemUrl - 製品のURL
 * @param {products.Product} options.product - 通知対象の製品
 * @param {Record<string, string>} options.selectedOptions - 選択された製品オプション
 *
 * @returns {Promise<void>} - 非同期操作の完了を示すPromise
 *
 * @throws {Error} - 通知リクエストの作成中にエラーが発生した場合
 */
export async function createBackInStockNotificationRequest(
  wixClient: WixClient,
  {
    email,
    itemUrl,
    product,
    selectedOptions,
  }: BackInStockNotificationRequestValues,
) {
  const selectedVariant = findVariant(product, selectedOptions);

  await wixClient.backInStockNotifications.createBackInStockNotificationRequest(
    {
      email,
      itemUrl,
      catalogReference: {
        appId: WIX_STORES_APP_ID_BACK_IN_STOCK_NOTIFICATIONS,
        catalogItemId: product._id,
        options: selectedVariant
          ? {
              variantId: selectedVariant._id,
            }
          : { options: selectedOptions },
      },
    },
    {
      name: product.name || undefined,
      price: product.priceData?.discountedPrice?.toFixed(2),
      image: product.media?.mainMedia?.image?.url,
    },
  );
}
