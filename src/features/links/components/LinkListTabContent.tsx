import { memo, useCallback } from "react";

import { Pressable, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";

import { FlashList } from "@shopify/flash-list";
import {
  ArrowRight,
  BookCheck,
  Coffee,
  Inbox,
  Library,
  Plus,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/src/shared/components/EmptyState";
import { ErrorStateView } from "@/src/shared/components/ErrorStateView";
import { colors } from "@/src/shared/constants/colors";
import { useModal } from "@/src/shared/providers/ModalContext";

import type { useLinks } from "../hooks/useLinks";
import type { TabType, UserLink } from "../types/linkList.types";

import { LinkListCard } from "./LinkListCard";
import { LinkListSkeleton } from "./LinkListSkeleton";

/** タブごとの View All 遷移先の status パラメータ */
const TAB_VIEW_ALL_STATUS: Record<TabType, string> = {
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

/** Soon タブ用の空状態（全部読みおわった + 次の情報を取り入れよう） */
function EmptyReadSoon() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <EmptyState
      icon={<Coffee size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_read_soon.title")}
      description={t("links.dashboard.empty_read_soon.description")}
      actionLabel={t("links.dashboard.empty_read_soon.go_to_triage")}
      onAction={() => router.push("/swipes")}
      actionIcon={
        <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
      }
      ctaVariant="primary"
      variant="centered"
    />
  );
}

/** Add (Latest) タブ用の空状態（興味があるでOK、気になるものを探そう） */
function EmptyLatest() {
  const { t } = useTranslation();
  const { openModal } = useModal();

  return (
    <EmptyState
      icon={<Inbox size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_latest.title")}
      description={t("links.dashboard.empty_latest.description")}
      actionLabel={t("links.dashboard.empty_latest.add_link")}
      onAction={() => openModal("linkCreate")}
      actionIcon={<Plus size={20} color={colors.accent} strokeWidth={2.5} />}
      ctaVariant="primary"
      variant="centered"
    />
  );
}

/** Stock タブ用の空状態（興味のライブラリ、読まなくてもいい） */
function EmptyStock() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <EmptyState
      icon={<Library size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_stock.title")}
      description={t("links.dashboard.empty_stock.description")}
      actionLabel={t("links.dashboard.empty_stock.go_to_triage")}
      onAction={() => router.push("/swipes")}
      actionIcon={
        <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
      }
      ctaVariant="primary"
      variant="centered"
    />
  );
}

/** Done タブ用の空状態（よく読んだね） */
function EmptyDone() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <EmptyState
      icon={<BookCheck size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_done.title")}
      description={t("links.dashboard.empty_done.description")}
      actionLabel={t("links.dashboard.empty_done.go_to_triage")}
      onAction={() => router.push("/swipes")}
      actionIcon={
        <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
      }
      ctaVariant="primary"
      variant="centered"
    />
  );
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

  const viewAllHref = {
    pathname: "/links" as const,
    params: { status: TAB_VIEW_ALL_STATUS[tabType] },
  };

  const ListFooterComponent = useCallback(
    () => (
      <View className="flex-row items-center justify-center py-4">
        <Link href={viewAllHref} asChild>
          <Pressable className="flex-row items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2">
            <Text className="text-center text-sm text-slate-500">
              {t("links.dashboard.view_all")}
            </Text>
            <ArrowRight size={14} color={colors.icon} strokeWidth={1.5} />
          </Pressable>
        </Link>
      </View>
    ),
    [viewAllHref, t],
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
