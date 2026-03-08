import { memo, useCallback, useMemo } from "react";

import { View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorStateView } from "@/src/shared/components/ErrorStateView";

import type { useLinks } from "../hooks/useLinks";
import type { TabType, TriageStatus, UserLink } from "../types/linkList.types";

import { LinkListCard } from "./LinkListCard";
import {
  EmptyDone,
  EmptyLatest,
  EmptyReadSoon,
  EmptyStock,
} from "./LinkListEmptyStates";
import { LinkListSkeleton } from "./LinkListSkeleton";
import { LinkListViewAllFooter } from "./LinkListViewAllFooter";

/** タブごとの View All 遷移先の status パラメータ */
const TAB_VIEW_ALL_STATUS: Record<TabType, TriageStatus> = {
  read_soon: "read_soon",
  latest: "new",
  stock: "stock",
  done: "done",
};

interface LinkListTabContentProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  links: ReturnType<typeof useLinks>["links"];
  tabType: TabType;
}

/**
 * タブコンテンツコンポーネント
 *
 * FlashList でリンクリストを仮想化表示。PagerView 内でネストされる。
 */
/** 下部ナビゲーションバーの高さ（スクロール時に最後の項目が隠れないよう余白を確保） */
const TAB_BAR_HEIGHT = 56;

export const LinkListTabContent = memo(function LinkListTabContent({
  isLoading,
  isError,
  error,
  links,
  tabType,
}: LinkListTabContentProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: UserLink }) => (
      <View className="py-1">
        <LinkListCard link={item} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: UserLink) => item.status_id, []);

  const viewAllHref = useMemo(
    () => ({
      pathname: "/links" as const,
      params: { status: TAB_VIEW_ALL_STATUS[tabType] },
    }),
    [tabType],
  );

  const ListFooterComponent = useCallback(
    () => <LinkListViewAllFooter viewAllHref={viewAllHref} />,
    [viewAllHref],
  );

  const ListEmptyComponent = useCallback(() => {
    switch (tabType) {
      case "read_soon":
        return <EmptyReadSoon />;
      case "latest":
        return <EmptyLatest />;
      case "stock":
        return <EmptyStock />;
      case "done":
        return <EmptyDone />;
    }
  }, [tabType]);

  if (isLoading) {
    return (
      <LinkListSkeleton
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT,
        }}
      />
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ErrorStateView
          message={error?.message || t("links.dashboard.error_load_failed")}
        />
      </View>
    );
  }

  return (
    <FlashList
      data={links}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={links.length > 0 ? ListFooterComponent : undefined}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT }}
      showsVerticalScrollIndicator={false}
    />
  );
});
