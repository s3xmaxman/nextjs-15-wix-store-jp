import { usePathname } from "next/navigation";
import { useToast } from "./use-toast";
import { wixBrowserClient } from "@/lib/wix-client.browser";
import { generateOAuthData, getLoginUrl, getLogoutUrl } from "@/wix-api/auth";
import { WIX_OAUTH_DATA_COOKIE } from "@/lib/constants";
import Cookie from "js-cookie";

/**
 * Wixの認証フックを提供します。
 *
 * このフックは、WixのOAuth認証プロセスを管理するための関数を提供します。
 * `login`関数はユーザーをWixの認証ページにリダイレクトし、
 * `logout`関数はユーザーをログアウトしてWixのログアウトページにリダイレクトします。
 *
 * @returns {Object} 認証関連の関数を含むオブジェクト
 *   - `login`: ユーザーをWixのログインページにリダイレクトする非同期関数
 *   - `logout`: ユーザーをログアウトし、Wixのログアウトページにリダイレクトする非同期関数
 */
export default function useAuth() {
  const pathname = usePathname();
  const { toast } = useToast();

  /**
   * ユーザーをWixのログインページにリダイレクトします。
   *
   * @throws {Error} 認証データの生成やリダイレクトURLの取得に失敗した場合
   */
  async function login() {
    try {
      const oAuthData = await generateOAuthData(wixBrowserClient, pathname);

      Cookie.set(WIX_OAUTH_DATA_COOKIE, JSON.stringify(oAuthData), {
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 10 * 1000), // 10分有効
      });

      const redirectUrl = await getLoginUrl(wixBrowserClient, oAuthData);

      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "何か問題が発生しました。もう一度お試しください。",
      });
    }
  }

  /**
   * ユーザーをログアウトし、Wixのログアウトページにリダイレクトします。
   *
   * @throws {Error} ログアウトURLの取得に失敗した場合
   */
  async function logout() {
    try {
      const logoutUrl = await getLogoutUrl(wixBrowserClient);
      Cookie.remove(WIX_OAUTH_DATA_COOKIE);

      window.location.href = logoutUrl;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "何か問題が発生しました。もう一度お試しください。",
      });
    }
  }

  return {
    login,
    logout,
  };
}
