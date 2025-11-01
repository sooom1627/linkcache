import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../constants/locales/en.json";
import ja from "../constants/locales/ja.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: "en", // 既定は固定でen
  fallbackLng: "en",
  resources: { en: { translation: en }, ja: { translation: ja } },
  interpolation: { escapeValue: false },
});

export default i18n;
