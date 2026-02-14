import "@gorhom/bottom-sheet/mock";
import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

// React Queryのテスト用設定
import { notifyManager } from "@tanstack/react-query";

// Mock react-native-worklets before any library that depends on it (e.g. @gorhom/bottom-sheet)
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock"),
);

// テスト環境では非同期更新を同期的に処理
notifyManager.setScheduler((fn) => fn());

// Create a stable t function to avoid infinite loops in useEffect dependencies
const t = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t,
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  Feather: "Feather",
}));

// Mock expo-font
jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock("expo-router", () => {
  const { Text } = require("react-native");
  const Link = (props: Record<string, unknown>) => Text(props);
  Link.Trigger = Text;
  Link.Menu = Text;
  Link.MenuAction = Text;
  Link.Preview = Text;
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    Link,
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
