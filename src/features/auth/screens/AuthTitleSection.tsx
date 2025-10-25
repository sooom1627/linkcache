import { Text, View } from "react-native";

import { Link, type Href } from "expo-router";

interface AuthTitleSectionProps {
  title: string;
  subtitle: string;
  link: Href;
  linkText: string;
}

export default function AuthTitleSection({
  title,
  subtitle,
  link,
  linkText,
}: AuthTitleSectionProps) {
  return (
    <View className="mb-8 flex w-full flex-col items-center justify-center gap-2 px-4">
      <Text className="text-2xl font-bold text-slate-800">{title}</Text>
      <Text className="text-slate-700">
        {subtitle}{" "}
        <Link href={link} className="text-blue-500 underline">
          {linkText}
        </Link>
      </Text>
    </View>
  );
}
