import { useCallback, useState } from "react";

import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { Calendar, Circle, Clock, Globe } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { ErrorStateView } from "@/src/shared/components/ErrorStateView";
import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";
import { formatDateTime } from "@/src/shared/utils/timezone";

import { CollectionChip } from "../components/CollectionChip";
import { LinkDetailActionButtonGroup } from "../components/LinkDetailActionButtonGroup";
import { LinkReadStatusModal } from "../components/LinkReadStatusModal";
import { useDeleteLink } from "../hooks/useDeleteLink";
import { useLinkDetail } from "../hooks/useLinkDetail";
import { extractDomain } from "../hooks/useLinkPaste";
import { useOpenLink } from "../hooks/useOpenLink";
import { shareLink } from "../utils/share";
import { getStatusStyle } from "../utils/statusStyles";

interface LinkDetailScreenProps {
  linkId: string;
}

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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { deleteLinkAsync, isPending: isDeleting } = useDeleteLink();
  const {
    ref: statusModalRef,
    present: presentStatusModal,
    dismiss: dismissStatusModal,
  } = useBottomSheetModal();

  const isDone = link?.status === "done";

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenLink = useCallback(() => {
    if (link) {
      openLink(link.url);

      if (!isDone) {
        // 500ms後にモーダルを表示
        setTimeout(() => {
          presentStatusModal();
        }, 500);
      }
    }
  }, [link, isDone, openLink, presentStatusModal]);

  const handleMoreOptions = useCallback(() => {
    setIsMoreMenuOpen((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    if (!link) return;
    await shareLink({ url: link.url, title: link.title });
  }, [link]);

  const handleDelete = useCallback(() => {
    if (!link) return;

    Alert.alert(
      t("links.detail.delete_confirm.title"),
      t("links.detail.delete_confirm.message"),
      [
        {
          text: t("links.detail.delete_confirm.cancel"),
          style: "cancel",
        },
        {
          text: t("links.detail.delete_confirm.confirm"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteLinkAsync(link.link_id);
                router.back();
              } catch (error: unknown) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : t("links.detail.delete_error.message", {
                        defaultValue: "リンクの削除に失敗しました",
                      });
                Alert.alert(
                  t("links.detail.delete_error.title", {
                    defaultValue: "削除エラー",
                  }),
                  errorMessage,
                  [{ text: t("common.ok", { defaultValue: "OK" }) }],
                );
              }
            })();
          },
        },
      ],
      { cancelable: true },
    );
  }, [link, t, router, deleteLinkAsync]);

  // ローディング状態
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#6B7280" />
        <Text className="mt-4 text-base text-slate-500">
          {t("links.detail.loading")}
        </Text>
      </View>
    );
  }

  // エラー状態
  if (error || !link) {
    return (
      <ErrorStateView
        message={t("links.detail.error")}
        actionLabel={t("common.back")}
        onAction={handleBack}
      />
    );
  }

  const domain = extractDomain(link.url);
  const statusStyle = getStatusStyle(link.status);

  // ステータス表示用の共通コンポーネント
  const StatusDisplay = ({
    status,
    statusStyle,
  }: {
    status: string | null;
    statusStyle: ReturnType<typeof getStatusStyle>;
  }) => (
    <View className="flex-row items-center gap-1.5">
      <Circle size={12} fill={statusStyle.icon} color={statusStyle.icon} />
      <Text className={`text-base font-medium ${statusStyle.text}`}>
        {status
          ? t(`links.card.action_modal.status.${status}`, {
              defaultValue: status,
            })
          : ""}
      </Text>
    </View>
  );

  return (
    <>
      <View className="relative h-full bg-slate-50 pb-32">
        <ScrollView
          className="flex-1 pt-20"
          showsVerticalScrollIndicator={false}
        >
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
            <Text className="mb-4 line-clamp-2 text-2xl font-bold leading-tight text-slate-900">
              {link.title || link.url}
            </Text>

            {/* 説明文 */}
            {link.description && (
              <Text className="mb-6 line-clamp-2 text-base leading-relaxed text-slate-600">
                {link.description}
              </Text>
            )}

            {/* ステータス情報 */}
            <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-mainDark">
              {t("links.detail.status_label")}
            </Text>
            <View className="mb-6 rounded-2xl bg-white p-4">
              {/* 現在のステータス */}
              <View className="mb-3 flex-row items-center gap-2">
                {isDone ? (
                  // Doneステータス: 優先表示
                  <StatusDisplay
                    status={link.status}
                    statusStyle={statusStyle}
                  />
                ) : (
                  // 未読: シンプルなアイコン+テキスト
                  <StatusDisplay
                    status={link.status}
                    statusStyle={statusStyle}
                  />
                )}
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

            {/* collections */}
            <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-mainDark">
              Collections
            </Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {[
                { emoji: "📚", title: "Read Soon" },
                { emoji: "🔬", title: "Tech" },
                { emoji: "🎨", title: "Design" },
              ].map((col) => (
                <CollectionChip
                  key={col.title}
                  emoji={col.emoji}
                  title={col.title}
                  onPress={() => {
                    /* TODO: コレクション詳細へ遷移 */
                  }}
                />
              ))}
              <CollectionChip
                variant="add"
                title="Add to collection"
                onPress={() => {
                  /* TODO: コレクション追加モーダル */
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* アクションボタン */}
        <LinkDetailActionButtonGroup
          isMoreMenuOpen={isMoreMenuOpen}
          isDeleting={isDeleting}
          isRead={link.read_at !== null}
          linkId={link.link_id}
          onOpenLink={handleOpenLink}
          onDelete={handleDelete}
          onShare={handleShare}
          onMoreOptions={handleMoreOptions}
        />
      </View>

      {/* ステータス変更モーダル */}
      <LinkReadStatusModal
        ref={statusModalRef}
        link={link}
        onClose={dismissStatusModal}
      />
    </>
  );
}
