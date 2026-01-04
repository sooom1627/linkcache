import { useCallback, useRef, useState } from "react";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

import PagerView from "react-native-pager-view";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListEmpty } from "../components/LinkListEmpty";
import { useLinks } from "../hooks/useLinks";

type TabType = "keep" | "latest";

/** ダッシュボード用の表示件数制限 */
const DASHBOARD_LIMIT = 5;

/** カード1件あたりの高さ（OG画像72px + パディング等） */
const CARD_HEIGHT = 100;

/** PagerViewの高さ（5件 + 余白） */
const PAGER_HEIGHT = DASHBOARD_LIMIT * CARD_HEIGHT + 16;

/** タブのインデックス */
const TAB_INDEX = {
  keep: 0,
  latest: 1,
} as const;

/**
 * タブヘッダーコンポーネント
 */
function TabHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  return (
    <View className="flex-row gap-8 border-b border-slate-100 pb-0.5">
      <Pressable
        onPress={() => onTabChange("keep")}
        className={`border-b-2 pb-2 ${
          activeTab === "keep" ? "border-slate-900" : "border-transparent"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            activeTab === "keep" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          Keep
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange("latest")}
        className={`border-b-2 pb-2 ${
          activeTab === "latest" ? "border-slate-900" : "border-transparent"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            activeTab === "latest" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          Latest
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * タブコンテンツコンポーネント
 */
function TabContent({
  isLoading,
  isError,
  error,
  links,
}: {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  links: ReturnType<typeof useLinks>["links"];
}) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-sm text-slate-500">
          {error?.message || "Failed to load links"}
        </Text>
      </View>
    );
  }

  if (links.length === 0) {
    return <LinkListEmpty />;
  }

  return (
    <View>
      {links.map((item) => (
        <View className="py-1" key={item.link_id}>
          <LinkListCard link={item} />
        </View>
      ))}
    </View>
  );
}

/**
 * リンクリストタブコンポーネント
 *
 * スワイプとタブ切り替えでフィルタリングされたリンクリストを表示します。
 * - "Keep" タブ: statusが"keep"のリンクを最大5件表示（APIでフィルタ）
 * - "Latest" タブ: 全てのリンクを最大5件表示（APIでフィルタ）
 */
export function LinkListTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("keep");
  const pagerRef = useRef<PagerView>(null);

  // Keep タブ: status="keep", limit=5
  const keepQuery = useLinks({ status: "keep", limit: DASHBOARD_LIMIT });
  // Latest タブ: limit=5（全ステータス）
  const latestQuery = useLinks({ limit: DASHBOARD_LIMIT });

  // タブヘッダーからの切り替え
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    pagerRef.current?.setPage(TAB_INDEX[tab]);
  }, []);

  // スワイプによるページ切り替え
  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const position = e.nativeEvent.position;
      const newTab = position === 0 ? "keep" : "latest";
      setActiveTab(newTab);
    },
    [],
  );

  return (
    <View>
      <TabHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <PagerView
        ref={pagerRef}
        style={{ height: PAGER_HEIGHT }}
        initialPage={TAB_INDEX[activeTab]}
        onPageSelected={handlePageSelected}
      >
        {/* Keep タブ */}
        <View key="keep">
          <TabContent
            isLoading={keepQuery.isLoading}
            isError={keepQuery.isError}
            error={keepQuery.error}
            links={keepQuery.links}
          />
        </View>

        {/* Latest タブ */}
        <View key="latest">
          <TabContent
            isLoading={latestQuery.isLoading}
            isError={latestQuery.isError}
            error={latestQuery.error}
            links={latestQuery.links}
          />
        </View>
      </PagerView>
    </View>
  );
}
