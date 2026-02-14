import type { ViewProps } from "react-native";

import { useCssElement } from "react-native-css";
import RNAnimated from "react-native-reanimated";

type AnimatedViewProps = ViewProps & {
  className?: string;
  entering?: unknown;
  exiting?: unknown;
  layout?: unknown;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
  [key: string]: unknown;
};

// CSS-enabled Animated.View using useCssElement directly on RNAnimated.View
// This avoids double-wrapping issues from createAnimatedComponent(TW.View)
const AnimatedView = (props: AnimatedViewProps) => {
  return useCssElement(RNAnimated.View, props, { className: "style" });
};
AnimatedView.displayName = "CSS(Animated.View)";

export const Animated = {
  ...RNAnimated,
  View: AnimatedView,
};
