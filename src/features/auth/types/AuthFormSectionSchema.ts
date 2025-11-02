import { z } from "zod";

/**
 * 認証フォームのバリデーションスキーマを生成する関数
 * @param t - 翻訳関数
 * @returns Zodスキーマ
 */
export const createAuthFormSectionSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, {
        message: t(
          "auth_messages.auth_form_messages.error_messages.email_required",
        ),
      })
      .email({
        message: t(
          "auth_messages.auth_form_messages.error_messages.email_invalid",
        ),
      }),
    password: z
      .string()
      .min(1, {
        message: t(
          "auth_messages.auth_form_messages.error_messages.password_required",
        ),
      })
      .min(8, {
        message: t(
          "auth_messages.auth_form_messages.error_messages.password_min_length",
        ),
      })
      .max(100, {
        message: t(
          "auth_messages.auth_form_messages.error_messages.password_max_length",
        ),
      }),
  });

export type AuthFormSection = z.infer<
  ReturnType<typeof createAuthFormSectionSchema>
>;

export type AuthFormFieldName = keyof AuthFormSection;

export interface AuthFormFieldConfig {
  name: AuthFormFieldName;
  placeholder: string;
  textContentType: "emailAddress" | "password" | "newPassword";
  autoCapitalize: "none";
  secureTextEntry?: boolean;
}

export interface AuthFormConfig {
  fields: {
    email: AuthFormFieldConfig;
    password: AuthFormFieldConfig;
  };
  buttonTitle: string;
  onSubmit: (data: AuthFormSection) => void | Promise<void>;
}
