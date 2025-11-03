import { File } from "expo-file-system";

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

export async function convertFileToArrayBuffer(
  fileUri: string,
): Promise<ArrayBuffer> {
  const file = new File(fileUri);
  return file.arrayBuffer();
}
