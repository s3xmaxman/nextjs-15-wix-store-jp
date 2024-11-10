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
import { ProductsSort } from "@/wix-api/products";
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
    <main className="group flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      <aside
        className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64"
        data-pending={isPending ? "" : undefined}
      >
        <CollectionsFilter
          collections={collections}
          selectedCollectionIds={optimisticFilters.collection}
          updateCollectionIds={(collectionIds) =>
            updateFilters({ collection: collectionIds })
          }
        />
        <PriceFilter
          minDefaultInput={optimisticFilters.price_min}
          maxDefaultInput={optimisticFilters.price_max}
          updatePriceRange={(priceMin, priceMax) =>
            updateFilters({
              price_min: priceMin,
              price_max: priceMax,
            })
          }
        />
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex justify-center lg:justify-end">
          <SortFilter
            sort={optimisticFilters.sort}
            updateSort={(sort) => updateFilters({ sort })}
          />
        </div>
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

function CollectionsFilter({
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

interface PriceFilterProps {
  minDefaultInput: string | undefined;
  maxDefaultInput: string | undefined;
  updatePriceRange: (min: string | undefined, max: string | undefined) => void;
}

function PriceFilter({
  minDefaultInput,
  maxDefaultInput,
  updatePriceRange,
}: PriceFilterProps) {
  const [minInput, setMinInput] = useState(minDefaultInput);
  const [maxInput, setMaxInput] = useState(maxDefaultInput);

  useEffect(() => {
    setMinInput(minDefaultInput || "");
    setMaxInput(maxDefaultInput || "");
  }, [minDefaultInput, maxDefaultInput]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updatePriceRange(minInput, maxInput);
  }

  return (
    <div className="space-y-3">
      <div className="font-bold">商品価格</div>
      <form className="flex items-center gap-2" onSubmit={onSubmit}>
        <Input
          type="number"
          name="min"
          placeholder="最小"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          className="w-20"
        />
        <span>-</span>
        <Input
          type="number"
          name="max"
          placeholder="最大"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          className="w-20"
        />
        <Button type="submit">適用</Button>
      </form>
      {(!!minDefaultInput || !!maxDefaultInput) && (
        <button
          onClick={() => updatePriceRange(undefined, undefined)}
          className="text-sm text-primary hover:underline"
        >
          クリア
        </button>
      )}
    </div>
  );
}

interface SortFilterProps {
  sort: string | undefined;
  updateSort: (value: ProductsSort) => void;
}

function SortFilter({ sort, updateSort }: SortFilterProps) {
  return (
    <Select value={sort || "last_updated"} onValueChange={updateSort}>
      <SelectTrigger className="w-fit gap-2 text-start">
        <span>
          並べ替え: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last_updated">最新</SelectItem>
        <SelectItem value="price_asc">価格（安い順）</SelectItem>
        <SelectItem value="price_desc">価格（高い順）</SelectItem>
      </SelectContent>
    </Select>
  );
}
