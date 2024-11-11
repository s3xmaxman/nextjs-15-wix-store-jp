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

export interface GetOrdersFilters {
  limit?: number;
  cursor?: string | null;
}

/**
 * ユーザーの注文を取得します。
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {GetOrdersFilters} filters - フィルターオブジェクト
 * @param {number} [filters.limit] - 取得する注文の最大数
 * @param {string|null} [filters.cursor] - ページングのためのカーソル
 * @returns {Promise<orders.Order[]>} 注文の配列
 */
export async function getUserOrders(
  wixClient: WixClient,
  { limit, cursor }: GetOrdersFilters,
) {
  return await wixClient.orders.searchOrders({
    search: {
      cursorPaging: {
        limit,
        cursor,
      },
    },
  });
}
