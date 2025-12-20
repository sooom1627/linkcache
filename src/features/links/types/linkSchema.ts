import { z } from "zod";

export const linkFormSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URLを入力してください")
    .max(2048, "URLは2048文字以内で入力してください")
    .url("有効なURLを入力してください")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "http:// または https:// で始まるURLを入力してください",
    ),
});

export type LinkFormSchema = z.infer<typeof linkFormSchema>;
