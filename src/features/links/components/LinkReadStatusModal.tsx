import { forwardRef, useCallback, useEffect, useState } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import { Image } from "expo-image";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CheckCircle2, Circle, Globe, Link2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { BaseBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import { extractDomain } from "../hooks/useLinkPaste";
import { useUpdateLinkReadStatus } from "../hooks/useUpdateLinkReadStatus";
import type { UserLink } from "../types/linkList.types";

export interface LinkReadStatusModalProps {
  link: UserLink;
  onClose?: () => void;
}

/**
 * リンクの既読状態を操作するモーダル
 *
 * リンクの既読状態を操作するためのUIを提供します。
 * 対象のリンクをプレビューカードで表示し、既読/未読を選択できます。
 */
export const LinkReadStatusModal = forwardRef<
  BottomSheetModal,
  LinkReadStatusModalProps
>(({ link, onClose }, ref) => {
  const { t } = useTranslation();
  const [isRead, setIsRead] = useState<boolean>(link.read_at !== null);
  const { updateReadStatus, isPending, isSuccess } = useUpdateLinkReadStatus();

  // propsの変更を検知してローカル状態を更新
  useEffect(() => {
    setIsRead(link.read_at !== null);
  }, [link.read_at]);

  // API呼び出し成功時にローカル状態を更新
  useEffect(() => {
    if (isSuccess) {
      // React Queryのキャッシュ更新に依存するため、ローカル状態は更新しない
      // モーダルを閉じる
      onClose?.();
    }
  }, [isSuccess, onClose]);

  // 既読にするハンドラー
  const handleMarkAsRead = useCallback(() => {
    if (isRead || isPending) return;
    updateReadStatus(link.link_id, true, "done");
    // 楽観的更新: 即座にローカル状態を更新
    setIsRead(true);
  }, [isRead, isPending, link.link_id, updateReadStatus]);

  // 未読にするハンドラー
  const handleMarkAsUnread = useCallback(() => {
    if (!isRead || isPending) return;
    updateReadStatus(link.link_id, false, "read_soon");
    // 楽観的更新: 即座にローカル状態を更新
    setIsRead(false);
  }, [isRead, isPending, link.link_id, updateReadStatus]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const domain = extractDomain(link.url);

  return (
    <BaseBottomSheetModal
      ref={ref}
      snapPoints={["80%", "80%"]}
      enablePanDownToClose={true}
    >
      <View className="min-h-[450px] flex-1 px-6 pb-8">
        {/* Header */}
        <View className="mb-6">
          <ModalHeader
            title={t("links.card.action_modal.title")}
            onClose={handleClose}
          />
        </View>

        {/* リンクプレビューカード */}
        <View className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
          <View className="gap-3 p-4">
            {/* タイトル */}
            <Text
              className="text-base font-medium text-slate-800"
              numberOfLines={2}
            >
              {link.title || link.url}
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
                {link.site_name || domain}
              </Text>
            </View>
          </View>
        </View>

        {/* アクションボタンセクション */}
        <View className="w-full flex-row gap-3">
          {/* 未読ボタン */}
          <View className="flex-1">
            <TouchableOpacity
              onPress={handleMarkAsUnread}
              disabled={!isRead || isPending}
              accessibilityRole="button"
              accessibilityLabel={t("links.card.action_modal.mark_as_unread")}
              accessibilityState={{ disabled: !isRead || isPending }}
              className={`w-full flex-row items-center justify-center gap-1.5 rounded-lg p-3 ${
                !isRead || isPending
                  ? "bg-slate-200"
                  : "bg-slate-900 active:bg-slate-800"
              }`}
              activeOpacity={!isRead || isPending ? 1 : 0.7}
            >
              <Circle
                size={18}
                color={!isRead ? "#94a3b8" : "#FFFFFF"}
                strokeWidth={2}
              />
              <Text
                className={`text-sm font-semibold ${
                  !isRead ? "text-slate-400" : "text-white"
                }`}
                numberOfLines={1}
              >
                {t("links.card.action_modal.mark_as_unread")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 既読ボタン */}
          <View className="flex-1">
            <TouchableOpacity
              onPress={handleMarkAsRead}
              disabled={isRead || isPending}
              accessibilityRole="button"
              accessibilityLabel={t("links.card.action_modal.mark_as_read")}
              accessibilityState={{ disabled: isRead || isPending }}
              className={`w-full flex-row items-center justify-center gap-1.5 rounded-lg p-3 ${
                isRead || isPending
                  ? "bg-slate-200"
                  : "bg-slate-900 active:bg-slate-800"
              }`}
              activeOpacity={isRead || isPending ? 1 : 0.7}
            >
              <CheckCircle2
                size={18}
                color={isRead ? "#94a3b8" : "#FFFFFF"}
                strokeWidth={2}
              />
              <Text
                className={`text-sm font-semibold ${
                  isRead ? "text-slate-400" : "text-white"
                }`}
                numberOfLines={1}
              >
                {t("links.card.action_modal.mark_as_read")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BaseBottomSheetModal>
  );
});

LinkReadStatusModal.displayName = "LinkReadStatusModal";
