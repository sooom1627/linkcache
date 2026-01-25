import { Dimensions, Text, View } from "react-native";

import { Image } from "expo-image";

import { Globe, Link2 } from "lucide-react-native";

import type { UserLink } from "../types/linkList.types";

const CARD_WIDTH = Dimensions.get("window").width - 40;

interface SwipeCardProps {
  link: UserLink;
  /** カードのインデックス（0: top, 1: next, 2: queued） */
  index?: number;
}

/**
 * URLからドメインを抽出する
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * スワイプ可能なカードコンポーネント
 *
 * OGP画像、タイトル、URLを表示します。
 * スタック表示用にindexプロパティを受け取ります。
 */
export function SwipeCard({ link }: SwipeCardProps) {
  const domain = extractDomain(link.url);

  return (
    <View
      style={{
        width: CARD_WIDTH,
        overflow: "hidden",
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 270,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      {/* OG画像 */}
      {link.image_url ? (
        <Image
          source={{ uri: link.image_url }}
          style={{ width: "100%", aspectRatio: 1.91 }}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSjE.AyE_3t7t7R**0o#DgR4" }}
          transition={200}
        />
      ) : (
        <View className="h-[170px] w-full items-center justify-center bg-slate-50">
          <Link2 size={32} color="#cbd5e1" strokeWidth={1.5} />
        </View>
      )}

      {/* コンテンツ */}
      <View className="flex w-full flex-col items-start justify-center gap-2 px-3 py-4">
        {/* タイトル */}
        <Text
          className="line-clamp-2 w-full text-left text-base font-medium text-slate-800"
          numberOfLines={2}
        >
          {link.title || "No title"}
        </Text>

        {/* ドメイン */}
        <View className="flex-row items-center gap-2">
          {link.favicon_url ? (
            <Image
              source={{ uri: link.favicon_url }}
              style={{ width: 14, height: 14 }}
              contentFit="contain"
            />
          ) : (
            <Globe size={14} color="#94a3b8" strokeWidth={1.5} />
          )}
          <Text className="text-sm text-slate-400">
            {domain || link.site_name || ""}
          </Text>
        </View>
      </View>
    </View>
  );
}
