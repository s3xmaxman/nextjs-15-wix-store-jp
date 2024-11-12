import { useToast } from "@/hooks/use-toast";
import ky from "ky";
import { useState } from "react";

export interface MediaAttachment {
  id: string;
  file: File;
  url?: string;
  state: "uploading" | "uploaded" | "failed";
}

/**
 * メディアアップロードのカスタムフックです。
 * このフックは、ファイルのアップロード、削除、およびアップロード状態の管理を提供します。
 *
 * @returns {Object} アップロード関連の関数と状態を含むオブジェクト
 * @property {MediaAttachment[]} attachments - アップロードされたメディアのリスト
 * @property {Function} startUpload - ファイルのアップロードを開始する関数
 * @property {Function} removeAttachment - 特定のメディアを削除する関数
 * @property {Function} clearAttachments - 全てのメディアをクリアする関数
 */
export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  /**
   * ファイルのアップロードを開始します。
   *
   * @param {File} file - アップロードするファイル
   */
  async function startUpload(file: File) {
    const id = crypto.randomUUID();

    // ファイルのアップロード状態を「uploading」に設定
    setAttachments((prev) => [
      ...prev,
      {
        id,
        file,
        state: "uploading",
      },
    ]);

    try {
      // アップロードURLを取得
      const { uploadUrl } = await ky
        .get("/api/review-media-upload-url", {
          searchParams: {
            fileName: file.name,
            mimeType: file.type,
          },
        })
        .json<{ uploadUrl: string }>();

      // ファイルをアップロード
      const {
        file: { url },
      } = await ky
        .put(uploadUrl, {
          timeout: false,
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
          },
          searchParams: {
            filename: file.name,
          },
        })
        .json<{ file: { url: string } }>();

      // アップロードが成功したら状態を「uploaded」に更新し、URLを設定
      setAttachments((prev) =>
        prev.map((attachment) =>
          attachment.id === id
            ? { ...attachment, state: "uploaded", url }
            : attachment,
        ),
      );
    } catch (error) {
      console.error(error);
      // アップロードが失敗した場合、状態を「failed」に更新
      setAttachments((prev) =>
        prev.map((attachment) =>
          attachment.id === id
            ? { ...attachment, state: "failed" }
            : attachment,
        ),
      );
      // エラーメッセージを表示
      toast({
        variant: "destructive",
        description: "アップロードに失敗しました",
      });
    }
  }

  /**
   * 指定されたIDのメディアを削除します。
   *
   * @param {string} id - 削除するメディアのID
   */
  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  }

  /**
   * 全てのメディアをクリアします。
   */
  function clearAttachments() {
    setAttachments([]);
  }

  return { attachments, startUpload, removeAttachment, clearAttachments };
}
