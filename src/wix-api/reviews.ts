import { WixClient } from "@/lib/wix-client.base";
import { getLoggedInMember } from "./members";

export interface CreateProductReviewValues {
  productId: string;
  title: string;
  body: string;
  rating: number;
  media: { url: string; type: "image" | "video" }[];
}

/**
 * 商品レビューを作成する非同期関数です。
 *
 * この関数は、指定された商品に対してレビューを作成します。レビューの作成には、
 * 商品ID、タイトル、本文、評価、およびメディア（画像またはビデオ）が必要です。
 * また、レビューの作成者はログインしている必要があります。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {CreateProductReviewValues} reviewData - レビューのデータを含むオブジェクト
 * @param {string} reviewData.productId - レビューを作成する商品のID
 * @param {string} reviewData.title - レビューのタイトル
 * @param {string} reviewData.body - レビューの本文
 * @param {number} reviewData.rating - レビューの評価（1から5の整数）
 * @param {Array<{ url: string; type: "image" | "video" }>} reviewData.media - レビューに添付するメディアの配列
 * @returns {Promise<any>} 作成されたレビューの情報を含むPromise
 * @throws {Error} ログインしていない場合にエラーを投げます
 */
export async function createProductReview(
  wixClient: WixClient,
  { productId, title, body, rating, media }: CreateProductReviewValues,
) {
  const member = await getLoggedInMember(wixClient);

  if (!member) {
    throw Error("Must be logged in to create a review");
  }

  const authorName =
    member.contact?.firstName && member.contact?.lastName
      ? `${member.contact.firstName} ${member.contact.lastName}`
      : member.contact?.firstName ||
        member.contact?.lastName ||
        member.profile?.nickname ||
        "Anonymous";

  return wixClient.reviews.createReview({
    author: {
      authorName,
      contactId: member.contactId,
    },
    entityId: productId,
    namespace: "stores",
    content: {
      title,
      body,
      rating,
      media: media.map(({ url, type }) =>
        type === "image" ? { image: url } : { video: url },
      ),
    },
  });
}

interface GetProductReviewsFilters {
  productId: string;
  contactId?: string;
  limit?: number;
  cursor?: string | null;
}

export async function getProductReviews(
  wixClient: WixClient,
  { productId, contactId, limit, cursor }: GetProductReviewsFilters,
) {
  let query = wixClient.reviews.queryReviews().eq("entityId", productId);

  if (contactId) {
    // @ts-expect-error
    query = query.eq("author.contactId", contactId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  if (cursor) {
    query = query.skipTo(cursor);
  }

  return query.find();
}
