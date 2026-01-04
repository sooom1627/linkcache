import { useCallback } from "react";

import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { Calendar, Clock, ExternalLink, Globe } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";
import { formatDateTime } from "@/src/shared/utils/timezone";

import { LinkReadStatusModal } from "../components/LinkReadStatusModal";
import { useLinkDetail } from "../hooks/useLinkDetail";
import { extractDomain } from "../hooks/useLinkPaste";
import { useOpenLink } from "../hooks/useOpenLink";
import type { TriageStatus } from "../types/linkList.types";

interface LinkDetailScreenProps {
  linkId: string;
}

/**
 * ステータスに応じたドットカラーを取得
 */
const getStatusColor = (status: TriageStatus | null): string => {
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

/**
 * ステータスに応じたテキストカラーを取得
 */
const getStatusTextColor = (status: TriageStatus | null): string => {
  switch (status) {
    case "inbox":
      return "text-sky-600";
    case "read_soon":
      return "text-emerald-600";
    case "later":
      return "text-amber-600";
    default:
      return "text-slate-500";
  }
};

/**
 * リンク詳細画面コンポーネント
 *
 * リンクの詳細情報を表示し、各種アクションを提供します
 */
export function LinkDetailScreen({ linkId }: LinkDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { openLink } = useOpenLink();
  const { data: link, isLoading, error } = useLinkDetail(linkId);
  const { ref, present, dismiss } = useBottomSheetModal();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenLink = useCallback(() => {
    if (link) {
      openLink(link.url);
    }
  }, [link, openLink]);

  const handleChangeStatus = useCallback(() => {
    present();
  }, [present]);

  // ローディング状態
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#94a3b8" />
        <Text className="mt-4 text-base text-slate-500">
          {t("links.detail.loading")}
        </Text>
      </View>
    );
  }

  // エラー状態
  if (error || !link) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-base text-red-500">
          {t("links.detail.error")}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="mt-6 rounded-xl bg-slate-800 px-6 py-3"
        >
          <Text className="text-base font-medium text-white">
            {t("common.back")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const domain = extractDomain(link.url);
  const statusColor = getStatusColor(link.status);
  const statusTextColor = getStatusTextColor(link.status);

  return (
    <>
      <View className="flex-1 bg-slate-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* サムネイル画像 */}
          {link.image_url ? (
            <Image
              source={{ uri: link.image_url }}
              style={{ width: "100%", aspectRatio: 1.91, borderRadius: 12 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              className="w-full items-center justify-center bg-slate-100"
              style={{ aspectRatio: 1.91 }}
            >
              <Globe size={64} color="#cbd5e1" strokeWidth={1.5} />
            </View>
          )}

          <View className="px-2 py-6">
            {/* メタ情報 */}
            <View className="mb-4 flex-row items-center gap-2">
              {link.favicon_url ? (
                <Image
                  source={{ uri: link.favicon_url }}
                  style={{ width: 16, height: 16 }}
                  contentFit="contain"
                  className="rounded-full"
                />
              ) : (
                <Globe size={16} color="#94a3b8" strokeWidth={1.5} />
              )}
              <Text className="flex-1 text-sm text-slate-500">
                {link.site_name || domain}
              </Text>
            </View>

            {/* タイトル */}
            <Text className="mb-4 text-2xl font-bold leading-tight text-slate-900">
              {link.title || link.url}
            </Text>

            {/* 説明文 */}
            {link.description && (
              <Text className="mb-6 text-base leading-relaxed text-slate-600">
                {link.description}
              </Text>
            )}

            {/* ステータス情報 */}
            <View className="mb-6 rounded-2xl bg-white p-4">
              <Text className="mb-3 text-sm font-semibold text-slate-700">
                {t("links.detail.status_label")}
              </Text>

              {/* 現在のステータス */}
              <View className="mb-3 flex-row items-center gap-2">
                <View className={`size-2 rounded-full ${statusColor}`} />
                <Text className={`text-base font-medium ${statusTextColor}`}>
                  {link.status}
                </Text>
              </View>

              {/* 日時情報 */}
              <View className="gap-2">
                {link.link_created_at && (
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#94a3b8" strokeWidth={2} />
                    <Text className="text-sm text-slate-500">
                      {t("links.detail.created_at")}:{" "}
                      {formatDateTime(link.link_created_at)}
                    </Text>
                  </View>
                )}
                {link.saved_at && (
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#94a3b8" strokeWidth={2} />
                    <Text className="text-sm text-slate-500">
                      {t("links.detail.saved_at")}:{" "}
                      {formatDateTime(link.saved_at)}
                    </Text>
                  </View>
                )}
                {link.triaged_at && (
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color="#94a3b8" strokeWidth={2} />
                    <Text className="text-sm text-slate-500">
                      {t("links.detail.triaged_at")}:{" "}
                      {formatDateTime(link.triaged_at)}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center gap-2">
                  <Clock size={14} color="#94a3b8" strokeWidth={2} />
                  <Text className="text-sm text-slate-500">
                    {t("links.detail.read_at")}:{" "}
                    {link.read_at
                      ? formatDateTime(link.read_at)
                      : t("links.detail.not_read_yet")}
                  </Text>
                </View>
              </View>
            </View>

            {/* アクションボタン */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleOpenLink}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-4"
                accessibilityRole="button"
                accessibilityLabel={t("links.detail.open_link")}
              >
                <ExternalLink size={20} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-base font-semibold text-white">
                  {t("links.detail.open_link")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangeStatus}
                className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-4"
                accessibilityRole="button"
                accessibilityLabel={t("links.detail.change_status")}
              >
                <Text className="text-base font-semibold text-slate-800">
                  {t("links.detail.change_status")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ステータス変更モーダル */}
      <LinkReadStatusModal ref={ref} link={link} onClose={dismiss} />
    </>
  );
}
