import { useCallback, useMemo, useRef, useState } from "react";

import { View } from "react-native";

import PagerView from "react-native-pager-view";

import { LinkListTabContent } from "../components/LinkListTabContent";
import { LinkListTabHeader } from "../components/LinkListTabHeader";
import { useLinks } from "../hooks/useLinks";

type TabType = "keep" | "latest";

/** ダッシュボード用の表示件数制限 */
const DASHBOARD_LIMIT = 5;

/** カード1件あたりの高さ（カードコンテンツ + パディング） */
const CARD_HEIGHT = 100;

/** 空状態の高さ（mt-20 + アイコン + テキスト + ボタン + パディング） */
const EMPTY_STATE_HEIGHT = 350;

/** ローディング・エラー状態の高さ */
const LOADING_ERROR_HEIGHT = 100;

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
/**
 * タブの状態とデータから高さを計算
 */
function calculateTabHeight(
  isLoading: boolean,
  isError: boolean,
  linkCount: number,
): number {
  if (isLoading || isError) {
    return LOADING_ERROR_HEIGHT;
  }
  if (linkCount === 0) {
    return EMPTY_STATE_HEIGHT;
  }
  // リンク数 × カード高さ + 上下のパディング
  return linkCount * CARD_HEIGHT + 16;
}

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

  // 各タブの高さを計算
  const keepTabHeight = useMemo(
    () =>
      calculateTabHeight(
        keepQuery.isLoading,
        keepQuery.isError,
        keepQuery.links.length,
      ),
    [keepQuery.isLoading, keepQuery.isError, keepQuery.links.length],
  );

  const latestTabHeight = useMemo(
    () =>
      calculateTabHeight(
        latestQuery.isLoading,
        latestQuery.isError,
        latestQuery.links.length,
      ),
    [latestQuery.isLoading, latestQuery.isError, latestQuery.links.length],
  );

  // PagerViewの高さは両タブの最大値を使用
  const pagerHeight = Math.max(keepTabHeight, latestTabHeight);

  return (
    <View>
      <LinkListTabHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <PagerView
        ref={pagerRef}
        style={{ height: pagerHeight }}
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
            tabType="keep"
          />
        </View>

        {/* Latest タブ */}
        <View key="latest">
          <LinkListTabContent
            isLoading={latestQuery.isLoading}
            isError={latestQuery.isError}
            error={latestQuery.error}
            links={latestQuery.links}
            tabType="latest"
          />
        </View>
      </PagerView>
    </View>
  );
}
