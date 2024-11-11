import { WixClient } from "@/lib/wix-client.base";

/**
 * 指定されたIDの注文を取得します。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {string} orderId - 注文ID
 * @returns {Promise<orders.Order | null>} 注文オブジェクト、もしくは存在しない場合はnull
 */
export async function getOrder(wixClient: WixClient, orderId: string) {
  try {
    return await wixClient.orders.getOrder(orderId);
  } catch (error) {
    if ((error as any).details.applicationError.code === "NOT_FOUND") {
      return null;
    } else {
      throw error;
    }
  }
}
