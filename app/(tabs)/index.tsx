import { useEffect } from "react";

import { Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/src/shared/utils/supabase";

export default function Index() {
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from("_test").select("*").limit(1);
      if (error && error.message.includes("public._test")) {
        console.log("✅ Supabase接続成功（テーブルが存在しないだけ）");
      } else if (error) {
        console.log("❌ エラー:", error);
      } else {
        console.log("✅ Supabase接続成功:", data);
      }
    } catch (err) {
      console.log("❌ 接続エラー:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text className="text-red-500">
          Edit app/index.tsx to edit this screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}
