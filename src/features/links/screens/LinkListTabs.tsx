import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { LinkListCard } from "../components/LinkListCard";
import type { UserLink } from "../types/linkList.types";

type TabType = "keep" | "latest";

interface LinkListTabsProps {
  links: UserLink[];
}

/**
 * リンクリストタブコンポーネント
 *
 * タブ切り替えとフィルタリングされたリンクリストを表示します。
 * - "For you" タブ: statusが"keep"のリンクのみ表示
 * - "Latest" タブ: 全てのリンクを表示
 */
export function LinkListTabs({ links }: LinkListTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("keep");

  // Filter Logic
  const displayData = links.filter((item) => {
    if (activeTab === "keep") return item.status === "keep";
    // Latest shows everything sorted by saved_at
    return true;
  });

  return (
    <>
      {/* Tabs */}
      <View className="flex-row gap-8 border-b border-slate-100 pb-0.5">
        <Pressable
          onPress={() => setActiveTab("keep")}
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
          onPress={() => setActiveTab("latest")}
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
      {/* Link List */}
      <View className="">
        {displayData.map((item) => (
          <View className="py-1" key={item.link_id}>
            <LinkListCard link={item} />
          </View>
        ))}
      </View>
    </>
  );
}
