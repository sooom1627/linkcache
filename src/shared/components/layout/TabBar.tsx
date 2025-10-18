import { TouchableOpacity, View } from "react-native";

import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View
      className="absolute bottom-12 w-10/12 flex-row items-center justify-around self-center rounded-full border border-white/30 bg-white/10 px-8 py-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            className="px-4 py-2"
          >
            {options.tabBarIcon?.({
              color: isFocused ? "white" : "rgba(255,255,255,0.5)",
              size: 24,
              focused: isFocused,
            })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
