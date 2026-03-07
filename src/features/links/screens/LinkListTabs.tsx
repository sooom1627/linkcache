import { useCallback, useRef, useState } from "react";

import { View } from "react-native";

import PagerView from "react-native-pager-view";

import { LinkListTabContent } from "../components/LinkListTabContent";
import { LinkListTabHeader } from "../components/LinkListTabHeader";
import { useLinks } from "../hooks/useLinks";
import type { TabType } from "../types/linkList.types";

/** ダッシュボード用の表示件数制限 */
const DASHBOARD_LIMIT = 10;

/** タブのインデックス */
const TAB_INDEX: Record<TabType, number> = {
  read_soon: 0,
  latest: 1,
  stock: 2,
  done: 3,
};

/** position → TabType の逆引き（TAB_INDEX から導出） */
const TAB_BY_INDEX: Record<number, TabType> = Object.fromEntries(
  (Object.entries(TAB_INDEX) as [TabType, number][]).map(([tab, index]) => [
    index,
    tab,
  ]),
);

/**
 * リンクリストタブコンポーネント
 *
 * スワイプとタブ切り替えでフィルタリングされたリンクリストを表示します。
 */

export function LinkListTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("read_soon");
  const pagerRef = useRef<PagerView>(null);

  // Read Soon タブ: status="read_soon", limit=5
  const readSoonQuery = useLinks({
    status: "read_soon",
    limit: DASHBOARD_LIMIT,
    isRead: false,
  });
  // Latest タブ: limit=5（newステータス）
  const latestQuery = useLinks({
    limit: DASHBOARD_LIMIT,
    isRead: false,
    status: "new",
  });

  // Stock, Done はまだ実装しない（UIのみ）
  // 将来的には useLinks を追加する

  // タブヘッダーからの切り替え
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    pagerRef.current?.setPage(TAB_INDEX[tab]);
  }, []);

  // スワイプによるページ切り替え
  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const newTab =
        TAB_BY_INDEX[e.nativeEvent.position] ?? ("read_soon" as TabType);
      setActiveTab(newTab);
    },
    [],
  );

  return (
    <View className="flex-1 flex-col">
      <LinkListTabHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={TAB_INDEX[activeTab]}
        onPageSelected={handlePageSelected}
      >
        {/* Read Soon タブ */}
        <View key="read_soon" className="flex-1">
          <LinkListTabContent
            isLoading={readSoonQuery.isLoading}
            isError={readSoonQuery.isError}
            error={readSoonQuery.error}
            links={readSoonQuery.links}
            tabType="read_soon"
          />
        </View>

        {/* Latest タブ */}
        <View key="latest" className="flex-1">
          <LinkListTabContent
            isLoading={latestQuery.isLoading}
            isError={latestQuery.isError}
            error={latestQuery.error}
            links={latestQuery.links}
            tabType="latest"
          />
        </View>

        {/* Stock タブ (UIのみ) */}
        <View key="stock" className="flex-1">
          <LinkListTabContent
            isLoading={false}
            isError={false}
            error={null}
            links={[]} // 空データ
            tabType="stock"
          />
        </View>

        {/* Done タブ (UIのみ) */}
        <View key="done" className="flex-1">
          <LinkListTabContent
            isLoading={false}
            isError={false}
            error={null}
            links={[]} // 空データ
            tabType="done"
          />
        </View>
      </PagerView>
    </View>
  );
}
