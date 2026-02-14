import { useState } from "react";

import { Alert } from "react-native";

import { useTranslation } from "react-i18next";

import { Text, TouchableOpacity, View } from "@/src/tw";

import {
  isReadyLanguageSetting,
  languageSettings,
  type LanguageSetting,
} from "../../../../shared/constants/languages";
import { setLanguage } from "../../../../shared/utils/langSetting";

export default function LanguageSettings() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    i18n.language,
  );

  const handleSelectLanguage = async (language: LanguageSetting) => {
    // 型ガードで実装済み言語かチェック
    if (!isReadyLanguageSetting(language)) return;

    try {
      await setLanguage(language.code);
      setSelectedLanguage(language.code);
    } catch (error) {
      console.error("Language change error:", error);
      Alert.alert(
        t("users.setting_modal.locale_setting.error_title"),
        t("users.setting_modal.locale_setting.error_message"),
        [{ text: "OK" }],
      );
    }
  };

  return (
    <View className="w-full flex-col items-start justify-start gap-2">
      <View className="w-full flex-row items-center justify-between gap-2">
        <Text className="font-bold text-slate-500">
          {t("users.setting_modal.locale_setting.language")}
        </Text>
      </View>
      <View className="w-full flex-row flex-wrap items-center justify-start gap-2">
        {languageSettings.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleSelectLanguage(language)}
            disabled={!language.isReady}
            className={`bg-surface-muted min-w-[40%] flex-1 flex-col flex-wrap items-center justify-start gap-2 rounded-lg border
            p-4 ${selectedLanguage === language.code ? "border-accent" : "border-slate-200"} ${!language.isReady ? "opacity-50" : ""}`}
          >
            <Text className="w-full text-left font-bold text-slate-700">
              {language.flag} {language.name}{" "}
              <Text className="font-normal text-slate-500">
                {!language.isReady && "(Not Ready)"}
              </Text>
            </Text>
            <Text className="w-full text-left text-slate-500">
              {language.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
