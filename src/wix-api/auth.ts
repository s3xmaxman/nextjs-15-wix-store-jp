import { env } from "@/env";
import { WixClient } from "@/lib/wix-client.base";
import { OauthData } from "@wix/sdk";

/**
 * WixのOAuthデータを生成します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {string} [originPath] - リダイレクト後のパス。指定されない場合はルートパスにリダイレクトします。
 * @returns {Promise<OauthData>} OAuthデータを含むPromise
 */
export async function generateOAuthData(
  wixClient: WixClient,
  originPath?: string,
): Promise<OauthData> {
  const callbackUrl = env.NEXT_PUBLIC_BASE_URL + "/api/auth/callback/wix";
  const redirectUrl = env.NEXT_PUBLIC_BASE_URL + "/" + (originPath || "");

  return wixClient.auth.generateOAuthData(callbackUrl, redirectUrl);
}

/**
 * WixのログインURLを取得します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {OauthData} oauthData - OAuthデータ
 * @returns {Promise<string>} ログインURLを含むPromise
 */
export async function getLoginUrl(
  wixClient: WixClient,
  oauthData: OauthData,
): Promise<string> {
  const { authUrl } = await wixClient.auth.getAuthUrl(oauthData, {
    responseMode: "query",
  });

  return authUrl;
}

/**
 * WixのログアウトURLを取得します。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @returns {Promise<string>} ログアウトURLを含むPromise
 */
export async function getLogoutUrl(wixClient: WixClient): Promise<string> {
  const { logoutUrl } = await wixClient.auth.logout(env.NEXT_PUBLIC_BASE_URL);

  return logoutUrl;
}
