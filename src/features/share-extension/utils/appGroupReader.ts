import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";

import AppGroupDirectory from "react-native-app-group-directory";

import {
  appGroupIdDev,
  appGroupIdProd,
  sharedItemExtension,
  sharedItemsDirectory,
} from "../constants/appGroup";
import type { SharedItem } from "../types/sharedItem.types";

import { parseSharedItem } from "./sharedItem";

/**
 * 現在の環境に応じた App Group ID を取得する
 *
 * @returns App Group ID
 */
export function getAppGroupId(): string {
  const extra = Constants.expoConfig?.extra as
    | { eas?: { environment?: string } }
    | undefined;
  const environment = extra?.eas?.environment;
  const isProduction = environment === "production";

  return isProduction ? appGroupIdProd : appGroupIdDev;
}

/**
 * SharedItems ディレクトリのパスを取得する
 *
 * @returns SharedItems ディレクトリのパス、取得できない場合は null
 */
export function getSharedItemsPath(): string | null {
  const appGroupId = getAppGroupId();
  const containerPath: string | null =
    AppGroupDirectory.getAppGroupDirectory(appGroupId);

  if (!containerPath) {
    console.warn("App Group container not available");
    return null;
  }

  return `${containerPath}/${sharedItemsDirectory}`;
}

/**
 * App Group から未処理の共有アイテムを読み取る
 *
 * Share Extension が保存した JSON ファイルを読み取り、
 * 有効な SharedItem の配列として返します。
 *
 * @returns 未処理の共有アイテムの配列
 */
export async function readPendingSharedItems(): Promise<SharedItem[]> {
  const sharedItemsPath = getSharedItemsPath();

  if (!sharedItemsPath) {
    return [];
  }

  try {
    // ディレクトリの存在確認
    const dirInfo = await FileSystem.getInfoAsync(sharedItemsPath);
    if (!dirInfo.exists || !dirInfo.isDirectory) {
      return [];
    }

    // ディレクトリ内のファイル一覧を取得
    const files = await FileSystem.readDirectoryAsync(sharedItemsPath);

    // .json ファイルのみをフィルタ
    const jsonFiles = files.filter((file) =>
      file.endsWith(sharedItemExtension),
    );

    // 各ファイルを読み取ってパース
    const items: SharedItem[] = [];

    for (const fileName of jsonFiles) {
      try {
        const filePath = `${sharedItemsPath}/${fileName}`;
        const content = await FileSystem.readAsStringAsync(filePath);
        const item = parseSharedItem(content);

        if (item) {
          items.push(item);
        }
      } catch (error) {
        // 個別ファイルの読み取りエラーはスキップして続行
        console.warn(`Failed to read shared item file: ${fileName}`, error);
      }
    }

    return items;
  } catch (error) {
    console.error("Failed to read pending shared items", error);
    return [];
  }
}

/**
 * 処理済みの共有アイテムファイルを削除する
 *
 * @param itemId 削除するアイテムの ID
 */
export async function deleteProcessedItem(itemId: string): Promise<void> {
  const sharedItemsPath = getSharedItemsPath();

  if (!sharedItemsPath) {
    return;
  }

  const filePath = `${sharedItemsPath}/${itemId}${sharedItemExtension}`;

  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  } catch (error) {
    // 削除エラーは警告のみ（ファイルが既に削除されている場合もある）
    console.warn(`Failed to delete processed item: ${itemId}`, error);
  }
}
