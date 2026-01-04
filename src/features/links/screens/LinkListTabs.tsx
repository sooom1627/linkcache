import { useState } from "react";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListEmpty } from "../components/LinkListEmpty";
import { useLinks } from "../hooks/useLinks";

type TabType = "keep" | "latest";

/** ダッシュボード用の表示件数制限 */
const DASHBOARD_LIMIT = 5;

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
 * リンクリストタブコンポーネント
 *
 * タブ切り替えとフィルタリングされたリンクリストを表示します。
 * - "Keep" タブ: statusが"keep"のリンクを最大5件表示（APIでフィルタ）
 * - "Latest" タブ: 全てのリンクを最大5件表示（APIでフィルタ）
 */
export function LinkListTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("keep");

  // Keep タブ: status="keep", limit=5
  const keepQuery = useLinks({ status: "keep", limit: DASHBOARD_LIMIT });
  // Latest タブ: limit=5（全ステータス）
  const latestQuery = useLinks({ limit: DASHBOARD_LIMIT });

  // アクティブなタブに応じてデータを選択
  const activeQuery = activeTab === "keep" ? keepQuery : latestQuery;
  const { links, isLoading, isError, error } = activeQuery;

  // ローディング状態
  if (isLoading) {
    return (
      <>
        <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      </>
    );
  }

  // エラー状態
  if (isError) {
    return (
      <>
        <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-sm text-slate-500">
            {error?.message || "Failed to load links"}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Link List */}
      <View className="">
        {links.length === 0 ? (
          <LinkListEmpty />
        ) : (
          links.map((item) => (
            <View className="py-1" key={item.link_id}>
              <LinkListCard link={item} />
            </View>
          ))
        )}
      </View>
    </>
  );
}
