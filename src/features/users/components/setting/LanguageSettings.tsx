import { useState } from "react";

import { Text, TouchableOpacity, View } from "react-native";

interface LanguageSetting {
  name: string;
  code: string;
  text: string;
  flag: string;
  isReady: boolean;
}

const LANGUAGE_SETTINGS = [
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
];

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const handleSelectLanguage = (language: LanguageSetting) => {
    setSelectedLanguage(language.code);
  };
  return (
    <View className="w-full flex-col items-start justify-start gap-2">
      <View className="w-full flex-row items-center justify-between gap-2">
        <Text className="font-bold text-slate-500">Language</Text>
      </View>
      <View className="w-full flex-row flex-wrap items-center justify-start gap-2">
        {LANGUAGE_SETTINGS.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleSelectLanguage(language)}
            disabled={!language.isReady}
            className={`min-w-[40%] flex-1 flex-col flex-wrap items-center justify-start gap-2 rounded-lg border bg-slate-100
            p-4 ${selectedLanguage === language.code ? "border-blue-500" : "border-slate-200"}`}
          >
            <Text className="font-bold text-slate-700">
              {language.flag} {language.name}
            </Text>
            <Text className="text-slate-500">{language.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
