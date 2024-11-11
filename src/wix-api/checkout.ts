import { env } from "@/env";
import { WixClient } from "@/lib/wix-client.base";
import { checkout } from "@wix/ecom";

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
