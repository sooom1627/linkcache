import { z } from "zod";

import type { Database } from "./supabase.types";

/**
 * Triage Status Enum
 */
export type TriageStatus = Database["public"]["Enums"]["triage_status"];

/**
 * タブタイプ（ダッシュボード用）
 */
export type TabType = "read_soon" | "latest";

/**
 * orderBy パラメータの許可リスト
 *
 * RPC `get_user_links` で使用可能なソート順を定義します。
 * 未検証の値がRPCに渡されると、SQLエラーの原因となる可能性があるため、
 * このスキーマで検証してから渡します。
 */
export const orderBySchema = z
  .enum(["triaged_at_asc", "created_at_desc"])
  .nullable();

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

  // links のカラム
  link_id: string;
  url: string;
  title: string | null;
  /** 説明文（get_user_links RPCではegress削減のため返されない） */
  description?: string | null;
  image_url: string | null;
  favicon_url: string | null;
  site_name: string | null;
  link_created_at: string | null;
}

/**
 * リンクフィルタパラメータ（クエリキーとフック用）
 */
export interface LinkFilterParams {
  /** ステータスフィルタ (undefinedで全件) */
  status?: TriageStatus;
  /** 既読状態フィルタ (true=既読, false=未読, undefinedで全件) */
  isRead?: boolean;
  /** 件数制限 (ページング無視、undefinedでページング使用) */
  limit?: number;
  /** ソート順 (デフォルト: null) */
  orderBy?: string | null;
}

/**
 * get_user_links RPC のパラメータ
 */
export interface GetUserLinksParams extends LinkFilterParams {
  /** 1ページあたりの件数 (デフォルト: 20) */
  pageSize?: number;
  /** ページ番号 (0始まり、デフォルト: 0) */
  page?: number;
  /** ソート順 (デフォルト: null) */
  orderBy?: string | null;
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
 * get_user_links_count RPC のパラメータ
 */
export interface GetLinkCountParams {
  /** ステータスフィルタ (undefinedで全件) */
  status?: TriageStatus;
  /** 既読状態フィルタ (true=既読, false=未読, undefinedで全件) */
  isRead?: boolean;
}

/**
 * get_user_links_count RPC のレスポンス
 */
export interface GetLinkCountResponse {
  /** 総件数 */
  count: number;
}

/**
 * UserLink の Zod スキーマ
 */
export const userLinkSchema = z.object({
  status_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(["new", "read_soon", "stock", "done"]).nullable(),
  triaged_at: z.string().nullable(),
  read_at: z.string().nullable(),
  link_id: z.string().uuid(),
  url: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable().optional(),
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

/**
 * GetLinkCountResponse の Zod スキーマ
 */
export const getLinkCountResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});
