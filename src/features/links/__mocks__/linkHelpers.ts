import type { UserLink } from "../types/linkList.types";

/**
 * テスト用のモックリンクデータを作成するヘルパー関数
 *
 * @param url - リンクのURL（デフォルト: "https://example.com"）
 * @param status - リンクのステータス（デフォルト: "read_soon"）
 * @returns UserLink型のモックデータ
 */
export const createMockLink = (
  url: string = "https://example.com",
  status: "inbox" | "read_soon" | "later" | null = "read_soon",
): UserLink => ({
  status_id: "status-1",
  user_id: "user-1",
  status,
  triaged_at: null,
  read_at: null,
  saved_at: "2024-01-01T00:00:00Z",
  link_id: "link-1",
  url,
  title: "Example Title",
  description: "Example Description",
  image_url: null,
  favicon_url: null,
  site_name: "Example Site",
  link_created_at: "2024-01-01T00:00:00Z",
});
