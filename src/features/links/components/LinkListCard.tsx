import { useCallback, useEffect, useRef, useState } from "react";

import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Check, Circle, ExternalLink, Globe } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

import { extractDomain } from "../hooks/useLinkPaste";
import { useOpenLink } from "../hooks/useOpenLink";
import type { UserLink } from "../types/linkList.types";
import { getStatusStyle } from "../utils/statusStyles";

import { LinkReadStatusModal } from "./LinkReadStatusModal";

interface LinkListCardProps {
  link: UserLink;
}

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
  const router = useRouter();
  const { openLink } = useOpenLink();
  const { ref, present, dismiss } = useBottomSheetModal();
  const [imageError, setImageError] = useState(false);
  const statusStyle = getStatusStyle(link.status);
  const isRead = link.read_at !== null;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(() => {
    router.push(`/link/${link.link_id}`);
  }, [router, link.link_id]);

  const handleOpenLink = useCallback(() => {
    openLink(link.url);
    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // 500ms後にモーダルを表示
    timeoutRef.current = setTimeout(() => {
      present();
      timeoutRef.current = null;
    }, 500);
  }, [openLink, present, link.url]);

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleLongPress = useCallback(() => {
    present();
  }, [present]);

  const handleImageError = () => {
    setImageError(true);
  };

  const showFallback = !link.image_url || imageError;

  return (
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
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
            {/* ステータス表示 */}
            {isRead ? (
              // 既読: シンプルなアイコン+テキスト
              <View className="flex-row items-center gap-1.5">
                <Check
                  size={12}
                  color="#94a3b8" // slate-400
                  strokeWidth={2.5}
                />
                <Text className="text-xs font-normal text-slate-400">
                  {t("links.card.status.read")}
                </Text>
              </View>
            ) : (
              // 未読: シンプルなアイコン+テキスト
              <View className="flex-row items-center gap-1.5">
                <Circle
                  size={8}
                  fill={statusStyle.icon}
                  color={statusStyle.icon}
                />
                <Text className={`text-xs font-medium ${statusStyle.text}`}>
                  {link.status
                    ? t(`links.card.action_modal.status.${link.status}`, {
                        defaultValue: link.status,
                      })
                    : ""}
                </Text>
              </View>
            )}
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

      {/* 既読状態モーダル */}
      <LinkReadStatusModal ref={ref} link={link} onClose={dismiss} />
    </>
  );
}
