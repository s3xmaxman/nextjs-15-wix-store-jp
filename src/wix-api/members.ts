import { WixClient } from "@/lib/wix-client.base";
import { members } from "@wix/members";
import { cache } from "react";

export const getLoggedInMember = cache(
  async (wixClient: WixClient): Promise<members.Member | null> => {
    if (!wixClient.auth.loggedIn()) {
      return null;
    }

    const memberData = await wixClient.members.getCurrentMember({
      fieldsets: [members.Set.FULL],
    });

    return memberData.member || null;
  },
);

export interface UpdateMemberInfoValues {
  firstName: string;
  lastName: string;
}

/**
 * 会員情報を更新します。
 *
 * この関数は、指定されたWixクライアントを使用して、現在ログインしている会員の情報を更新します。
 * 名前と姓を更新するために使用されます。
 *
 * @param {WixClient} wixClient - Wixクライアントインスタンス
 * @param {UpdateMemberInfoValues} values - 更新する会員情報を含むオブジェクト
 * @param {string} values.firstName - 更新する名前
 * @param {string} values.lastName - 更新する姓
 * @returns {Promise<any>} 更新された会員情報
 * @throws {Error} ログインしていない場合や、会員情報の更新に失敗した場合
 */
export async function updateMemberInfo(
  wixClient: WixClient,
  { firstName, lastName }: UpdateMemberInfoValues,
) {
  const loggedInMember = await getLoggedInMember(wixClient);

  if (!loggedInMember?._id) {
    throw Error("ログインしていません。");
  }

  return wixClient.members.updateMember(loggedInMember._id, {
    contact: {
      firstName,
      lastName,
    },
  });
}
