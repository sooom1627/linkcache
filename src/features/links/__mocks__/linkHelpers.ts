import type { UserLink } from "../types/linkList.types";

/**
 * テスト用のモックリンクデータを作成するヘルパー関数
 *
 * @overload
 * @param id - リンクのID（数値または文字列）
 * @param overrides - オーバーライドするフィールド（オプショナル）
 * @returns UserLink型のモックデータ
 *
 * @overload
 * @param url - リンクのURL（デフォルト: "https://example.com"）
 * @param status - リンクのステータス（デフォルト: "read_soon"）
 * @returns UserLink型のモックデータ
 */
export function createMockLink(
  id: number | string,
  overrides?: Partial<UserLink>,
): UserLink;
export function createMockLink(
  url?: string,
  status?: "new" | "read_soon" | "stock" | "done" | null,
): UserLink;
export function createMockLink(
  idOrUrl: number | string = "https://example.com",
  overridesOrStatus?:
    | Partial<UserLink>
    | "new"
    | "read_soon"
    | "stock"
    | "done"
    | null,
): UserLink {
  // idベースの呼び出し判定：
  // - 第1引数が数値の場合
  // - 第1引数が文字列で、第2引数がstatus文字列またはオブジェクトの場合
  const isIdBasedCall =
    typeof idOrUrl === "number" ||
    (typeof idOrUrl === "string" &&
      overridesOrStatus !== undefined &&
      (typeof overridesOrStatus === "object" ||
        overridesOrStatus === "new" ||
        overridesOrStatus === "read_soon" ||
        overridesOrStatus === "stock" ||
        overridesOrStatus === "done" ||
        overridesOrStatus === null));

  if (isIdBasedCall) {
    const id = idOrUrl;
    const idStr = String(id);
    const paddedId = idStr.padStart(2, "0");

    // 第2引数がstatus文字列の場合
    const statusOverride =
      typeof overridesOrStatus === "string" || overridesOrStatus === null
        ? { status: overridesOrStatus }
        : {};

    // 第2引数がオブジェクトの場合
    const objectOverrides =
      typeof overridesOrStatus === "object" && overridesOrStatus !== null
        ? overridesOrStatus
        : {};

    return {
      status_id: `status-${id}`,
      user_id: "user-1",
      status: "new",
      triaged_at: null,
      read_at: null,
      saved_at: `2024-01-${paddedId}T00:00:00Z`,
      link_id: `link-${id}`,
      url: `https://example${id}.com`,
      title: `Example ${id}`,
      description: `Description ${id}`,
      image_url: null,
      favicon_url: null,
      site_name: `Site ${id}`,
      link_created_at: `2024-01-${paddedId}T00:00:00Z`,
      ...statusOverride,
      ...objectOverrides,
    };
  }

  // URLベースの呼び出し（後方互換性のため）
  // 第1引数が文字列で、第2引数がundefinedの場合
  const url = idOrUrl as string;
  const status =
    (overridesOrStatus as "new" | "read_soon" | "stock" | "done" | null) ||
    "read_soon";

  return {
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
  };
}
