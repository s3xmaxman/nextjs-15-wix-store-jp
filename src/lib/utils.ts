import { products } from "@wix/stores";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import tailwindConfig from "../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

export const twConfig = resolveConfig(tailwindConfig);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCurrency(
  price: number | string = 0,
  currency: string = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price));
}

/**
 * 選択されたオプションに一致する商品のバリアントを見つけます。
 *
 * 商品にバリアントが存在しない場合、または選択されたオプションが空の場合、
 * 商品の最初のバリアントを返します。それ以外の場合は、選択されたオプションに
 * 一致するバリアントを返します。
 *
 * @param product - バリアントを見つける商品
 * @param selectedOptions - 一致させる選択されたオプション
 * @returns 一致するバリアント、または一致するバリアントがない場合は `null`
 */
export function findVariant(
  product: products.Product,
  selectedOptions: Record<string, string>,
) {
  if (!product.manageVariants) {
    return null;
  }

  // 選択されたオプションが空の場合は、最初のバリアントを返す
  if (Object.keys(selectedOptions).length === 0) {
    return product.variants?.[0] || null;
  }

  // 選択されたオプションに基づいてバリアントを検索
  const matchingVariant = product.variants?.find((variant) => {
    // 各選択されたオプションがバリアントの選択肢と一致するか確認
    for (const [optionKey, optionValue] of Object.entries(selectedOptions)) {
      if (variant.choices?.[optionKey] !== optionValue) {
        return false;
      }
    }
    return true;
  });

  return matchingVariant || null;
}

/**
 * 商品またはバリアントの在庫状況を確認します。
 *
 * 商品がバリアントを管理している場合、この関数は選択されたオプションに
 * 一致するバリアントの在庫状況を確認します。そうでない場合は、
 * 商品自体の在庫状況を確認します。
 *
 * @param product 確認する商品
 * @param selectedOptions バリアントを見つける際に使用する選択されたオプション
 * @returns 商品またはバリアントが在庫ありの場合は `true`、そうでない場合は `false`
 */
export function checkInStock(
  product: products.Product,
  selectedOptions: Record<string, string>,
) {
  const variant = findVariant(product, selectedOptions);

  return variant
    ? variant.stock?.quantity !== 0 && variant.stock?.inStock
    : product.stock?.inventoryStatus === products.InventoryStatus.IN_STOCK ||
        product.stock?.inventoryStatus ===
          products.InventoryStatus.PARTIALLY_OUT_OF_STOCK;
}
