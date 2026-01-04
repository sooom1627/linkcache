import { useCallback, useState } from "react";

import { Linking, Pressable, Text, TouchableOpacity, View } from "react-native";

import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { ExternalLink, Globe } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { extractDomain } from "../hooks/useLinkPaste";
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
    case "read_soon":
      return "bg-emerald-400";
    case "later":
      return "bg-amber-400";
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
      className="items-center justify-center rounded-lg bg-slate-50 bg-gradient-to-br"
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
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const statusDotColor = getStatusDotColor(link.status);

  const handleOpenLink = useCallback(() => {
    Linking.openURL(link.url);
  }, [link.url]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const showFallback = !link.image_url || imageError;

  return (
    <Pressable
      onPress={() => {}}
      className="flex-row items-center gap-3 rounded-2xl bg-white/80 p-2 active:bg-slate-50"
    >
      {/* サムネイル */}
      {showFallback ? (
        <ThumbnailFallback />
      ) : (
        <View
          style={{ width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }}
          className="rounded-lg"
        >
          <Image
            source={link.image_url as string}
            style={{
              width: OG_IMAGE_WIDTH,
              height: OG_IMAGE_HEIGHT,
              borderRadius: 8,
            }}
            contentFit="cover"
            transition={150}
            onError={handleImageError}
          />
        </View>
      )}

      {/* コンテンツ */}
      <View className="flex-1 justify-center py-1">
        {/* タイトル */}
        <Text
          className="text-base font-medium leading-5 tracking-tight text-slate-800"
          numberOfLines={2}
        >
          {link.title || link.url}
        </Text>

        {/* メタ情報 */}
        <View className="mt-2 w-full flex-row items-center justify-between gap-2">
          {/* Favicon */}
          {link.favicon_url ? (
            <Image
              source={link.favicon_url as string}
              className="mr-1.5 rounded-full bg-slate-200"
              contentFit="contain"
              style={{ width: 10, height: 10 }}
            />
          ) : (
            <View
              className="rounded-full bg-slate-200"
              style={{ width: 10, height: 10 }}
            >
              <Globe size={10} color="#94a3b8" strokeWidth={1.5} />
            </View>
          )}

          {/* サイト名 */}
          <Text
            className="flex-1 text-xs font-normal tracking-wide text-slate-400"
            numberOfLines={1}
          >
            {link.site_name || extractDomain(link.url)}
          </Text>
          {/* ステータスドット */}
          <View className="flex-row items-center gap-1">
            <View className={`size-1.5 rounded-full ${statusDotColor}`} />
            <Text className="text-xs font-normal tracking-wide text-slate-400">
              {link.status}
            </Text>
          </View>
        </View>
      </View>

      {/* リンクを開くボタン */}
      <TouchableOpacity
        className="ml-2"
        onPress={handleOpenLink}
        hitSlop={16}
        accessibilityRole="button"
        accessibilityLabel={t("links.card.open_link_label")}
        accessibilityHint={t("links.card.open_link_hint")}
      >
        <ExternalLink size={16} color="#94a3b8" strokeWidth={2.5} />
      </TouchableOpacity>
    </Pressable>
  );
}
