import type { TFunction } from "i18next";
import { z } from "zod";

/**
 * リンク作成フォームのバリデーションスキーマ
 */
export function LinkCreateSchema(t: TFunction<"translation", undefined>) {
  return z.object({
    url: z
      .string()
      .min(1, {
        message: t("links.create.error_messages.url_required"),
      })
      .url({
        message: t("links.create.error_messages.url_invalid"),
      }),
  });
}

/**
 * リンク作成フォームの型
 */
export type LinkCreateForm = z.infer<ReturnType<typeof LinkCreateSchema>>;

/**
 * リンク作成フォームのエラー型
 */
export interface LinkCreateErrors {
  url?: string;
}
