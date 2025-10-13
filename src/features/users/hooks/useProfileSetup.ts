import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { PostgrestError } from "@supabase/supabase-js";

import type { ProfileSetupErrors } from "../types/ProfileSetupSchema";
import { ProfileSetupSchema } from "../types/ProfileSetupSchema";

import { useCheckUserId } from "./useCheckUserId";
import { useCreateProfile } from "./useCreateProfile";

export interface UseProfileSetupProps {
  onSuccess?: () => void;
  onError?: (error: PostgrestError) => void;
}

export interface UseProfileSetupReturn {
  userId: string;
  setUserId: Dispatch<SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  errors: ProfileSetupErrors;
  isCheckingUserId: boolean;
  checkError: PostgrestError | null;
  isUserIdAvailable: boolean | undefined;
  isPending: boolean;
  handleSubmit: () => void;
}

/**
 * プロフィール設定フォームの統合フック
 * フォーム状態管理、バリデーション、送信処理を統合
 */
export function useProfileSetup({
  onSuccess,
  onError,
}: UseProfileSetupProps = {}): UseProfileSetupReturn {
  // フォーム状態
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<ProfileSetupErrors>({});

  // user_id重複チェック
  const {
    data: isUserIdAvailable,
    isLoading: isCheckingUserId,
    error: checkError,
  } = useCheckUserId(userId, true);

  // プロフィール作成
  const { mutate: createProfile, isPending } = useCreateProfile({
    onSuccess,
    onError,
  });

  // リアルタイムZodバリデーション
  useEffect(() => {
    // 初期状態（両方空）ではエラーを表示しない
    if (userId.length === 0 && username.length === 0) {
      setErrors({});
      return;
    }

    const newErrors: ProfileSetupErrors = {};

    // user_idのバリデーション
    if (userId.length > 0) {
      const result = ProfileSetupSchema.shape.user_id.safeParse(userId);
      if (!result.success) {
        newErrors.user_id = result.error.issues[0]?.message;
      }
    }

    // usernameのバリデーション
    if (username.length > 0) {
      const result = ProfileSetupSchema.shape.username.safeParse(username);
      if (!result.success) {
        newErrors.username = result.error.issues[0]?.message;
      }
    }

    setErrors(newErrors);
  }, [userId, username]);

  // 送信処理
  const handleSubmit = () => {
    // 最終バリデーション
    const result = ProfileSetupSchema.safeParse({
      user_id: userId,
      username,
    });

    if (!result.success) {
      const newErrors: ProfileSetupErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileSetupErrors;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    // user_id可用性チェック（undefined、false、またはチェック中の場合は送信不可）
    if (isUserIdAvailable !== true) {
      return;
    }

    // プロフィール作成
    createProfile({ user_id: userId, username });
  };

  const result: UseProfileSetupReturn = {
    // フォーム状態
    userId,
    setUserId,
    username,
    setUsername,
    errors,

    // チェック状態
    isCheckingUserId,
    checkError,
    isUserIdAvailable,

    // 送信状態
    isPending,
    handleSubmit,
  };

  return result;
}
