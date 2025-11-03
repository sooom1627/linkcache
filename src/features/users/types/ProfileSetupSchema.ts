import type { TFunction } from "i18next";
import { z } from "zod";

/**
 * プロフィール設定フォームのバリデーションスキーマ
 */
export const ProfileSetupSchema = (t: TFunction<"translation", undefined>) =>
  z.object({
    user_id: z
      .string()
      .min(4, {
        message: t(
          "users.setting_modal.profile_edit.error_messages.user_id_min_length",
        ),
      })
      .max(32, {
        message: t(
          "users.setting_modal.profile_edit.error_messages.user_id_max_length",
        ),
      })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: t(
          "users.setting_modal.profile_edit.error_messages.user_id_regex",
        ),
      }),
    username: z
      .string()
      .min(4, {
        message: t(
          "users.setting_modal.profile_edit.error_messages.username_min_length",
        ),
      })
      .max(32, {
        message: t(
          "users.setting_modal.profile_edit.error_messages.username_max_length",
        ),
      }),
  });

/**
 * プロフィール設定フォームの型
 */
export type ProfileSetupForm = z.infer<typeof ProfileSetupSchema>;

/**
 * プロフィール設定フォームのエラー型
 */
export interface ProfileSetupErrors {
  user_id?: string;
  username?: string;
}
