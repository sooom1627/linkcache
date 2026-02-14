import React from "react";

import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  StyleSheet,
} from "react-native";

import { Link as RouterLink } from "expo-router";

import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";
import { GestureHandlerRootView as RNGestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string },
) => {
  // @ts-expect-error: useCssElement union type too complex for TS
  return useCssElement(RouterLink, props, { className: "style" });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCssVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string },
) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => {
  // @ts-expect-error: useCssElement union type too complex for TS
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TouchableOpacity
export const TouchableOpacity = (
  props: React.ComponentProps<typeof RNTouchableOpacity> & {
    className?: string;
  },
) => {
  return useCssElement(RNTouchableOpacity, props, { className: "style" });
};
TouchableOpacity.displayName = "CSS(TouchableOpacity)";

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => {
  return useCssElement(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: React.ComponentProps<typeof RNTouchableHighlight>,
) {
  // @ts-expect-error: underlayColor is extracted from flattened style for TouchableHighlight
  const { underlayColor, ...style } = StyleSheet.flatten(props.style) || {};
  return (
    <RNTouchableHighlight
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight>,
) => {
  return useCssElement(XXTouchableHighlight, props, { className: "style" });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  },
) => {
  // @ts-expect-error: useCssElement union type too complex for TS
  return useCssElement(Animated.ScrollView, props, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  });
};

// SafeAreaView
export const SafeAreaView = (
  props: React.ComponentProps<typeof RNSafeAreaView> & { className?: string },
) => {
  return useCssElement(RNSafeAreaView, props, { className: "style" });
};
SafeAreaView.displayName = "CSS(SafeAreaView)";

// KeyboardAvoidingView
export const KeyboardAvoidingView = (
  props: React.ComponentProps<typeof RNKeyboardAvoidingView> & {
    className?: string;
  },
) => {
  return useCssElement(RNKeyboardAvoidingView, props, { className: "style" });
};
KeyboardAvoidingView.displayName = "CSS(KeyboardAvoidingView)";

// GestureHandlerRootView
export const GestureHandlerRootView = (
  props: React.ComponentProps<typeof RNGestureHandlerRootView> & {
    className?: string;
  },
) => {
  return useCssElement(RNGestureHandlerRootView, props, {
    className: "style",
  });
};
GestureHandlerRootView.displayName = "CSS(GestureHandlerRootView)";
