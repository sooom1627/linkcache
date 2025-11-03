import { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import type { ProfileSetupErrors } from "../types/ProfileSetupSchema";
import { ProfileSetupSchema } from "../types/ProfileSetupSchema";

export interface ProfileFormData {
  user_id: string;
  username: string;
}

export interface UseProfileFormReturn {
  formData: ProfileFormData;
  errors: ProfileSetupErrors;
  setUserId: (value: string) => void;
  setUsername: (value: string) => void;
  setFormData: (data: ProfileFormData) => void;
  validateForm: () => boolean;
  hasErrors: boolean;
}

/**
 * プロフィールフォームの状態管理とバリデーション
 *
 * フォーム入力状態の管理とZodによるリアルタイムバリデーションを提供します。
 * API処理は含まず、フォームのUI状態のみを管理します。
 *
 * @param initialData - フォームの初期値（オプション）
 * @returns フォーム状態、エラー、更新関数、バリデーション関数
 *
 * @example
 * ```tsx
 * // 新規作成時
 * const { formData, errors, setUserId, setUsername, validateForm } = useProfileForm();
 *
 * // 編集時（初期値あり）
 * const { formData, errors, setFormData, validateForm } = useProfileForm({
 *   user_id: profile.user_id,
 *   username: profile.username
 * });
 * ```
 */
export function useProfileForm(
  initialData?: ProfileFormData,
): UseProfileFormReturn {
  const defaultData: ProfileFormData = { user_id: "", username: "" };
  const { t } = useTranslation();
  const schema = useMemo(() => ProfileSetupSchema(t), [t]);
  const [formData, setFormData] = useState<ProfileFormData>(
    initialData ?? defaultData,
  );
  const [errors, setErrors] = useState<ProfileSetupErrors>({});

  // リアルタイムZodバリデーション
  useEffect(() => {
    // 初期状態（両方空）ではエラーを表示しない
    if (formData.user_id.length === 0 && formData.username.length === 0) {
      setErrors({});
      return;
    }

    const newErrors: ProfileSetupErrors = {};

    // user_idのバリデーション
    if (formData.user_id.length > 0) {
      const result = schema.shape.user_id.safeParse(formData.user_id);
      if (!result.success) {
        newErrors.user_id = result.error.issues[0]?.message;
      }
    }

    // usernameのバリデーション
    if (formData.username.length > 0) {
      const result = schema.shape.username.safeParse(formData.username);
      if (!result.success) {
        newErrors.username = result.error.issues[0]?.message;
      }
    }

    setErrors(newErrors);
  }, [formData.user_id, formData.username, schema]);

  // 個別フィールド更新
  const setUserId = (value: string) => {
    setFormData((prev) => ({ ...prev, user_id: value }));
  };

  const setUsername = (value: string) => {
    setFormData((prev) => ({ ...prev, username: value }));
  };

  // 最終バリデーション（送信時）
  const validateForm = (): boolean => {
    const result = schema.safeParse(formData);

    if (!result.success) {
      const newErrors: ProfileSetupErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileSetupErrors;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  return {
    formData,
    errors,
    setUserId,
    setUsername,
    setFormData,
    validateForm,
    hasErrors: !!errors.user_id || !!errors.username,
  };
}
