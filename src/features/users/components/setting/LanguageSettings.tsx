import { useState } from "react";

import { Alert, Text, TouchableOpacity, View } from "react-native";

import { useTranslation } from "react-i18next";

import {
  languageSettings,
  type LanguageSetting,
} from "../../../../shared/constants/languages";
import { setLanguage } from "../../../../shared/utils/langSetting";

export default function LanguageSettings() {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    i18n.language,
  );

  const handleSelectLanguage = async (language: LanguageSetting) => {
    if (!language.isReady) return;

    try {
      await setLanguage(language.code);
      setSelectedLanguage(language.code);
    } catch (error) {
      console.error("言語変更エラー:", error);
      Alert.alert("Error", "Failed to change language. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <View className="w-full flex-col items-start justify-start gap-2">
      <View className="w-full flex-row items-center justify-between gap-2">
        <Text className="font-bold text-slate-500">Language</Text>
      </View>
      <View className="w-full flex-row flex-wrap items-center justify-start gap-2">
        {languageSettings.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleSelectLanguage(language)}
            disabled={!language.isReady}
            className={`min-w-[40%] flex-1 flex-col flex-wrap items-center justify-start gap-2 rounded-lg border bg-slate-100
            p-4 ${selectedLanguage === language.code ? "border-blue-500" : "border-slate-200"} ${!language.isReady ? "opacity-50" : ""}`}
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
