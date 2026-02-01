import { useCallback, useMemo } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import {
  Check,
  Ellipsis,
  ExternalLink,
  Share,
  Trash2,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { ToggleMenu } from "@/src/shared/components/ToggleMenu";
import type { ToggleMenuItem } from "@/src/shared/components/ToggleMenu";

interface LinkDetailActionButtonGroupProps {
  isMoreMenuOpen: boolean;
  isDeleting: boolean;
  onOpenLink: () => void;
  onDelete: () => void;
  onChangeStatus: () => void;
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
  onOpenLink,
  onDelete,
  onChangeStatus,
  onShare,
  onMoreOptions,
}: LinkDetailActionButtonGroupProps) {
  const { t } = useTranslation();

  // メニューを閉じる処理
  const handleCloseMenu = useCallback(() => {
    if (isMoreMenuOpen) {
      onMoreOptions();
    }
  }, [isMoreMenuOpen, onMoreOptions]);

  // メニュー項目のハンドラー（アクション実行後にメニューを閉じる）
  const handleChangeStatus = useCallback(() => {
    onChangeStatus();
    handleCloseMenu();
  }, [onChangeStatus, handleCloseMenu]);

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
        icon: <Check size={20} color="#64748B" strokeWidth={2.5} />,
        label: t("links.detail.mark_as_read"),
        onPress: handleChangeStatus,
        disabled: !isMoreMenuOpen,
      },
      {
        icon: <Share size={20} color="#64748B" strokeWidth={2.5} />,
        label: t("links.detail.share"),
        onPress: handleShare,
        disabled: !isMoreMenuOpen,
      },
      {
        icon: <Trash2 size={20} color="#EF4444" strokeWidth={2.5} />,
        label: t("links.detail.delete_link"),
        onPress: handleDelete,
        disabled: !isMoreMenuOpen || isDeleting,
        color: "#EF4444",
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
    ],
  );

  return (
    <View className="absolute bottom-12 z-50 flex-row items-end gap-2 px-2">
      <TouchableOpacity
        onPress={onOpenLink}
        className="h-16 flex-grow flex-row items-center justify-center gap-2 rounded-full bg-slate-800 px-6 py-4"
        accessibilityRole="button"
        accessibilityLabel={t("links.detail.open_link")}
      >
        <ExternalLink size={20} color="#ffffff" strokeWidth={2.5} />
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
          width={200}
        />

        {/* メニューを開くボタン */}
        <TouchableOpacity
          onPress={onMoreOptions}
          className="size-16 flex-row items-center justify-center rounded-full bg-slate-200"
          accessibilityRole="button"
          accessibilityLabel={t("links.detail.more_options")}
        >
          <Ellipsis size={20} color="#64748B" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
