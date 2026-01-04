import { ActivityIndicator, Text, View } from "react-native";

import { ArrowRight } from "lucide-react-native";

import type { useLinks } from "../hooks/useLinks";

import { LinkListCard } from "./LinkListCard";
import { LinkListEmpty } from "./LinkListEmpty";

interface LinkListTabContentProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  links: ReturnType<typeof useLinks>["links"];
}

/**
 * タブコンテンツコンポーネント
 */
export function LinkListTabContent({
  isLoading,
  isError,
  error,
  links,
}: LinkListTabContentProps) {
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
      <View className="flex-row items-center justify-center py-4">
        <Text className="text-sm text-slate-500">View All</Text>
        <ArrowRight size={14} color="#6B7280" strokeWidth={1.5} />
      </View>
    </View>
  );
}
