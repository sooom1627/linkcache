import type { SupportedLang } from "../utils/langSetting";

/**
 * 実装済みの言語設定（翻訳ファイルあり）
 */
const readyLanguages = [
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
] as const satisfies ReadonlyArray<{
  name: string;
  code: SupportedLang;
  text: string;
  flag: string;
  isReady: true;
}>;

/**
 * 将来サポート予定の言語設定
 */
const upcomingLanguages = [
  {
    name: "French",
    code: "fr",
    text: "Bonjour!",
    flag: "🇫🇷",
    isReady: false,
  },
  {
    name: "German",
    code: "de",
    text: "Hallo!",
    flag: "🇩🇪",
    isReady: false,
  },
] as const;

/**
 * 全ての言語設定（実装済み＋予定）
 */
export const languageSettings = [
  ...readyLanguages,
  ...upcomingLanguages,
] as const;

/**
 * 言語コード型（全ての言語を含む）
 */
export type LanguageCode = (typeof languageSettings)[number]["code"];

/**
 * 言語設定の型定義
 */
export interface LanguageSetting {
  readonly name: string;
  readonly code: LanguageCode;
  readonly text: string;
  readonly flag: string;
  readonly isReady: boolean;
}

/**
 * 実装済み言語設定の型定義
 */
export interface ReadyLanguageSetting {
  readonly name: string;
  readonly code: SupportedLang;
  readonly text: string;
  readonly flag: string;
  readonly isReady: true;
}

/**
 * 型安全な言語設定配列
 */
export const languages: readonly LanguageSetting[] = languageSettings;

/**
 * 言語コードが実装済みかチェック（型ガード）
 */
export function isReadyLanguage(code: LanguageCode): code is SupportedLang {
  return code === "en" || code === "ja";
}

/**
 * 言語設定が実装済みかチェック（型ガード）
 */
export function isReadyLanguageSetting(
  language: LanguageSetting,
): language is ReadyLanguageSetting {
  return language.isReady && isReadyLanguage(language.code);
}

/**
 * 実装済みの言語設定のみを取得
 */
export function getReadyLanguages(): readonly ReadyLanguageSetting[] {
  return readyLanguages;
}
