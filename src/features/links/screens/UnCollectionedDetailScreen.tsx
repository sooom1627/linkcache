import { useCallback } from "react";

import { ActivityIndicator, Text, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Filter, FolderOpen } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/src/shared/components/EmptyState";
import { ErrorStateView } from "@/src/shared/components/ErrorStateView";
import { colors } from "@/src/shared/constants/colors";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListFilterMenu } from "../components/LinkListFilterMenu";
import { LinkListLoadingFooter } from "../components/LinkListLoadingFooter";
import {
  LinkListFilterProvider,
  useLinkListFilterContext,
} from "../contexts/LinkListFilterContext";
import { useUncollectedLinks } from "../hooks/useUncollectedLinks";
import type { UserLink } from "../types/linkList.types";

export function UnCollectionedDetailScreen() {
  return (
    <LinkListFilterProvider>
      <UnCollectionedDetailScreenContent />
    </LinkListFilterProvider>
  );
}

export function UnCollectionedDetailScreenContent() {
  const { t } = useTranslation();
  const { useLinksOptions, hasActiveFilters, resetFilters } =
    useLinkListFilterContext();
  const {
    links,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    totalCount,
    fetchNextPage,
    refetch,
  } = useUncollectedLinks(useLinksOptions);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: UserLink }) => (
      <View className="py-1">
        <LinkListCard link={item} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: UserLink) => item.status_id, []);

  const renderHeader = useCallback(
    () => (
      <View className="mb-4 gap-2">
        <View className="h-16" />
        <View className="rounded-2xl bg-white p-4">
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center rounded-full bg-slate-100 p-4">
              <FolderOpen size={24} color={colors.icon} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-slate-900">
                {t("links.overview.un_collectioned")}
              </Text>
              <Text
                className="mt-0.5 text-sm text-slate-500"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {totalCount} {t("links.collection_detail.items_count")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    ),
    [t, totalCount],
  );

  const renderFooter = useCallback(
    () => <LinkListLoadingFooter isLoading={isFetchingNextPage} />,
    [isFetchingNextPage],
  );

  const renderEmpty = useCallback(() => {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={<Filter size={40} color={colors.iconMuted} strokeWidth={1.5} />}
          title={t("links.list.filter_empty_title")}
          description={t("links.list.filter_empty_description")}
          actionLabel={t("links.filter.reset")}
          onAction={resetFilters}
          ctaVariant="secondary"
          variant="compact"
        />
      );
    }

    return (
      <EmptyState
        icon={
          <FolderOpen size={40} color={colors.iconMuted} strokeWidth={1.5} />
        }
        title={t("links.overview.un_collectioned_empty_title")}
        description={t("links.overview.un_collectioned_empty_description")}
        variant="compact"
      />
    );
  }, [hasActiveFilters, resetFilters, t]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorStateView
        message={error?.message || t("links.dashboard.error_load_failed")}
        actionLabel={t("common.retry")}
        onAction={refetch}
      />
    );
  }

  return (
    <View className="relative flex-1">
      <View className="absolute bottom-16 right-4 z-50">
        <LinkListFilterMenu
          isDisabled={
            isFetchingNextPage || (links.length === 0 && !hasActiveFilters)
          }
        />
      </View>
      <FlashList
        data={links}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
