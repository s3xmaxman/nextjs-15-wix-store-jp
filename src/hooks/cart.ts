import { wixBrowserClient } from "@/lib/wix-client.browser";
import { addToCart, getCart } from "@/wix-api/cart";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { useToast } from "./use-toast";

export function useCart(initialData: currentCart.Cart | null) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart(wixBrowserClient),
    initialData,
  });
}
