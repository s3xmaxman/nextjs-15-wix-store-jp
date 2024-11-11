import { wixBrowserClient } from "@/lib/wix-client.browser";
import { updateMemberInfo, UpdateMemberInfoValues } from "@/wix-api/members";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "./use-toast";

/**
 * 会員情報を更新するためのカスタムフックです。
 *
 * このフックは、会員情報の更新を管理し、成功時にはトースト通知を表示し、
 * 2秒後にページをリフレッシュします。エラーが発生した場合も適切な通知を行います。
 *
 * @returns {Object} useMutationオブジェクトを含むオブジェクト
 *   - `mutate`: 会員情報を更新するための関数
 *   - `isLoading`: 更新処理が進行中かどうかを示すブール値
 *   - `isError`: 更新処理中にエラーが発生したかどうかを示すブール値
 *   - `error`: エラー情報（エラーが発生した場合）
 */
export function useUpdateMember() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: UpdateMemberInfoValues) =>
      updateMemberInfo(wixBrowserClient, values),
    onSuccess() {
      toast({
        description: "会員情報を更新しました",
      });
      setTimeout(() => {
        router.refresh();
      }, 2000);
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "会員情報の更新に失敗しました",
      });
    },
  });
}
