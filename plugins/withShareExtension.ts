import * as fs from "fs";
import * as path from "path";

import type { ConfigPlugin } from "@expo/config-plugins";
import { withDangerousMod, withXcodeProject } from "@expo/config-plugins";

/**
 * Share Extension 設定の型
 */
interface WithShareExtensionOptions {
  /** Share Extension の名前 */
  extensionName: string;
  /** App Group ID */
  appGroupId: string;
  /** Bundle Identifier */
  bundleIdentifier: string;
}

/**
 * iOS Share Extension ターゲットを追加する Config Plugin
 *
 * このプラグインは以下を行います:
 * 1. Xcodeプロジェクトに ShareExtension ターゲットを追加
 * 2. 必要なソースファイル、リソース、entitlements を設定
 * 3. ビルド設定を構成
 *
 * @param config Expo 設定オブジェクト
 * @param options Share Extension 設定
 * @returns 更新された設定オブジェクト
 */
const withShareExtension: ConfigPlugin<WithShareExtensionOptions> = (
  config,
  options,
) => {
  const { extensionName, appGroupId, bundleIdentifier } = options;

  // Xcode プロジェクトにターゲットを追加
  config = withXcodeProject(config, async (config) => {
    const pbxProject = config.modResults;
    const platformProjectRoot = config.modRequest.platformProjectRoot;

    // ShareExtension ターゲットの追加
    const target = pbxProject.addTarget(
      extensionName,
      "app_extension",
      extensionName,
      `${bundleIdentifier}.${extensionName}`,
    );

    if (!target) {
      throw new Error("Failed to add ShareExtension target");
    }

    // PBXSourcesBuildPhase を追加（ソースファイル用）
    pbxProject.addBuildPhase(
      [],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid,
    );

    // PBXResourcesBuildPhase を追加（リソースファイル用）
    pbxProject.addBuildPhase(
      [],
      "PBXResourcesBuildPhase",
      "Resources",
      target.uuid,
    );

    // PBXFrameworksBuildPhase を追加（フレームワーク用）
    pbxProject.addBuildPhase(
      [],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      target.uuid,
    );

    // ShareExtension 用の PBXGroup を作成
    const pbxGroupKey = pbxProject.pbxCreateGroup(extensionName, extensionName);

    // ファイルパスの定義
    const infoPlistPath = `${extensionName}/Info.plist`;
    const entitlementsPath = `${extensionName}/${extensionName}.entitlements`;
    const viewControllerPath = `${extensionName}/ShareViewController.swift`;

    // Info.plist を追加（ビルドフェーズには含めない）
    pbxProject.addFile(infoPlistPath, pbxGroupKey);

    // Entitlements を追加
    pbxProject.addFile(entitlementsPath, pbxGroupKey);

    // ShareViewController.swift を追加
    pbxProject.addSourceFile(
      viewControllerPath,
      { target: target.uuid },
      pbxGroupKey,
    );

    // ビルド設定を構成
    const configurations = pbxProject.pbxXCBuildConfigurationSection();
    const currentProjectVersion = config.ios?.buildNumber || "1";
    const marketingVersion = config.version || "1.0.0";

    for (const key in configurations) {
      if (typeof configurations[key].buildSettings !== "undefined") {
        const buildSettings = configurations[key].buildSettings;

        if (
          typeof buildSettings["PRODUCT_NAME"] !== "undefined" &&
          buildSettings["PRODUCT_NAME"] === `"${extensionName}"`
        ) {
          buildSettings["CLANG_ENABLE_MODULES"] = "YES";
          buildSettings["INFOPLIST_FILE"] = `"${infoPlistPath}"`;
          buildSettings["CODE_SIGN_ENTITLEMENTS"] = `"${entitlementsPath}"`;
          buildSettings["CODE_SIGN_STYLE"] = "Automatic";
          buildSettings["CURRENT_PROJECT_VERSION"] =
            `"${currentProjectVersion}"`;
          buildSettings["GENERATE_INFOPLIST_FILE"] = "NO";
          buildSettings["MARKETING_VERSION"] = `"${marketingVersion}"`;
          buildSettings["PRODUCT_BUNDLE_IDENTIFIER"] =
            `"${bundleIdentifier}.${extensionName}"`;
          buildSettings["SWIFT_EMIT_LOC_STRINGS"] = "YES";
          buildSettings["SWIFT_VERSION"] = "5.0";
          buildSettings["TARGETED_DEVICE_FAMILY"] = `"1,2"`;
          buildSettings["IPHONEOS_DEPLOYMENT_TARGET"] = "15.0";
        }
      }
    }

    return config;
  });

  // ShareExtension のファイルをコピー
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const sourceDir = path.join(
        config.modRequest.projectRoot,
        "targets",
        "share-extension",
      );
      const targetDir = path.join(platformProjectRoot, extensionName);

      // ターゲットディレクトリを作成
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // ShareViewController.swift をコピー（App Group ID を動的に設定）
      const viewControllerSource = fs.readFileSync(
        path.join(sourceDir, "ShareViewController.swift"),
        "utf-8",
      );
      const viewControllerUpdated = viewControllerSource.replace(
        /private let appGroupId = ".*"/,
        `private let appGroupId = "${appGroupId}"`,
      );
      fs.writeFileSync(
        path.join(targetDir, "ShareViewController.swift"),
        viewControllerUpdated,
      );

      // Info.plist をコピー
      fs.copyFileSync(
        path.join(sourceDir, "Info.plist"),
        path.join(targetDir, "Info.plist"),
      );

      // Entitlements をコピー（App Group ID を動的に設定）
      const entitlementsSource = fs.readFileSync(
        path.join(sourceDir, "ShareExtension.entitlements"),
        "utf-8",
      );
      const entitlementsUpdated = entitlementsSource.replace(
        /<string>group\.com\.sooom\.linkcache\.dev<\/string>/,
        `<string>${appGroupId}</string>`,
      );
      fs.writeFileSync(
        path.join(targetDir, `${extensionName}.entitlements`),
        entitlementsUpdated,
      );

      return config;
    },
  ]);

  return config;
};

export default withShareExtension;
