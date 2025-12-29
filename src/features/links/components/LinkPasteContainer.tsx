import { useCallback } from "react";

import { Image } from "expo-image";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { AlertCircle, Clipboard, Command, Globe, Link } from "lucide-react-native";
import { useTranslation } from "react-i18next";

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
 * ⌘V装飾 + 「クリップボードから貼り付け」ボタン
 */
function EmptyStateView({ onPaste }: { onPaste: () => void }) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="items-center justify-center gap-6 py-8"
    >
      {/* キーボードショートカット風デザイン */}
      <View className="flex-row items-center gap-2">
        <View className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 shadow-sm">
          <Command size={20} color="#475569" />
        </View>
        <Text className="text-2xl font-light text-slate-400">+</Text>
        <View className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 shadow-sm">
          <Text className="text-lg font-semibold text-slate-600">V</Text>
        </View>
      </View>

      {/* 説明テキスト */}
      <Text className="text-center text-sm text-slate-500">
        {t("links.paste.empty_description")}
      </Text>

      {/* ペーストボタン */}
      <TouchableOpacity
        onPress={onPaste}
        className="flex-row items-center gap-2 rounded-xl bg-slate-800 px-6 py-4"
        accessibilityRole="button"
        accessibilityLabel={t("links.paste.paste_button")}
      >
        <Clipboard size={20} color="#ffffff" />
        <Text className="text-base font-semibold text-white">
          {t("links.paste.paste_button")}
        </Text>
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
      className="items-center justify-center gap-4 py-12"
    >
      <ActivityIndicator size="large" color="#475569" />
      <Text className="text-sm text-slate-500">
        {t("links.paste.loading")}
      </Text>
    </Animated.View>
  );
}

/**
 * Preview状態のUI（OGカード表示 + 編集可能URL）
 */
function PreviewStateView({
  preview,
  onUpdateUrl,
  hasOgp,
}: {
  preview: LinkPreview;
  onUpdateUrl: (url: string) => void;
  hasOgp: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="gap-4"
    >
      {/* OGカード */}
      <View className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* OG画像 */}
        {preview.imageUrl ? (
          <Image
            source={{ uri: preview.imageUrl }}
            style={{ width: "100%", height: 160 }}
            contentFit="cover"
            placeholder={{ blurhash: "L6PZfSjE.AyE_3t7t7R**0o#DgR4" }}
            transition={200}
          />
        ) : (
          <View className="h-40 items-center justify-center bg-slate-100">
            <Link size={40} color="#94a3b8" />
          </View>
        )}

        {/* コンテンツ */}
        <View className="gap-2 p-4">
          {/* タイトル */}
          <Text
            className="text-base font-semibold text-slate-800"
            numberOfLines={2}
          >
            {preview.title || t("links.paste.no_title")}
          </Text>

          {/* ドメイン */}
          <View className="flex-row items-center gap-2">
            {preview.faviconUrl ? (
              <Image
                source={{ uri: preview.faviconUrl }}
                style={{ width: 16, height: 16 }}
                contentFit="contain"
              />
            ) : (
              <Globe size={16} color="#64748b" />
            )}
            <Text className="text-sm text-slate-500">{preview.domain}</Text>
          </View>

          {/* OGPなし警告 */}
          {!hasOgp && (
            <View className="mt-2 flex-row items-center gap-2 rounded-lg bg-amber-50 p-2">
              <AlertCircle size={16} color="#d97706" />
              <Text className="flex-1 text-xs text-amber-700">
                {t("links.paste.no_ogp_warning")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 編集可能なURLフィールド */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-slate-600">
          {t("links.paste.url_label")}
        </Text>
        <TextInput
          value={preview.url}
          onChangeText={onUpdateUrl}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800"
          placeholder="https://..."
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
      className="items-center justify-center gap-6 py-8"
    >
      {/* エラーアイコン */}
      <View className="rounded-full bg-red-100 p-4">
        <AlertCircle size={40} color="#dc2626" />
      </View>

      {/* エラーメッセージ */}
      <View className="items-center gap-2">
        <Text className="text-center text-base font-semibold text-slate-800">
          {t("links.paste.invalid_url_title")}
        </Text>
        <Text className="text-center text-sm text-slate-500">
          {errorMessage || t("links.paste.invalid_url_description")}
        </Text>
      </View>

      {/* リセットボタン */}
      <TouchableOpacity
        onPress={onReset}
        className="rounded-xl border border-slate-300 px-6 py-3"
        accessibilityRole="button"
        accessibilityLabel={t("links.paste.try_again")}
      >
        <Text className="text-base font-medium text-slate-700">
          {t("links.paste.try_again")}
        </Text>
      </TouchableOpacity>
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
    <View className="min-h-[200px]">
      {status === "empty" && <EmptyStateView onPaste={onPaste} />}
      {status === "loading" && <LoadingStateView />}
      {(status === "preview" || status === "noOgp") && preview && (
        <PreviewStateView
          preview={preview}
          onUpdateUrl={handleUpdateUrl}
          hasOgp={status === "preview"}
        />
      )}
      {status === "invalid" && (
        <InvalidStateView errorMessage={errorMessage} onReset={onReset} />
      )}
    </View>
  );
}

