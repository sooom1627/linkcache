const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Polyfill for buffer (required by react-native-svg 15.15+)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve("buffer/"),
};

module.exports = withNativeWind(config, {
  input: "./assets/styles/global.css",
  inlineVariables: false,
  globalClassNamePolyfill: false,
});
