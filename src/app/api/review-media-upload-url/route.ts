import { getWixAdminClient } from "@/lib/wix-client.server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("fileName");
  const mineType = request.nextUrl.searchParams.get("mineType");

  if (!fileName || !mineType) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const { uploadUrl } = await getWixAdminClient().files.generateFileUploadUrl(
    mineType,
    {
      fileName,
      filePath: "product-reviews-media",
      private: false,
    },
  );

  return Response.json({ uploadUrl });
}
