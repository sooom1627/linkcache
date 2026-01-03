import { useCallback, useState } from "react";

import { Linking, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import type { TriageStatus, UserLink } from "../types/linkList.types";

interface LinkListCardProps {
  link: UserLink;
}

/**
 * ステータスに応じたドットカラーを取得
 */
const getStatusDotColor = (status: TriageStatus | null): string => {
  switch (status) {
    case "inbox":
      return "bg-sky-400";
    case "keep":
      return "bg-emerald-400";
    case "archived":
      return "bg-slate-300";
    case "dismissed":
      return "bg-rose-400";
    default:
      return "bg-slate-300";
  }
};

/** OG画像サイズ（1.91:1 比率） */
const OG_IMAGE_HEIGHT = 72;
const OG_IMAGE_WIDTH = Math.round(OG_IMAGE_HEIGHT * 1.91);

/**
 * サムネイルのフォールバックコンポーネント
 * ミニマルなグラデーション背景
 */
function ThumbnailFallback() {
  return (
    <View
      className="items-center justify-center rounded-lg bg-gradient-to-br bg-slate-50"
      style={{ width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }}
    >
      <Ionicons name="link-outline" size={24} color="#CBD5E1" />
    </View>
  );
}

/**
 * リンクカードコンポーネント
 *
 * ミニマルで洗練されたデザイン
 * 左にサムネイル、右にコンテンツを配置
 */
export function LinkListCard({ link }: LinkListCardProps) {
  const [imageError, setImageError] = useState(false);
  const statusDotColor = getStatusDotColor(link.status);

  const handlePress = useCallback(() => {
    Linking.openURL(link.url);
  }, [link.url]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const showFallback = !link.image_url || imageError;

  return (
    <Pressable
      onPress={handlePress}
      className="mb-2 flex-row items-center rounded-2xl bg-white/80 active:bg-slate-50"
    >
      {/* サムネイル */}
      {showFallback ? (
        <ThumbnailFallback />
      ) : (
        <View style={{ width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }} className="rounded-lg">
        <Image
          source={link.image_url as string}
          style={{ width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, borderRadius: 8 }}
          contentFit="cover"
          transition={150}
          onError={handleImageError}
          />
        </View>
      )}

      {/* コンテンツ */}
      <View className="ml-4 flex-1 justify-center py-1">
        {/* タイトル */}
        <Text
          className="text-[15px] font-medium leading-5 tracking-tight text-slate-800"
          numberOfLines={2}
        >
          {link.title || link.url}
        </Text>

        {/* メタ情報 */}
        <View className="mt-2 flex-row items-center">
          {/* ステータスドット */}
          <View className={`mr-2 size-1.5 rounded-full ${statusDotColor}`} />

          {/* Favicon */}
          {link.favicon_url && (
            <Image
              source={link.favicon_url}
              className="mr-1.5 size-3.5 rounded"
              contentFit="contain"
            />
          )}

          {/* サイト名 */}
          <Text
            className="flex-1 text-xs font-normal tracking-wide text-slate-400"
            numberOfLines={1}
          >
            {link.site_name || new URL(link.url).hostname}
          </Text>
        </View>
      </View>

      {/* 右矢印アイコン */}
      <View className="ml-2">
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
    </Pressable>
  );
}
