import { useCallback, useRef, useState } from "react";

import { View } from "react-native";

import PagerView from "react-native-pager-view";

import { LinkListTabContent } from "../components/LinkListTabContent";
import { LinkListTabHeader } from "../components/LinkListTabHeader";
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
      <LinkListTabHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <PagerView
        ref={pagerRef}
        style={{ height: PAGER_HEIGHT }}
        initialPage={TAB_INDEX[activeTab]}
        onPageSelected={handlePageSelected}
      >
        {/* Keep タブ */}
        <View key="keep">
          <LinkListTabContent
            isLoading={keepQuery.isLoading}
            isError={keepQuery.isError}
            error={keepQuery.error}
            links={keepQuery.links}
          />
        </View>

        {/* Latest タブ */}
        <View key="latest">
          <LinkListTabContent
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
