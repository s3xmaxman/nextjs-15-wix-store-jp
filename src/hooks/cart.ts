import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  addToCart,
  AddToCartValues,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  UpdateCartItemQuantityValues,
} from "@/wix-api/cart";
import {
  MutationKey,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { useToast } from "./use-toast";

const queryKey: QueryKey = ["cart"];

/**
 * カート情報を取得するためのカスタムフックです。
 * @param {currentCart.Cart | null} initialData - 初期データとして使用するカート情報
 * @returns {Object} useQueryの結果オブジェクト
 */
export function useCart(initialData: currentCart.Cart | null) {
  return useQuery({
    queryKey,
    queryFn: () => getCart(wixBrowserClient),
    initialData,
  });
}

/**
 * カートに商品を追加するためのカスタムフックです。
 * @returns {Object} useMutationの結果オブジェクト
 */
export function useAddItemToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: AddToCartValues) =>
      addToCart(wixBrowserClient, values),
    onSuccess: (data) => {
      toast({
        description: "商品をカートに追加しました",
      });
      queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, data.cart);
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "商品の追加に失敗しました",
      });
    },
  });
}

/**
 * カート内の商品の数量を更新するためのカスタムフックです。
 * @returns {Object} useMutationの結果オブジェクト
 */
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();
  const mutationKey: MutationKey = ["updateCartItemQuantity"];
  const { toast } = useToast();

  return useMutation({
    mutationKey,
    mutationFn: (values: UpdateCartItemQuantityValues) =>
      updateCartItemQuantity(wixBrowserClient, values),
    onMutate: async ({ productId, newQuantity }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);

      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.map((lineItem) =>
          lineItem._id === productId
            ? { ...lineItem, quantity: newQuantity }
            : lineItem,
        ),
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "商品の更新に失敗しました",
      });
    },
    onSettled() {
      if (queryClient.isMutating({ mutationKey }) === 1) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

/**
 * カートから商品を削除するためのカスタムフックです。
 * @returns {Object} useMutationの結果オブジェクト
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) =>
      removeCartItem(wixBrowserClient, productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);

      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.filter(
          (lineItem) => lineItem._id !== productId,
        ),
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "商品の削除に失敗しました",
      });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(wixBrowserClient),
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
      queryClient.invalidateQueries({ queryKey });
    },
    retry: 3,
  });
}
