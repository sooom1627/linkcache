/**
 * Share Extension 機能モジュール
 *
 * iOS Share Extension とメインアプリ間でのデータ共有を提供します。
 */

// 型エクスポート
export type {
  SharedItem,
  ProcessedSharedItemResult,
} from "./types/sharedItem.types";

// 定数エクスポート
export {
  appGroupIdDev,
  appGroupIdProd,
  sharedItemsDirectory,
  sharedItemExtension,
} from "./constants/appGroup";

// ユーティリティエクスポート
export {
  parseSharedItem,
  validateSharedItem,
  isValidSharedItem,
} from "./utils/sharedItem";

export {
  getAppGroupId,
  getSharedItemsPath,
  readPendingSharedItems,
  deleteProcessedItem,
} from "./utils/appGroupReader";

// フックエクスポート
export { usePendingSharedLinks } from "./hooks/usePendingSharedLinks";
