import { WIX_OAUTH_DATA_COOKIE, WIX_SESSION_COOKIE } from "@/lib/constants";
import { getWixServerClient } from "@/lib/wix-client.server";
import { OauthData } from "@wix/sdk";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * WixのOAuthコールバックエンドポイントを処理します。
 *
 * この関数は、WixのOAuth認証プロセスが完了した後に呼び出され、
 * 認証コードとステートパラメータを受け取り、Wixのメンバー認証トークンを取得します。
 * 取得したトークンはセッションクッキーに保存され、ユーザーは元のリクエストURIにリダイレクトされます。
 *
 * @param {NextRequest} request - Next.jsのリクエストオブジェクト
 * @returns {Promise<Response>} HTTPレスポンス
 */
export async function GET(request: NextRequest) {
  // URLパラメータから認証コード、ステート、エラー情報を取得
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const error_description =
    request.nextUrl.searchParams.get("error_description");

  if (error) {
    console.error(`認証エラー: ${error}`);
    return new Response(error_description || "認証中にエラーが発生しました", {
      status: 400,
    });
  }

  // OAuthデータを取得
  const oAuthData: OauthData = JSON.parse(
    cookies().get(WIX_OAUTH_DATA_COOKIE)?.value || "{}",
  );

  if (!code || !state || !oAuthData) {
    return new Response(
      "リクエストが無効です。必要なパラメータが見つかりませんでした",
      { status: 400 },
    );
  }

  const wixClient = getWixServerClient();

  // メンバートークンを取得
  const memberTokens = await wixClient.auth.getMemberTokens(
    code,
    state,
    oAuthData,
  );

  // OAuthデータクッキーを削除し、セッションクッキーを設定
  cookies().delete(WIX_OAUTH_DATA_COOKIE);
  cookies().set(WIX_SESSION_COOKIE, JSON.stringify(memberTokens), {
    maxAge: 60 * 60 * 24 * 14, // 2週間有効
    secure: process.env.NODE_ENV === "production",
  });

  // ユーザーを元のリクエストURIにリダイレクト
  return new Response(null, {
    status: 302,
    headers: { Location: oAuthData.originalUri || "/" },
  });
}
