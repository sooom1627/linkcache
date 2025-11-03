import type { SupportedLang } from "../utils/langSetting";

/**
 * 言語設定の型定義
 */
export interface LanguageSetting {
  name: string;
  code: SupportedLang;
  text: string;
  flag: string;
  isReady: boolean;
}

/**
 * サポートされている言語設定一覧
 *
 * isReady: true - 翻訳ファイルが実装済みで使用可能
 * isReady: false - 将来的にサポート予定
 */
export const languageSettings: LanguageSetting[] = [
  {
    name: "English",
    code: "en",
    text: "Hello!",
    flag: "🇬🇧",
    isReady: true,
  },
  {
    name: "Japanese",
    code: "ja",
    text: "こんにちは！",
    flag: "🇯🇵",
    isReady: true,
  },
  {
    name: "French",
    code: "fr" as SupportedLang, // 将来的にサポート予定
    text: "Bonjour!",
    flag: "🇫🇷",
    isReady: false,
  },
  {
    name: "German",
    code: "de" as SupportedLang, // 将来的にサポート予定
    text: "Hallo!",
    flag: "🇩🇪",
    isReady: false,
  },
];
