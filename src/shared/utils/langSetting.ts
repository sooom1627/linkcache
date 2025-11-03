import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n from "./i18n";

const KEY = "lang";
const SUPPORTED_LANGS = ["en", "ja"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function isValidLang(lang: string | null): lang is SupportedLang {
  return lang !== null && SUPPORTED_LANGS.includes(lang as SupportedLang);
}

export async function initLanguageFromStorage() {
  try {
    const storedLang = await AsyncStorage.getItem(KEY);

    // 保存された値を検証
    const lang = isValidLang(storedLang) ? storedLang : "en";

    if (i18n.language !== lang) {
      await i18n.changeLanguage(lang);
    }

    // 無効な値が保存されていた場合は修正
    if (storedLang !== lang) {
      await AsyncStorage.setItem(KEY, lang);
    }

    return lang;
  } catch (error) {
    console.warn("言語設定の読み込みに失敗しました:", error);
    try {
      await AsyncStorage.setItem(KEY, "en");
    } catch (e) {
      console.error("デフォルト言語の保存に失敗しました:", e);
    }
    return "en";
  }
}

export async function setLanguage(lang: SupportedLang) {
  try {
    await AsyncStorage.setItem(KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error("言語設定の保存に失敗しました:", error);
    throw error; // 上位で処理できるようにエラーを伝播
  }
}

export function getCurrentLanguage(): SupportedLang {
  const currentLang = i18n.language;
  return isValidLang(currentLang) ? currentLang : "en";
}
