import { wixBrowserClient } from "@/lib/wix-client.browser";
import { getCheckoutUrlForCurrentCart } from "@/wix-api/checkout";
import { useState } from "react";
import { useToast } from "./use-toast";
import { set } from "zod";

/**
 * カートのチェックアウトプロセスを管理するためのカスタムフックです。
 *
 * このフックは、チェックアウトフローを開始し、チェックアウトURLを取得する機能を提供します。
 * また、チェックアウトプロセスが進行中かどうかを示す状態も管理します。
 *
 * @returns {Object} 以下のプロパティを含むオブジェクト:
 *   - `startCheckoutFlow`: チェックアウトフローを開始する非同期関数
 *   - `pending`: チェックアウトプロセスが進行中かどうかを示すブール値
 */
export function useCartCheckout() {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  /**
   * チェックアウトフローを開始します。
   *
   * この関数は、チェックアウトURLを取得し、ユーザーをチェックアウトページにリダイレクトします。
   * エラーが発生した場合は、ユーザーに通知し、進行中の状態をリセットします。
   */
  async function startCheckoutFlow() {
    setPending(true);

    try {
      const checkoutUrl = await getCheckoutUrlForCurrentCart(wixBrowserClient);
      // ここで、取得したURLを使用してリダイレクト処理を行うことができます。
    } catch (error) {
      setPending(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "何か問題が発生しました。もう一度お試しください。",
      });
    }
  }

  return {
    startCheckoutFlow,
    pending,
  };
}
