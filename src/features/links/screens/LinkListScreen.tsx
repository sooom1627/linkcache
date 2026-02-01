import { useCallback, useMemo } from "react";

import { ActivityIndicator, RefreshControl, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";

import { ErrorStateView } from "@/src/shared/components/ErrorStateView";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListEmpty } from "../components/LinkListEmpty";
import { LinkListFilterMenu } from "../components/LinkListFilterMenu";
import { LinkListLoadingFooter } from "../components/LinkListLoadingFooter";
import {
  LinkListFilterProvider,
  useLinkListFilterContext,
} from "../contexts/LinkListFilterContext";
import type { LinkListFilterState } from "../hooks/useLinkListFilter";
import { useLinks } from "../hooks/useLinks";
import type { TriageStatus, UserLink } from "../types/linkList.types";

/**
 * 有効なTriageStatusのリスト
 */
const VALID_TRIAGE_STATUSES: readonly TriageStatus[] = [
  "new",
  "read_soon",
  "stock",
  "done",
] as const;

/**
 * 有効なTriageStatusかどうかをチェック
 */
const isValidTriageStatus = (
  status: string | string[] | undefined,
): status is TriageStatus => {
  if (typeof status !== "string") return false;
  return VALID_TRIAGE_STATUSES.includes(status as TriageStatus);
};

/**
 * URLパラメータから初期フィルター状態を構築
 */
const buildInitialStateFromParams = (
  params: Record<string, string | string[] | undefined>,
): LinkListFilterState | undefined => {
  const { status } = params;

  // statusパラメータが有効な場合のみ初期状態を構築
  if (isValidTriageStatus(status)) {
    return {
      status,
      readStatus: "all",
    };
  }

  // パラメータがない場合はundefinedを返してデフォルト状態を使用
  return undefined;
};

/**
 * リンク一覧画面
 *
 * ユーザーが保存したリンクを無限スクロールで表示します。
 * - Pull-to-refresh対応
 * - 無限スクロール対応
 * - ローディング・エラー・空状態のハンドリング
 * - フィルター機能（ステータス・既読状態）
 * - URLパラメータからの初期フィルター状態の設定
 */
export function LinkListScreen() {
  const params = useLocalSearchParams();
  const initialState = useMemo(
    () => buildInitialStateFromParams(params),
    [params],
  );

  return (
    <LinkListFilterProvider initialState={initialState}>
      <LinkListScreenContent />
    </LinkListFilterProvider>
  );
}

/**
 * リンク一覧画面の内部コンポーネント
 *
 * フィルターコンテキストを使用してリンク一覧を表示します。
 */
function LinkListScreenContent() {
  const { t } = useTranslation();
  const { useLinksOptions, hasActiveFilters, resetFilters } =
    useLinkListFilterContext();

  const {
    links,
    isLoading,
    isFetchingNextPage,
    isRefreshing,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useLinks(useLinksOptions);

  // 次ページ読み込み
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // リストアイテムのレンダリング
  const renderItem = useCallback(
    ({ item }: { item: UserLink }) => (
      <View className="py-1">
        <LinkListCard link={item} />
      </View>
    ),
    [],
  );

  const renderTopMarginComponent = useCallback(() => {
    return <View className="h-16" />;
  }, []);

  // キー抽出
  const keyExtractor = useCallback((item: UserLink) => item.status_id, []);

  // フッターコンポーネント
  const renderFooter = useCallback(
    () => <LinkListLoadingFooter isLoading={isFetchingNextPage} />,
    [isFetchingNextPage],
  );

  // 空状態コンポーネント
  const renderEmpty = useCallback(() => {
    // ローディング中は空状態を表示しない
    if (isLoading) {
      return null;
    }
    return (
      <LinkListEmpty
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />
    );
  }, [isLoading, hasActiveFilters, resetFilters]);

  // 初回ローディング
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  // エラー状態
  if (isError) {
    return (
      <ErrorStateView
        message={error?.message || "Failed to load links. Please try again."}
        actionLabel={t("common.retry")}
        onAction={refetch}
      />
    );
  }

  return (
    <View className="relative flex-1 ">
      <View className="absolute right-0 z-50 mt-[12px] flex-row items-center gap-2">
        <LinkListFilterMenu
          isDisabled={
            isLoading ||
            isRefreshing ||
            isError ||
            (links.length === 0 && !hasActiveFilters)
          }
        />
      </View>
      <FlashList
        data={links}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerClassName="mt-2 pb-32"
        ListHeaderComponent={renderTopMarginComponent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#6B7280"
          />
        }
      />
    </View>
  );
}
