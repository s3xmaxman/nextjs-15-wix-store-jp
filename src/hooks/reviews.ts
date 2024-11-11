import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  createProductReview,
  CreateProductReviewValues,
} from "@/wix-api/reviews";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";

/**
 * 商品レビューを作成するためのカスタムフックです。
 *
 * @returns {Object} useMutationの結果オブジェクト
 */

export function useCreateProductReview() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: CreateProductReviewValues) =>
      createProductReview(wixBrowserClient, values),
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "何か問題が発生しました。もう一度お試しくください。",
      });
    },
  });
}
