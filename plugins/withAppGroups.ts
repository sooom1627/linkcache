import type { ConfigPlugin } from "@expo/config-plugins";
import { withEntitlementsPlist } from "@expo/config-plugins";

/**
 * App Groups entitlement 設定の型
 */
interface WithAppGroupsOptions {
  /** App Group ID の配列 */
  appGroups: string[];
}

/**
 * iOS App Groups capability を追加する Config Plugin
 *
 * このプラグインは以下を行います:
 * 1. メインアプリの entitlements に App Groups を追加
 * 2. 必要な capability を有効化
 *
 * @param config Expo 設定オブジェクト
 * @param options App Groups 設定
 * @returns 更新された設定オブジェクト
 *
 * @example
 * ```javascript
 * // app.config.js
 * plugins: [
 *   ["./plugins/withAppGroups", {
 *     appGroups: ["group.com.sooom.linkcache.dev"]
 *   }]
 * ]
 * ```
 */
const withAppGroups: ConfigPlugin<WithAppGroupsOptions> = (config, options) => {
  const { appGroups } = options;

  if (!appGroups || appGroups.length === 0) {
    console.warn("withAppGroups: No appGroups provided, skipping...");
    return config;
  }

  // Entitlements に App Groups を追加
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.security.application-groups"] = appGroups;
    return config;
  });

  return config;
};

export default withAppGroups;
