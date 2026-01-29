import { useCallback, useMemo, useState } from "react";

import type { TriageStatus } from "../types/linkList.types";

import type { UseLinksOptions } from "./useLinks";

/**
 * ステータスフィルターのオプション
 */
export type StatusFilterOption = "all" | TriageStatus;

/**
 * 既読状態フィルターのオプション
 */
export type ReadStatusFilterOption = "all" | "unread" | "read";

/**
 * フィルター選択状態
 */
export interface LinkListFilterState {
  status: StatusFilterOption;
  readStatus: ReadStatusFilterOption;
}

/**
 * デフォルトのフィルター状態
 */
export const defaultFilterState: LinkListFilterState = {
  status: "all",
  readStatus: "all",
};

/**
 * useLinkListFilter フックの戻り値
 */
export interface UseLinkListFilterReturn {
  /** 現在のフィルター状態 */
  filterState: LinkListFilterState;
  /** ステータスフィルターを更新 */
  setStatus: (status: StatusFilterOption) => void;
  /** 既読状態フィルターを更新 */
  setReadStatus: (readStatus: ReadStatusFilterOption) => void;
  /** すべてのフィルターをリセット */
  resetFilters: () => void;
  /** useLinksフックに渡すオプション形式に変換 */
  useLinksOptions: UseLinksOptions;
  /** アクティブなフィルターの数 */
  activeFilterCount: number;
  /** フィルターが適用されているか */
  hasActiveFilters: boolean;
}

/**
 * リンク一覧のフィルター状態を管理するフック
 *
 * UIのフィルター選択状態を管理し、useLinksフックに渡すオプション形式に変換します。
 *
 * @param initialState - 初期フィルター状態
 * @returns フィルター状態と更新関数
 *
 * @example
 * ```tsx
 * const { filterState, setStatus, useLinksOptions } = useLinkListFilter();
 *
 * // フィルターモーダルで使用
 * <Button onPress={() => setStatus("new")}>New</Button>
 *
 * // useLinksに渡す
 * const { links } = useLinks(useLinksOptions);
 * ```
 */
export function useLinkListFilter(
  initialState: LinkListFilterState = defaultFilterState,
): UseLinkListFilterReturn {
  const [filterState, setFilterState] =
    useState<LinkListFilterState>(initialState);

  const setStatus = useCallback((status: StatusFilterOption) => {
    setFilterState((prev) => ({ ...prev, status }));
  }, []);

  const setReadStatus = useCallback((readStatus: ReadStatusFilterOption) => {
    setFilterState((prev) => ({ ...prev, readStatus }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState(defaultFilterState);
  }, []);

  // フィルター状態をuseLinksオプションに変換
  const useLinksOptions = useMemo<UseLinksOptions>(() => {
    const options: UseLinksOptions = {};

    // statusが'all'以外の場合のみ設定
    if (filterState.status !== "all") {
      options.status = filterState.status;
    }

    // readStatusをisReadに変換
    if (filterState.readStatus === "unread") {
      options.isRead = false;
    } else if (filterState.readStatus === "read") {
      options.isRead = true;
    }

    return options;
  }, [filterState.status, filterState.readStatus]);

  // アクティブなフィルターの数
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.status !== "all") count++;
    if (filterState.readStatus !== "all") count++;
    return count;
  }, [filterState.status, filterState.readStatus]);

  // フィルターが適用されているか
  const hasActiveFilters = activeFilterCount > 0;

  return {
    filterState,
    setStatus,
    setReadStatus,
    resetFilters,
    useLinksOptions,
    activeFilterCount,
    hasActiveFilters,
  };
}
