import Toast from "react-native-toast-message";

/**
 * 成功トーストを表示する
 * @param message - 表示するメッセージ
 */
export function showToastSuccess(message: string): void {
  Toast.show({
    type: "success",
    text1: message,
  });
}

/**
 * エラートーストを表示する
 * @param title - タイトル（省略時は message のみ表示）
 * @param message - メッセージ（省略可）
 */
export function showToastError(title: string, message?: string): void {
  Toast.show({
    type: "error",
    text1: title,
    ...(message && { text2: message }),
  });
}
