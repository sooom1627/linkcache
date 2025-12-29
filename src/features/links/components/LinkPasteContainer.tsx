import { useCallback } from "react";

import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";

import { AlertCircle, ClipboardPaste, Globe, Link2, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import type { LinkPasteStatus, LinkPreview } from "../types/linkPaste.types";

interface LinkPasteContainerProps {
  status: LinkPasteStatus;
  preview: LinkPreview | null;
  errorMessage: string | null;
  onPaste: () => void;
  onUpdateUrl: (url: string) => void;
  onReset: () => void;
}

/**
 * Empty状態のUI
 * ミニマルなペーストボタン
 */
function EmptyStateView({ onPaste }: { onPaste: () => void }) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="items-center justify-center py-10"
    >
      {/* ペーストカード */}
      <TouchableOpacity
        onPress={onPaste}
        className="w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-8"
        accessibilityRole="button"
        accessibilityLabel={t("links.paste.paste_button")}
        activeOpacity={0.7}
      >
        {/* アイコン */}
        <View className="rounded-full bg-white p-4 shadow-sm">
          <ClipboardPaste size={28} color="#3b82f6" strokeWidth={1.5} />
        </View>

        {/* テキスト */}
        <View className="items-center gap-1">
          <Text className="text-base font-medium text-slate-700">
            {t("links.paste.paste_button")}
          </Text>
          <Text className="text-center text-sm text-slate-400">
            {t("links.paste.empty_description")}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Loading状態のUI
 */
function LoadingStateView() {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="items-center justify-center py-16"
    >
      <View className="items-center gap-4">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-sm text-slate-400">
          {t("links.paste.loading")}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Preview状態のUI（OGカード表示 + 編集可能URL）
 */
function PreviewStateView({
  preview,
  onUpdateUrl,
  onClear,
  hasOgp,
}: {
  preview: LinkPreview;
  onUpdateUrl: (url: string) => void;
  onClear: () => void;
  hasOgp: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="gap-5"
    >
      {/* プレビューカード */}
      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* OG画像 */}
        {preview.imageUrl ? (
          <Image
            source={{ uri: preview.imageUrl }}
            style={{ width: "100%", height: 140 }}
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
            {preview.title || t("links.paste.no_title")}
          </Text>

          {/* ドメイン */}
          <View className="flex-row items-center gap-2">
            {preview.faviconUrl ? (
              <Image
                source={{ uri: preview.faviconUrl }}
                style={{ width: 14, height: 14 }}
                contentFit="contain"
              />
            ) : (
              <Globe size={14} color="#94a3b8" strokeWidth={1.5} />
            )}
            <Text className="text-sm text-slate-400">{preview.domain}</Text>
          </View>

          {/* OGPなし警告 */}
          {!hasOgp && (
            <View className="flex-row items-center gap-2 rounded-xl bg-amber-50 p-3">
              <AlertCircle size={14} color="#f59e0b" strokeWidth={1.5} />
              <Text className="flex-1 text-xs text-amber-600">
                {t("links.paste.no_ogp_warning")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* URLフィールド */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-500">
            {t("links.paste.url_label")}
          </Text>
          <TouchableOpacity
            onPress={onClear}
            className="flex-row items-center gap-1 rounded-lg px-2 py-1"
            accessibilityRole="button"
            accessibilityLabel={t("links.paste.clear_button")}
            activeOpacity={0.6}
          >
            <X size={14} color="#94a3b8" strokeWidth={1.5} />
            <Text className="text-sm text-slate-400">
              {t("links.paste.clear_button")}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={preview.url}
          onChangeText={onUpdateUrl}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700"
          placeholder="https://..."
          placeholderTextColor="#94a3b8"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </Animated.View>
  );
}

/**
 * Invalid状態のUI（エラー表示）
 */
function InvalidStateView({
  errorMessage,
  onReset,
}: {
  errorMessage: string | null;
  onReset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="items-center justify-center py-10"
    >
      {/* エラーカード */}
      <View className="w-full items-center gap-5 rounded-2xl border border-red-100 bg-red-50/50 px-6 py-8">
        {/* アイコン */}
        <View className="rounded-full bg-white p-3">
          <AlertCircle size={24} color="#ef4444" strokeWidth={1.5} />
        </View>

        {/* エラーメッセージ */}
        <View className="items-center gap-1">
          <Text className="text-center text-base font-medium text-slate-700">
            {t("links.paste.invalid_url_title")}
          </Text>
          <Text className="text-center text-sm text-slate-400">
            {errorMessage || t("links.paste.invalid_url_description")}
          </Text>
        </View>

        {/* リセットボタン */}
        <TouchableOpacity
          onPress={onReset}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5"
          accessibilityRole="button"
          accessibilityLabel={t("links.paste.try_again")}
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-slate-600">
            {t("links.paste.try_again")}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/**
 * リンク貼り付けコンテナ
 *
 * 状態に応じてフェードアニメーションで切り替わるUIを提供します。
 */
export default function LinkPasteContainer({
  status,
  preview,
  errorMessage,
  onPaste,
  onUpdateUrl,
  onReset,
}: LinkPasteContainerProps) {
  const handleUpdateUrl = useCallback(
    (url: string) => {
      onUpdateUrl(url);
    },
    [onUpdateUrl],
  );

  return (
    <View className="min-h-[180px]">
      {status === "empty" && <EmptyStateView onPaste={onPaste} />}
      {status === "loading" && <LoadingStateView />}
      {(status === "preview" || status === "noOgp") && preview && (
        <PreviewStateView
          preview={preview}
          onUpdateUrl={handleUpdateUrl}
          onClear={onReset}
          hasOgp={status === "preview"}
        />
      )}
      {status === "invalid" && (
        <InvalidStateView errorMessage={errorMessage} onReset={onReset} />
      )}
    </View>
  );
}
