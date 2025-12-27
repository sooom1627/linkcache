import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, View } from "react-native";

import { useTranslation } from "react-i18next";

import FormButton from "@/src/shared/components/forms/FormButton";
import FormInput from "@/src/shared/components/forms/FormInput";

import { useCreateLink } from "../hooks/useCreateLink";
import { LinkCreateSchema, type LinkCreateErrors } from "../types/linkSchema";

interface LinkCreateFormProps {
  onSuccess?: () => void;
}

/**
 * リンク作成フォームコンポーネント
 *
 * URL入力フィールドと送信ボタンを提供し、
 * Zodバリデーションとリンク作成処理を行います。
 */
export default function LinkCreateForm({ onSuccess }: LinkCreateFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<LinkCreateErrors>({});

  const schema = useMemo(() => LinkCreateSchema(t), [t]);
  const { createLink, isPending, isSuccess, isError, error, reset } =
    useCreateLink();

  // リアルタイムバリデーション
  useEffect(() => {
    // 空の状態ではエラーを表示しない
    if (url.length === 0) {
      setErrors({});
      return;
    }

    const result = schema.shape.url.safeParse(url);
    if (!result.success) {
      setErrors({ url: result.error.issues[0]?.message });
    } else {
      setErrors({});
    }
  }, [url, schema]);

  // 成功時の処理
  useEffect(() => {
    if (isSuccess) {
      Alert.alert(
        t("links.create.callback_messages.success_title"),
        t("links.create.callback_messages.success_message"),
      );
      setUrl("");
      reset();
      onSuccess?.();
    }
  }, [isSuccess, t, onSuccess, reset]);

  // エラー時の処理
  useEffect(() => {
    if (isError && error) {
      Alert.alert(
        t("links.create.callback_messages.error_title"),
        t("links.create.callback_messages.error_message"),
      );
    }
  }, [isError, error, t]);

  // 送信処理
  const handleSubmit = useCallback(() => {
    const result = schema.safeParse({ url });

    if (!result.success) {
      const newErrors: LinkCreateErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LinkCreateErrors;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    createLink(url);
  }, [url, schema, createLink]);

  // ボタンの無効化条件
  const isSubmitDisabled = useMemo(() => {
    return isPending || url.length === 0 || !!errors.url;
  }, [isPending, url, errors.url]);

  return (
    <View className="gap-6">
      <FormInput
        label={t("links.create.title")}
        placeholder={t("links.create.url_placeholder")}
        value={url}
        onChangeText={setUrl}
        error={errors.url}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!isPending}
      />

      <FormButton
        title={isPending ? "..." : t("links.create.submit_button")}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      />
    </View>
  );
}
