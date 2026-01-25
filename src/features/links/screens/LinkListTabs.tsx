import { useCallback, useMemo, useRef, useState } from "react";

import { View } from "react-native";

import { useFocusEffect } from "expo-router";

import PagerView from "react-native-pager-view";

import { LinkListTabContent } from "../components/LinkListTabContent";
import { LinkListTabHeader } from "../components/LinkListTabHeader";
import { useLinks } from "../hooks/useLinks";

type TabType = "read_soon" | "latest";

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
  latest: 0,
  read_soon: 1,
} as const;

/**
 * リンクリストタブコンポーネント
 *
 * スワイプとタブ切り替えでフィルタリングされたリンクリストを表示します。
 * - "Read Soon" タブ: statusが"read_soon"のリンクを最大5件表示（APIでフィルタ）
 * - "Latest" タブ: statusが"inbox"のリンクを最大5件表示（APIでフィルタ）
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
  const [activeTab, setActiveTab] = useState<TabType>("latest");
  const pagerRef = useRef<PagerView>(null);

  // Read Soon タブ: status="read_soon", limit=5
  const readSoonQuery = useLinks({
    status: "read_soon",
    limit: DASHBOARD_LIMIT,
    isRead: false,
  });
  // Latest タブ: limit=5（inboxステータス）
  const latestQuery = useLinks({
    limit: DASHBOARD_LIMIT,
    isRead: false,
    status: "inbox",
  });

  // 画面がフォーカスされた時に最新データを取得（UIの表示がガタガタしないように非同期で）
  useFocusEffect(
    useCallback(() => {
      // バックグラウンドで再フェッチ（既存のデータを表示したまま更新）
      void readSoonQuery.refetch();
      void latestQuery.refetch();
    }, [readSoonQuery, latestQuery]),
  );

  // タブヘッダーからの切り替え
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    pagerRef.current?.setPage(TAB_INDEX[tab]);
  }, []);

  // スワイプによるページ切り替え
  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const position = e.nativeEvent.position;
      const newTab = position === 0 ? "latest" : "read_soon";
      setActiveTab(newTab);
    },
    [],
  );

  // 各タブの高さを計算
  const readSoonTabHeight = useMemo(
    () =>
      calculateTabHeight(
        readSoonQuery.isLoading,
        readSoonQuery.isError,
        readSoonQuery.links.length,
      ),
    [
      readSoonQuery.isLoading,
      readSoonQuery.isError,
      readSoonQuery.links.length,
    ],
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
  const pagerHeight = Math.max(readSoonTabHeight, latestTabHeight);

  return (
    <View>
      <LinkListTabHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <PagerView
        ref={pagerRef}
        style={{ height: pagerHeight }}
        initialPage={TAB_INDEX[activeTab]}
        onPageSelected={handlePageSelected}
      >
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

        {/* Read Soon タブ */}
        <View key="read_soon">
          <LinkListTabContent
            isLoading={readSoonQuery.isLoading}
            isError={readSoonQuery.isError}
            error={readSoonQuery.error}
            links={readSoonQuery.links}
            tabType="read_soon"
          />
        </View>
      </PagerView>
    </View>
  );
}
