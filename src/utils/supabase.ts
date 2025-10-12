import * as SecureStore from "expo-secure-store";

import { createClient } from "@supabase/supabase-js";

import { config } from "@/src/config";

/**
 * Supabase公式推奨のSecureStore実装
 * @see https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
 *
 * SecureStoreを使用して、認証トークンを安全に保存します。
 * - iOS: Keychain Services
 * - Android: Keystore system
 *
 * 制限事項:
 * - 保存可能なデータサイズは2048バイトまで
 * - Supabaseの認証トークンは通常この範囲内
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
