import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  getCheckoutUrlForCurrentCart,
  getCheckoutUrlForProduct,
  GetCheckoutUrlForProductValues,
} from "@/wix-api/checkout";
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
      window.location.href = checkoutUrl;
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

/**
 * クイック購入機能を提供するカスタムフックです。
 *
 * このフックは、特定の商品を直接チェックアウトする機能を提供します。
 * 商品情報、数量、選択されたオプションを引数として受け取り、
 * チェックアウトURLを取得し、ユーザーをチェックアウトページにリダイレクトします。
 * また、チェックアウトプロセスが進行中かどうかを示す状態も管理します。
 *
 * @returns {Object} 以下のプロパティを含むオブジェクト:
 *   - `startCheckoutFlow`: 商品情報を受け取り、チェックアウトフローを開始する非同期関数
 *   - `pending`: チェックアウトプロセスが進行中かどうかを示すブール値
 */
export function useQuickBuy() {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  /**
   * 指定された商品のチェックアウトフローを開始します。
   *
   * @param {GetCheckoutUrlForProductValues} values - 商品情報、数量、選択されたオプションを含むオブジェクト
   * @throws {Error} チェックアウトまたはリダイレクトセッションの作成に失敗した場合
   */
  async function startCheckoutFlow(values: GetCheckoutUrlForProductValues) {
    setPending(true);

    try {
      const checkoutUrl = await getCheckoutUrlForProduct(
        wixBrowserClient,
        values,
      );
      window.location.href = checkoutUrl;
    } catch (error) {
      setPending(false);
      console.error(error);
      toast({
        variant: "destructive",
        description:
          "チェックアウトの読み込みに失敗しました。もう一度お試しください。",
      });
    }
  }

  return { startCheckoutFlow, pending };
}
