/**
 * Share Extension ターゲット設定
 *
 * @bacons/apple-targets 用の設定ファイル
 * @see https://github.com/EvanBacon/expo-apple-targets
 */

/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "share",
  name: "ShareExtension",
  // Share Sheet に表示される名前
  displayName: "Shift",
  // iOS 17.0 以上を対象（2026年推奨）
  deploymentTarget: "17.0",
  // App Group entitlements (メインアプリと共有)
  entitlements: {
    "com.apple.security.application-groups": ["group.com.sooom.linkcache.dev"],
  },
  // 使用するフレームワーク
  frameworks: ["UIKit", "UniformTypeIdentifiers"],
};
