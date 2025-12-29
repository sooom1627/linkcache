/**
 * リンク貼り付け機能の状態
 */
export type LinkPasteStatus =
  | "empty" // 初期状態、リンクなし
  | "loading" // クリップボードから読み取り中 / OGP取得中
  | "preview" // OGP取得成功、プレビュー表示
  | "invalid" // 無効なURL
  | "noOgp"; // 有効なURLだがOGP取得失敗

/**
 * リンクプレビューデータ
 */
export interface LinkPreview {
  /** 正規化されたURL */
  url: string;
  /** OGタイトル */
  title: string | null;
  /** OG画像URL */
  imageUrl: string | null;
  /** サイト名 */
  siteName: string | null;
  /** ドメイン名（例: example.com） */
  domain: string;
  /** ファビコンURL */
  faviconUrl: string | null;
}

/**
 * useLinkPasteフックの戻り値
 */
export interface UseLinkPasteReturn {
  /** 現在の状態 */
  status: LinkPasteStatus;
  /** プレビューデータ（preview/noOgp状態時） */
  preview: LinkPreview | null;
  /** エラーメッセージ（invalid状態時） */
  errorMessage: string | null;
  /** クリップボードからURLを貼り付け */
  pasteFromClipboard: () => Promise<void>;
  /** URLを直接更新（編集時） */
  updateUrl: (url: string) => void;
  /** 状態をリセット */
  reset: () => void;
  /** 保存可能かどうか */
  canSave: boolean;
}

