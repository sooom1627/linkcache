/**
 * ファイル操作に関するユーティリティ関数
 */

/**
 * MIMEタイプから拡張子を取得
 * @param mimeType - MIMEタイプ（例: "image/jpeg"）
 * @returns ファイル拡張子（例: "jpg"）
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/avif": "avif",
  };
  return mimeToExt[mimeType] || "jpg";
}

/**
 * ファイルURIをArrayBufferに変換
 * @param fileUri - ローカルファイルURI
 * @returns ArrayBuffer
 */
export async function convertFileToArrayBuffer(
  fileUri: string,
): Promise<ArrayBuffer> {
  const res = await fetch(fileUri);
  const blob = await res.blob();
  return blob.arrayBuffer();
}
