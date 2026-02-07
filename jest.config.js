module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest-setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gorhom/bottom-sheet)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "test-utils.tsx"],
  moduleNameMapper: {
    "^react-native-app-group-directory$":
      "<rootDir>/src/features/share-extension/__mocks__/react-native-app-group-directory.ts",
  },
};
