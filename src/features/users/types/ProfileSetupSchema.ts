import { z } from "zod";

/**
 * プロフィール設定フォームのバリデーションスキーマ
 */
export const ProfileSetupSchema = z.object({
  user_id: z
    .string()
    .min(4, "User ID must be at least 4 characters")
    .max(32, "User ID must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "User ID can only contain letters, numbers, and underscores",
    ),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(32, "Username must be at most 32 characters"),
});

/**
 * プロフィール設定フォームの型
 */
export type ProfileSetupForm = z.infer<typeof ProfileSetupSchema>;
