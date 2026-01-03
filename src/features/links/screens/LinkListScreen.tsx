import { useCallback } from "react";

import { ActivityIndicator, RefreshControl, Text, View } from "react-native";

import { FlashList } from "@shopify/flash-list";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListEmpty } from "../components/LinkListEmpty";
import { LinkListLoadingFooter } from "../components/LinkListLoadingFooter";
import { useLinks } from "../hooks/useLinks";
import type { UserLink } from "../types/linkList.types";

/**
 * リンク一覧画面
 *
 * ユーザーが保存したリンクを無限スクロールで表示します。
 * - Pull-to-refresh対応
 * - 無限スクロール対応
 * - ローディング・エラー・空状態のハンドリング
 */
export function LinkListScreen() {
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
  } = useLinks();

  // 次ページ読み込み
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // リストアイテムのレンダリング
  const renderItem = useCallback(
    ({ item }: { item: UserLink }) => <LinkListCard link={item} />,
    [],
  );

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
    return <LinkListEmpty />;
  }, [isLoading]);

  // 初回ローディング
  if (isLoading) {
    return <ActivityIndicator size="large" color="#6B7280" />;
  }

  // エラー状態
  if (isError) {
    return (
      <>
        <View className="items-center">
          <Text className="mb-2 text-center text-lg font-semibold text-red-600">
            Error loading links
          </Text>
          <Text className="text-center text-sm text-gray-500">
            {error?.message || "Something went wrong"}
          </Text>
        </View>
      </>
    );
  }

  return (
    <FlashList
      data={links}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerClassName="pt-4 pb-28"
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
  );
}
