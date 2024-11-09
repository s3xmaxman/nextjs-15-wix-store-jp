import { WixClient } from "@/lib/wix-client.base";
import { collections } from "@wix/stores";
import { cache } from "react";

/**
 * スラグでコレクションを取得します。
 *
 * この関数は、指定されたスラグに基づいてWixストアからコレクションを取得します。
 * 結果はキャッシュされ、後続の呼び出しではキャッシュされたデータが返されます。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {string} slug - 取得したいコレクションのスラグ
 * @returns {Promise<collections.Collection | null>} 見つかったコレクションまたはnull
 */
export const getCollectionBySlug = cache(
  async (wixClient: WixClient, slug: string) => {
    const { collection } =
      await wixClient.collections.getCollectionBySlug(slug);

    return collection || null;
  },
);

/**
 * キャッシュされたコレクションリストを取得します。
 *
 * この関数は、特定のIDを持つコレクションを除外し、Wixストアからコレクションを取得します。
 * 結果はキャッシュされ、後続の呼び出しではキャッシュされたデータが返されます。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @returns {Promise<collections.Collection[]>} コレクションの配列
 */
export const getCollection = cache(
  async (wixClient: WixClient): Promise<collections.Collection[]> => {
    const collections = await wixClient.collections
      .queryCollections()
      .ne("_id", "00000000-000000-000000-000000000001") //all
      .ne("_id", "bc7c5be0-05f2-ce4e-872f-7b823a527bc5") //featured
      .find();

    return collections.items;
  },
);
