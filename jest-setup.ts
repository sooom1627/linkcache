import "@gorhom/bottom-sheet/mock";
import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

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
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));
