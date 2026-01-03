import { z } from "zod";

import type { Database } from "./supabase.types";

/**
 * Triage Status Enum
 */
export type TriageStatus = Database["public"]["Enums"]["triage_status"];

/**
 * ユーザーのリンク情報（View: user_links_view に対応）
 *
 * links と link_status を結合したデータ構造
 */
export interface UserLink {
  // link_status のカラム
  status_id: string;
  user_id: string;
  status: TriageStatus | null;
  triaged_at: string | null;
  read_at: string | null;
  saved_at: string | null;

  // links のカラム
  link_id: string;
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  favicon_url: string | null;
  site_name: string | null;
  link_created_at: string | null;
}

/**
 * get_user_links RPC のパラメータ
 */
export interface GetUserLinksParams {
  /** 1ページあたりの件数 (デフォルト: 20) */
  pageSize?: number;
  /** ページ番号 (0始まり、デフォルト: 0) */
  page?: number;
}

/**
 * get_user_links RPC のレスポンス
 */
export interface GetUserLinksResponse {
  /** リンク一覧 */
  data: UserLink[];
  /** 次のページが存在するか */
  hasMore: boolean;
  /** 総件数 */
  totalCount: number;
}

/**
 * UserLink の Zod スキーマ
 */
export const userLinkSchema = z.object({
  status_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(["inbox", "keep", "archived", "dismissed"]).nullable(),
  triaged_at: z.string().nullable(),
  read_at: z.string().nullable(),
  saved_at: z.string().nullable(),
  link_id: z.string().uuid(),
  url: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  favicon_url: z.string().nullable(),
  site_name: z.string().nullable(),
  link_created_at: z.string().nullable(),
});

/**
 * GetUserLinksResponse の Zod スキーマ
 */
export const getUserLinksResponseSchema = z.object({
  data: z.array(userLinkSchema),
  hasMore: z.boolean(),
  totalCount: z.number(),
});
