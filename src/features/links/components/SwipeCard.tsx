import { Text, View } from "react-native";

import { Image } from "expo-image";

import { Globe, Link2 } from "lucide-react-native";

import type { UserLink } from "../types/linkList.types";

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
    <View className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* OG画像 */}
      {link.image_url ? (
        <Image
          source={{ uri: link.image_url }}
          style={{ width: "100%", height: 170 }}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSjE.AyE_3t7t7R**0o#DgR4" }}
          transition={200}
        />
      ) : (
        <View className="h-32 items-center justify-center bg-slate-50">
          <Link2 size={32} color="#cbd5e1" strokeWidth={1.5} />
        </View>
      )}

      {/* コンテンツ */}
      <View className="gap-2 p-3">
        {/* タイトル */}
        <Text
          className="text-base font-medium text-slate-800"
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
