const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// pnpm のシンボリックリンク構造で react-native-toast-message が解決できない場合の対策
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};
config.resolver.extraNodeModules["react-native-toast-message"] = path.resolve(
  __dirname,
  "node_modules/react-native-toast-message",
);

module.exports = withNativeWind(config, {
  input: "./assets/styles/global.css",
});
