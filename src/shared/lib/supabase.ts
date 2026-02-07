import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase公式推奨のSecureStoreAdapter実装
 * @see https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
 *
 * Expo SecureStoreを使用して、認証セッションを安全に保存します。
 * - iOS: Keychain Services
 * - Android: Keystore system
 *
 * 注意事項:
 * - SecureStoreには2048バイトの制限があります
 * - Supabaseの認証トークンは通常この範囲内に収まります
 * - 万が一制限を超える場合は警告を表示します
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (value.length > 2048) {
      console.warn(
        `Value being stored in SecureStore is larger than 2048 bytes (${value.length} bytes). ` +
          "It may not be stored successfully. Consider using a different storage solution.",
      );
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    storageKey: "supabase.session", // Share Extensionと同じキー名を指定
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
