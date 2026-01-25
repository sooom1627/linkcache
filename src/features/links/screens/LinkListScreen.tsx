import { useCallback } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "expo-router";

import { FlashList } from "@shopify/flash-list";
import { AlertCircle, RefreshCw } from "lucide-react-native";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListEmpty } from "../components/LinkListEmpty";
import { LinkListFilterMenu } from "../components/LinkListFilterMenu";
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

  // 画面がフォーカスされた時に最新データを取得（UIの表示がガタガタしないように非同期で）
  useFocusEffect(
    useCallback(() => {
      // バックグラウンドで再フェッチ（既存のデータを表示したまま更新）
      void refetch();
    }, [refetch]),
  );

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
    return <LinkListEmpty />;
  }, [isLoading]);

  // 初回ローディング
  if (isLoading) {
    return <ActivityIndicator size="large" color="#6B7280" />;
  }

  // エラー状態
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <View className="mb-4 rounded-full bg-red-50 p-4">
          <AlertCircle size={48} color="#EF4444" strokeWidth={1.5} />
        </View>
        <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
          Something went wrong
        </Text>
        <Text className="mb-8 text-center text-sm leading-5 text-slate-500">
          {error?.message || "Failed to load links. Please try again."}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3 active:bg-slate-700"
        >
          <RefreshCw size={18} color="white" />
          <Text className="font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="relative flex-1 ">
      <View className="absolute right-0 z-50 mt-[12px] flex-row items-center gap-2">
        <LinkListFilterMenu
          isDisabled={
            isLoading || isRefreshing || isError || links.length === 0
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
