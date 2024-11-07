import { WIX_STORES_APP_ID } from "@/lib/constants";
import { findVariant } from "@/lib/utils";
import { WixClient } from "@/lib/wix-client.base";
import { products } from "@wix/stores";

/**
 * カート情報を取得します。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @returns {Promise<currentCart.Cart | null>} カート情報またはカートが見つからない場合はnull
 * @throws {Error} カート取得中に予期しないエラーが発生した場合
 */
export async function getCart(wixClient: WixClient) {
  try {
    return await wixClient.currentCart.getCurrentCart();
  } catch (error) {
    if (
      (error as any).details.applicationError.code === "OWNED_CART_NOT_FOUND"
    ) {
      return null;
    } else {
      throw error;
    }
  }
}

/**
 * カートに商品を追加します。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {AddToCartValues} values - カートに追加する商品の情報
 * @returns {Promise<currentCart.AddToCartResponse>} カートに商品を追加した結果
 */
export interface AddToCartValues {
  product: products.Product;
  selectedOptions: Record<string, string>;
  quantity: number;
}

export async function addToCart(
  wixClient: WixClient,
  { product, selectedOptions, quantity }: AddToCartValues,
) {
  const selectedVariant = findVariant(product, selectedOptions);

  return wixClient.currentCart.addToCurrentCart({
    lineItems: [
      {
        catalogReference: {
          appId: WIX_STORES_APP_ID,
          catalogItemId: product._id,
          options: selectedVariant
            ? {
                variantId: selectedVariant._id,
              }
            : { options: selectedOptions },
        },
        quantity,
      },
    ],
  });
}

/**
 * カート内の商品の数量を更新します。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {UpdateCartItemQuantityValues} values - 更新する商品のIDと新しい数量
 * @returns {Promise<currentCart.UpdateCartResponse>} カートの更新結果
 */
export interface UpdateCartItemQuantityValues {
  productId: string;
  newQuantity: number;
}

export async function updateCartItemQuantity(
  wixClient: WixClient,
  { productId, newQuantity }: UpdateCartItemQuantityValues,
) {
  return wixClient.currentCart.updateCurrentCartLineItemQuantity([
    {
      _id: productId,
      quantity: newQuantity,
    },
  ]);
}

/**
 * カートから商品を削除します。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {string} productId - 削除する商品のID
 * @returns {Promise<currentCart.RemoveFromCartResponse>} カートから商品を削除した結果
 */
export async function removeCartItem(wixClient: WixClient, productId: string) {
  return wixClient.currentCart.removeLineItemsFromCurrentCart([productId]);
}
