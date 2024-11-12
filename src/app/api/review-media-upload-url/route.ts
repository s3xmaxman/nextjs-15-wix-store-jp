import { getWixAdminClient } from "@/lib/wix-client.server";
import { NextRequest } from "next/server";

/**
 * Wix Mediaにファイルをアップロードするための署名付きURLを返します。
 *
 * このAPIは以下のクエリパラメータを必要とします：
 *
 * - `fileName`: アップロードするファイルの名前。
 * - `mimeType`: アップロードするファイルのMIMEタイプ。
 *
 * クエリパラメータが無効な場合、APIはエラーメッセージと共に400のレスポンスを返します。
 *
 * @param {NextRequest} req - リクエストオブジェクト。
 * @return {Promise<Response>} - レスポンスオブジェクトに解決するプロミス。
 */
export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  const mimeType = req.nextUrl.searchParams.get("mimeType");

  if (!fileName || !mimeType) {
    return new Response("Missing required query parameters", {
      status: 400,
    });
  }

  const { uploadUrl } = await getWixAdminClient().files.generateFileUploadUrl(
    mimeType,
    {
      fileName,
      filePath: "product-reviews-media",
      private: false,
    },
  );

  return Response.json({ uploadUrl });
}
