import { colors } from "@/src/shared/constants/colors";
import Stack from "expo-router/stack";
import { ArrowLeft } from "lucide-react-native";

export default function LinksLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.screen, flex: 1 },
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" 
        options={{ 
          title: "Links", 
          headerLeft: () => <ArrowLeft size={24} color={colors.main} 
        />}} 
      />
    </Stack>
  );
}
