import { useCallback, useMemo } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import {
  Check,
  Ellipsis,
  ExternalLink,
  Share,
  Trash2,
  X,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import type { ToggleMenuItem } from "@/src/shared/components/ToggleMenu";
import { ToggleMenu } from "@/src/shared/components/ToggleMenu";
import { colors } from "@/src/shared/constants/colors";

import { useUpdateLinkReadStatus } from "../hooks/useUpdateLinkReadStatus";

interface LinkDetailActionButtonGroupProps {
  isMoreMenuOpen: boolean;
  isDeleting: boolean;
  isRead: boolean;
  linkId: string;
  onOpenLink: () => void;
  onDelete: () => void;
  onShare: () => void;
  onMoreOptions: () => void;
}

/**
 * リンク詳細画面のアクションボタングループコンポーネント
 *
 * リンクを開く、削除、ステータス変更、その他のオプションを提供します
 */
export function LinkDetailActionButtonGroup({
  isMoreMenuOpen,
  isDeleting,
  isRead,
  linkId,
  onOpenLink,
  onDelete,
  onShare,
  onMoreOptions,
}: LinkDetailActionButtonGroupProps) {
  const { t } = useTranslation();
  const { updateReadStatus, isPending: isUpdatingStatus } =
    useUpdateLinkReadStatus();

  // メニューを閉じる処理
  const handleCloseMenu = useCallback(() => {
    if (isMoreMenuOpen) {
      onMoreOptions();
    }
  }, [isMoreMenuOpen, onMoreOptions]);

  // メニュー項目のハンドラー（アクション実行後にメニューを閉じる）
  const handleChangeStatus = useCallback(() => {
    if (isUpdatingStatus) return;
    // 既読の場合は未読に、未読の場合は既読にする
    // 既読時はステータスをdoneに、未読時はread_soonに設定
    updateReadStatus(linkId, !isRead, !isRead ? "done" : "read_soon");
    handleCloseMenu();
  }, [isUpdatingStatus, updateReadStatus, linkId, isRead, handleCloseMenu]);

  const handleShare = useCallback(() => {
    onShare();
    handleCloseMenu();
  }, [onShare, handleCloseMenu]);

  const handleDelete = useCallback(() => {
    onDelete();
    handleCloseMenu();
  }, [onDelete, handleCloseMenu]);

  // メニュー項目の定義
  const menuItems: ToggleMenuItem[] = useMemo(
    () => [
      {
        id: "change-status",
        icon: isRead ? (
          <X size={20} color={colors.icon} strokeWidth={2.5} />
        ) : (
          <Check size={20} color={colors.icon} strokeWidth={2.5} />
        ),
        label: isRead
          ? t("links.detail.mark_as_unread")
          : t("links.detail.mark_as_read"),
        onPress: handleChangeStatus,
        disabled: !isMoreMenuOpen || isUpdatingStatus,
        loading: isUpdatingStatus,
      },
      {
        id: "share",
        icon: <Share size={20} color={colors.icon} strokeWidth={2.5} />,
        label: t("links.detail.share"),
        onPress: handleShare,
        disabled: !isMoreMenuOpen,
      },
      {
        id: "delete",
        icon: <Trash2 size={20} color={colors.error} strokeWidth={2.5} />,
        label: t("links.detail.delete_link"),
        onPress: handleDelete,
        disabled: !isMoreMenuOpen || isDeleting,
        color: colors.error,
        loading: isDeleting,
        className: "min-w-[200px]",
      },
    ],
    [
      t,
      handleChangeStatus,
      handleShare,
      handleDelete,
      isMoreMenuOpen,
      isDeleting,
      isRead,
      isUpdatingStatus,
    ],
  );

  return (
    <View className="absolute bottom-12 z-50 flex-row items-end gap-2 px-2">
      <TouchableOpacity
        onPress={onOpenLink}
        className="h-16 flex-grow flex-row items-center justify-center gap-2 rounded-full bg-main px-6 py-4"
        accessibilityRole="button"
        accessibilityLabel={t("links.detail.open_link")}
      >
        <ExternalLink size={20} color={colors.textOnDark} strokeWidth={2.5} />
        <Text className="text-base font-semibold text-white">
          {t("links.detail.open_link")}
        </Text>
      </TouchableOpacity>

      <View className="relative z-20">
        <ToggleMenu
          items={menuItems}
          isOpen={isMoreMenuOpen}
          onClose={handleCloseMenu}
          position="bottom-20 right-0"
          width={230}
          expandOrigin="bottom-right"
        />

        {/* メニューを開くボタン */}
        <TouchableOpacity
          onPress={onMoreOptions}
          className="size-16 flex-row items-center justify-center rounded-full bg-surfaceMuted"
          accessibilityRole="button"
          accessibilityLabel={t("links.detail.more_options")}
        >
          <Ellipsis size={20} color={colors.icon} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
