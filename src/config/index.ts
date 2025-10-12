import Constants from "expo-constants";

interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export const config: Config = {
  supabaseUrl: extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    extra.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

// 環境変数の検証
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key must be provided in environment variables:\n" +
      "EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY",
  );
}
