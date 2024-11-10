"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collections } from "@wix/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";

interface SearchFilterLayoutProps {
  collections: collections.Collection[];
  children: React.ReactNode;
}

export default function SearchFilterLayout({
  collections,
  children,
}: SearchFilterLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    collection: searchParams.getAll("collection"),
    price_min: searchParams.get("price_min") || undefined,
    price_max: searchParams.get("price_max") || undefined,
    sort: searchParams.get("sort") || undefined,
  });

  const [isPending, startTransition] = useTransition();

  /**
   * 現在のオプティミスティックフィルター状態を更新し、URLパラメータを反映してルーターを遷移させる
   * @param updates - 現在のフィルター状態を更新するための変更
   */
  function updateFilters(updates: Partial<typeof optimisticFilters>) {
    // 現在のオプティミスティックフィルターと新しい更新をマージ
    const newState = { ...optimisticFilters, ...updates };

    // URLSearchParamsオブジェクトを作成し、現在の検索パラメータをコピー
    const newSearchParams = new URLSearchParams(searchParams);

    // 新しいフィルター状態をURLSearchParamsに反映
    Object.entries(newState).forEach(([key, value]) => {
      // 既存のキーを削除
      newSearchParams.delete(key);

      // 値が配列の場合、各要素を追加
      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      }
      // 値がundefinedやnullでない場合、セット
      else if (value !== undefined && value !== null) {
        newSearchParams.set(key, value.toString());
      }
    });

    // ページ番号をリセットして、最初のページから再検索させる
    newSearchParams.delete("page");

    // オプティミスティックUI更新とルーターの遷移を非同期で行う
    // startTransitionを使用することで、UIの更新がスムーズになる
    startTransition(() => {
      setOptimisticFilters(newState);
      router.push(`?${newSearchParams.toString()}`);
    });
  }

  return (
    <main className="flex flex-col items-center justify-center gap-10 px-5 lg:flex-row lg:items-start">
      <aside className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64">
        <CollectionFilter
          collections={collections}
          selectedCollectionIds={optimisticFilters.collection}
          updateCollectionIds={(collectionIds) =>
            updateFilters({ collection: collectionIds })
          }
        />
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex justify-center lg:justify-end">sort filter</div>
        {children}
      </div>
    </main>
  );
}

interface CollectionFilterProps {
  collections: collections.Collection[];
  selectedCollectionIds: string[];
  updateCollectionIds: (collectionIds: string[]) => void;
}

function CollectionFilter({
  collections,
  selectedCollectionIds,
  updateCollectionIds,
}: CollectionFilterProps) {
  return (
    <div className="space-y-3">
      <div className="font-bold">Collections</div>
      <ul className="space-y-1.5">
        {collections.map((collection) => {
          const collectionId = collection._id;
          if (!collectionId) return null;
          return (
            <li key={collectionId}>
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <Checkbox
                  id={collectionId}
                  checked={selectedCollectionIds.includes(collectionId)}
                  onCheckedChange={(checked) => {
                    updateCollectionIds(
                      checked
                        ? [...selectedCollectionIds, collectionId]
                        : selectedCollectionIds.filter(
                            (id) => id !== collectionId,
                          ),
                    );
                  }}
                />
                <span className="line-clamp-1 break-all">
                  {collection.name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {selectedCollectionIds.length > 0 && (
        <button
          onClick={() => updateCollectionIds([])}
          className="text-sm text-primary hover:underline"
        >
          クリア
        </button>
      )}
    </div>
  );
}
