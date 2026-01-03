import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OgpMetadata } from "./metadata";

/**
 * AsyncStorage用のキャッシュエントリ型
 */
interface CacheEntry {
  data: OgpMetadata;
  timestamp: number;
}

/**
 * キャッシュキーのプレフィックス
 */
const CACHE_KEY_PREFIX = "ogp_cache_";

/**
 * キャッシュの有効期限（30日間）
 */
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * AsyncStorageからOGPメタデータを取得
 *
 * @param url - 対象URL
 * @returns キャッシュされたメタデータ、存在しないか期限切れの場合はnull
 */
export async function getCachedOgpMetadata(
  url: string
): Promise<OgpMetadata | null> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${url}`;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const { data, timestamp }: CacheEntry = JSON.parse(cached);

    // キャッシュ期限をチェック
    const now = Date.now();
    if (now - timestamp >= CACHE_DURATION_MS) {
      // 期限切れの場合は削除
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error("OGPキャッシュの取得に失敗しました:", error);
    return null;
  }
}

/**
 * AsyncStorageにOGPメタデータを保存
 *
 * @param url - 対象URL
 * @param metadata - 保存するメタデータ
 */
export async function setCachedOgpMetadata(
  url: string,
  metadata: OgpMetadata
): Promise<void> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${url}`;
    const cacheEntry: CacheEntry = {
      data: metadata,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error("OGPキャッシュの保存に失敗しました:", error);
    // エラーが発生しても処理は続行（キャッシュはオプショナル）
  }
}

/**
 * 特定のURLのキャッシュを削除
 *
 * @param url - 対象URL
 */
export async function clearCachedOgpMetadata(url: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${url}`;
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.error("OGPキャッシュの削除に失敗しました:", error);
  }
}

/**
 * すべてのOGPキャッシュを削除（デバッグ用）
 */
export async function clearAllOgpCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ogpKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(ogpKeys);
  } catch (error) {
    console.error("OGPキャッシュの一括削除に失敗しました:", error);
  }
}

