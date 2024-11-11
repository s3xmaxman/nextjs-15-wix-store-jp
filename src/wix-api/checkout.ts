import { env } from "@/env";
import { WIX_STORES_APP_ID } from "@/lib/constants";
import { findVariant } from "@/lib/utils";
import { WixClient } from "@/lib/wix-client.base";
import { checkout } from "@wix/ecom";
import { products } from "@wix/stores";

/**
 * 現在のカートからチェックアウトURLを取得します。
 *
 * この関数は、Wixクライアントを使用して現在のカートからチェックアウトを作成し、
 * そのチェックアウトIDを使用してリダイレクトセッションを生成します。
 * 生成されたリダイレクトセッションのURLを返します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @returns {Promise<string>} チェックアウトURL
 * @throws {Error} リダイレクトセッションの作成に失敗した場合
 */
export async function getCheckoutUrlForCurrentCart(wixClient: WixClient) {
  const { checkoutId } =
    await wixClient.currentCart.createCheckoutFromCurrentCart({
      channelType: checkout.ChannelType.WEB,
    });

  const { redirectSession } = await wixClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: {
      postFlowUrl: window.location.href,
      thankYouPageUrl: env.NEXT_PUBLIC_BASE_URL + "/checkout-success",
    },
  });

  if (!redirectSession) {
    throw Error("リダイレクトセッションの作成に失敗しました");
  }

  return redirectSession.fullUrl;
}

export interface GetCheckoutUrlForProductValues {
  product: products.Product;
  quantity: number;
  selectedOptions: Record<string, string>;
}

/**
 * 指定された商品のチェックアウトURLを取得します。
 *
 * この関数は、指定された商品とそのオプション、数量を使用して新しいチェックアウトを作成し、
 * そのチェックアウトIDを使用してリダイレクトセッションを生成します。
 * 生成されたリダイレクトセッションのURLを返します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {GetCheckoutUrlForProductValues} values - 商品情報、数量、選択されたオプションを含むオブジェクト
 * @param {products.Product} values.product - チェックアウトする商品
 * @param {number} values.quantity - 商品の数量
 * @param {Record<string, string>} values.selectedOptions - 選択された商品オプション
 * @returns {Promise<string>} チェックアウトURL
 * @throws {Error} チェックアウトまたはリダイレクトセッションの作成に失敗した場合
 */
export async function getCheckoutUrlForProduct(
  wixClient: WixClient,
  { product, quantity, selectedOptions }: GetCheckoutUrlForProductValues,
) {
  const selectedVariant = findVariant(product, selectedOptions);

  const { _id } = await wixClient.checkout.createCheckout({
    channelType: checkout.ChannelType.WEB,
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

  if (!_id) {
    throw Error("チェックアウトの作成に失敗しました");
  }

  const { redirectSession } = await wixClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId: _id },
    callbacks: {
      postFlowUrl: window.location.href,
      thankYouPageUrl: env.NEXT_PUBLIC_BASE_URL + "/checkout-success",
    },
  });

  if (!redirectSession) {
    throw Error("リダイレクトセッションの作成に失敗しました");
  }

  return redirectSession.fullUrl;
}
