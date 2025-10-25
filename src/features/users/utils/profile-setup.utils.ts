import type { ProfileSetupErrors } from "../types/ProfileSetupSchema";

/**
 * user_idのヘルパーテキストを生成
 *
 * @param userId - チェックするuser_id
 * @param isCheckingUserId - チェック中かどうか
 * @param checkError - チェック時のエラー
 * @param isUserIdAvailable - user_idが利用可能かどうか
 * @param originalUserId - 元のuser_id（プロフィール編集時に指定。元のIDと同じ場合はヘルパーテキストを表示しない）
 * @returns ヘルパーテキストとカラー、または undefined
 */
export function getUserIdHelperText(
  userId: string,
  isCheckingUserId: boolean,
  checkError: unknown,
  isUserIdAvailable: boolean | undefined,
  originalUserId?: string,
): { text: string; color: string } | undefined {
  // 元のIDと同じ場合はヘルパーテキスト不要（プロフィール編集時）
  if (originalUserId !== undefined && userId === originalUserId) {
    return undefined;
  }

  // 最小文字数未満の場合は表示しない
  if (userId.length < 4) return undefined;

  if (isCheckingUserId) {
    return { text: "Checking availability...", color: "text-gray-500" };
  }

  if (checkError) {
    return { text: "Error checking availability", color: "text-red-600" };
  }

  if (isUserIdAvailable) {
    return { text: "✓ Available", color: "text-green-600" };
  }

  return { text: "✗ Already taken", color: "text-red-600" };
}

/**
 * 送信ボタンの有効/無効判定
 *
 * @param isPending - 処理中かどうか
 * @param isUserIdAvailable - user_idが利用可能かどうか（undefined: 未チェック, true: 利用可能, false: 利用不可）
 * @param userId - 入力されたuser_id
 * @param username - 入力されたusername
 * @param errors - バリデーションエラー
 * @param shouldCheckUserId - user_id重複チェックが必要かどうか（プロフィール編集時にuser_idが変更されている場合）
 * @returns ボタンが有効かどうか
 */
export function isSubmitEnabled(
  isPending: boolean,
  isUserIdAvailable: boolean | undefined,
  userId: string,
  username: string,
  errors: ProfileSetupErrors,
  shouldCheckUserId?: boolean,
): boolean {
  // 処理中は無効
  if (isPending) return false;

  // 空文字チェック（バリデーションは空文字をスキップするため）
  if (!userId || !username) return false;

  // バリデーションエラーがある場合は無効
  if (errors.user_id || errors.username) return false;

  // user_idチェックが必要な場合、利用不可の時のみ無効
  if (shouldCheckUserId && isUserIdAvailable === false) return false;

  // チェック不要な場合は、利用不可でない限り有効
  if (!shouldCheckUserId && isUserIdAvailable === false) return false;

  return true;
}
