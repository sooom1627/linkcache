import type { ProfileSetupErrors } from "../types/ProfileSetupSchema";

/**
 * user_idのヘルパーテキストを生成
 */
export function getUserIdHelperText(
  userId: string,
  isCheckingUserId: boolean,
  checkError: unknown,
  isUserIdAvailable: boolean | undefined,
): { text: string; color: string } | undefined {
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
 */
export function isSubmitEnabled(
  isPending: boolean,
  isCheckingUserId: boolean,
  isUserIdAvailable: boolean | undefined,
  userId: string,
  username: string,
  errors: ProfileSetupErrors,
): boolean {
  return (
    !isPending &&
    !isCheckingUserId &&
    isUserIdAvailable === true &&
    userId.length >= 4 &&
    username.length >= 4 &&
    !errors.user_id &&
    !errors.username
  );
}
